import { NextResponse, type NextRequest } from 'next/server'
import { obtenerPago, validarFirmaWebhook } from '@/lib/mercadopago'
import {
  confirmarPago,
  marcarEstado,
  obtenerPedido,
  type ResultadoConfirmacion,
} from '@/lib/datos'
import { correoAlAdmin, correoAlComprador } from '@/lib/correo'
import { ipDe, verificarLimite } from '@/lib/limite'

/**
 * POST /api/webhooks/mercadopago
 *
 * Cadena de confianza (docs/05 §6 y docs/06 §3):
 *
 *   1. Se valida la firma `x-signature`. Inválida → 401 y no se procesa nada.
 *   2. Recién ahí se consulta la API de Mercado Pago por el payment_id. El
 *      estado real sale de esa consulta, NUNCA del cuerpo de la notificación:
 *      el cuerpo solo dice "anda a mirar el pago X".
 *   3. La confirmación ocurre dentro de una transacción de Postgres que es
 *      idempotente, compara el monto y descuenta el stock de forma atómica.
 *   4. Se responde 200 rápido. Los correos no bloquean la respuesta.
 *
 * Mercado Pago espera el 200 en menos de 22 segundos y reintenta cada 15
 * minutos si no lo recibe. Por eso todo lo lento va después de responder.
 *
 * Este endpoint queda fuera del proxy de autenticación (tiene que poder
 * llamarlo Mercado Pago), pero sí tiene rate limiting.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Holgado: MP reintenta legítimamente, no queremos bloquear reintentos reales. */
const MAX_LLAMADAS = 120
const VENTANA_MS = 60 * 1000

export async function POST(peticion: NextRequest) {
  const ip = ipDe(peticion.headers)
  const limite = verificarLimite(`webhook:${ip}`, MAX_LLAMADAS, VENTANA_MS)
  if (!limite.permitido) {
    return new NextResponse(null, {
      status: 429,
      headers: { 'Retry-After': String(limite.reintentarEn) },
    })
  }

  const url = new URL(peticion.url)

  // El cuerpo se lee, pero solo para saber el tipo de evento y, como respaldo,
  // el id del pago. El estado nunca sale de acá.
  let cuerpo: Record<string, unknown> = {}
  try {
    cuerpo = (await peticion.json()) as Record<string, unknown>
  } catch {
    cuerpo = {}
  }

  // `data.id` para el manifiesto de la firma sale del query string, según la
  // documentación oficial de Mercado Pago.
  const dataIdUrl = url.searchParams.get('data.id') ?? url.searchParams.get('id')

  // ── 1. Firma ──────────────────────────────────────────────────────────────
  let firma: { valida: boolean; motivo?: string }
  try {
    firma = validarFirmaWebhook({
      xSignature: peticion.headers.get('x-signature'),
      xRequestId: peticion.headers.get('x-request-id'),
      dataId: dataIdUrl,
    })
  } catch (fallo) {
    // Falta MP_WEBHOOK_SECRET: no podemos validar, así que no procesamos.
    console.error('[webhook] no se pudo validar la firma:', mensajeDe(fallo))
    return new NextResponse(null, { status: 401 })
  }

  if (!firma.valida) {
    console.warn(`[webhook] firma rechazada: ${firma.motivo}`)
    return new NextResponse(null, { status: 401 })
  }

  // ── Qué evento es ─────────────────────────────────────────────────────────
  const tipo =
    (typeof cuerpo.type === 'string' ? cuerpo.type : null) ??
    url.searchParams.get('type') ??
    url.searchParams.get('topic')

  // Solo nos interesan los pagos. El resto se acusa recibo y se ignora, para
  // que Mercado Pago no reintente eternamente.
  if (tipo !== 'payment') {
    return NextResponse.json({ recibido: true }, { status: 200 })
  }

  const datos = cuerpo.data as { id?: unknown } | undefined
  const paymentId =
    dataIdUrl ?? (datos && datos.id !== undefined ? String(datos.id) : null)

  if (!paymentId) {
    return NextResponse.json({ recibido: true }, { status: 200 })
  }

  // ── 2. Estado real, desde la API de Mercado Pago ──────────────────────────
  let pago
  try {
    pago = await obtenerPago(paymentId)
  } catch (fallo) {
    console.error('[webhook] falló la consulta del pago:', mensajeDe(fallo))
    // 500 para que Mercado Pago reintente: el problema es nuestro, no suyo.
    return new NextResponse(null, { status: 500 })
  }

  if (!pago) {
    // Un pago que no existe no vuelve a existir: 200 para cortar reintentos.
    console.warn('[webhook] Mercado Pago no conoce ese pago.')
    return NextResponse.json({ recibido: true }, { status: 200 })
  }

  const pedidoId = pago.external_reference
  if (!pedidoId) {
    console.warn('[webhook] el pago no trae external_reference.')
    return NextResponse.json({ recibido: true }, { status: 200 })
  }

  // ── 3. Aplicar el estado ──────────────────────────────────────────────────
  if (pago.status !== 'approved') {
    // Pagos rechazados o cancelados: se marca el pedido y se cierra. Un pedido
    // ya pagado nunca se degrada (la consulta filtra por estado 'pendiente').
    if (pago.status === 'rejected' || pago.status === 'cancelled') {
      try {
        await marcarEstado(
          pedidoId,
          pago.status === 'rejected' ? 'rechazado' : 'cancelado',
        )
      } catch (fallo) {
        console.error('[webhook] no se pudo marcar el pedido:', mensajeDe(fallo))
      }
    }
    // 'pending' / 'in_process': no se hace nada, ya llegará el aviso final.
    return NextResponse.json({ recibido: true }, { status: 200 })
  }

  // La moneda tiene que ser CLP. Si no lo es, algo está muy mal: no se toca
  // el stock y se avisa.
  if (pago.currency_id && pago.currency_id !== 'CLP') {
    console.error(`[webhook] moneda inesperada: ${pago.currency_id}`)
    return NextResponse.json({ recibido: true }, { status: 200 })
  }

  const montoPagado = Math.round(pago.transaction_amount ?? 0)

  let resultado: ResultadoConfirmacion
  try {
    resultado = await confirmarPago(pedidoId, String(pago.id), montoPagado)
  } catch (fallo) {
    console.error('[webhook] falló la confirmación del pago:', mensajeDe(fallo))
    return new NextResponse(null, { status: 500 })
  }

  // Webhook repetido: Mercado Pago reintenta y esto es lo esperado.
  // El stock ya se descontó exactamente una vez.
  if (resultado === 'ya_procesado') {
    return NextResponse.json({ recibido: true, estado: resultado }, { status: 200 })
  }

  if (resultado === 'pedido_no_encontrado' || resultado === 'pago_de_otro_pedido') {
    console.error(`[webhook] no se pudo asociar el pago: ${resultado}`)
    return NextResponse.json({ recibido: true, estado: resultado }, { status: 200 })
  }

  // ── 4. Correos: después de responder, sin bloquear ────────────────────────
  // `waitUntil` no está garantizado en todos los entornos, así que se dispara
  // la promesa y se responde igual. Un correo que falla no puede hacer que
  // Mercado Pago crea que el pago no se registró.
  void notificar(pedidoId, resultado).catch((fallo) => {
    console.error('[webhook] fallaron los correos:', mensajeDe(fallo))
  })

  return NextResponse.json({ recibido: true, estado: resultado }, { status: 200 })
}

async function notificar(pedidoId: string, resultado: ResultadoConfirmacion) {
  const pedido = await obtenerPedido(pedidoId)
  if (!pedido) return

  if (resultado === 'pagado') {
    await Promise.allSettled([correoAlComprador(pedido), correoAlAdmin(pedido)])
    return
  }

  if (resultado === 'pagado_sin_stock') {
    // El pago entró pero no hay producto. Nunca se pierde en silencio:
    // le avisamos a Felipe para que contacte y devuelva (docs/02 §6).
    await correoAlAdmin(
      pedido,
      'PAGO RECIBIDO SIN STOCK. Hay que contactar al comprador y devolver el dinero o coordinar una alternativa.',
    )
    return
  }

  if (resultado === 'monto_no_coincide') {
    await correoAlAdmin(
      pedido,
      'EL MONTO PAGADO NO COINCIDE con el total del pedido. Quedó en estado "revisar" y NO se descontó stock. Revísalo antes de entregar.',
    )
  }
}

function mensajeDe(fallo: unknown): string {
  return fallo instanceof Error ? fallo.message : String(fallo)
}

/** Mercado Pago a veces verifica la URL con un GET. Que no dé 404. */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 })
}
