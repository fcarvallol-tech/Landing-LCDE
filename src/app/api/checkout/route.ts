import { NextResponse, type NextRequest } from 'next/server'
import { esquemaCheckout, MS_MINIMO_FORMULARIO } from '@/lib/validacion'
import { calcularTotales } from '@/lib/precios'
import { CATALOGO } from '@/lib/catalogo'
import { crearPedido, guardarPreferencia, verificarDisponibilidad } from '@/lib/datos'
import { crearPreferencia } from '@/lib/mercadopago'
import { ipDe, verificarLimite } from '@/lib/limite'
import { SITIO_URL } from '@/lib/sitio'

/**
 * POST /api/checkout — crea el pedido y la preferencia de pago.
 *
 * El flujo exacto de docs/05-arquitectura.md §4:
 *   a. Validar el payload con Zod (comuna contra la lista blanca incluida).
 *   b. Rate limiting y honeypot.
 *   c. Recalcular precios desde el catálogo del servidor.
 *   d. Verificar stock (sin descontar).
 *   e. Crear el pedido en Supabase en estado `pendiente`.
 *   f. Crear la preferencia en Mercado Pago.
 *   g. Devolver SOLO el init_point.
 *
 * Lo que este endpoint nunca hace: confiar en un precio que venga del cliente.
 * El esquema es `.strict()`, así que un `precio` o un `total` en el cuerpo no
 * se ignora silenciosamente: hace fallar la petición entera.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_INTENTOS = 5
const VENTANA_MS = 10 * 60 * 1000

function error(mensaje: string, estado: number, campos?: Record<string, string>) {
  return NextResponse.json({ mensaje, ...(campos ? { campos } : {}) }, { status: estado })
}

export async function POST(peticion: NextRequest) {
  // ── b. Rate limiting ──────────────────────────────────────────────────────
  const ip = ipDe(peticion.headers)
  const limite = verificarLimite(`checkout:${ip}`, MAX_INTENTOS, VENTANA_MS)

  if (!limite.permitido) {
    return NextResponse.json(
      {
        mensaje:
          'Recibimos varios intentos seguidos. Espera unos minutos y vuelve a probar, o escríbenos por WhatsApp.',
      },
      { status: 429, headers: { 'Retry-After': String(limite.reintentarEn) } },
    )
  }

  // ── a. Validación ─────────────────────────────────────────────────────────
  let crudo: unknown
  try {
    crudo = await peticion.json()
  } catch {
    return error('No pudimos leer el pedido. Recarga la página e inténtalo de nuevo.', 400)
  }

  const analisis = esquemaCheckout.safeParse(crudo)

  if (!analisis.success) {
    const campos: Record<string, string> = {}
    for (const problema of analisis.error.issues) {
      // El formulario nombra los campos sin el prefijo "cliente."/"consentimientos.".
      const ruta = problema.path
      const ultimo = ruta[ruta.length - 1]
      const nombre =
        ultimo === 'terminos'
          ? 'terminos'
          : typeof ultimo === 'string'
            ? ultimo
            : String(ruta.join('.'))
      if (!campos[nombre]) campos[nombre] = problema.message
    }

    return error('Revisa los datos marcados y vuelve a intentar.', 400, campos)
  }

  const datos = analisis.data

  // ── b. Honeypot y time trap ───────────────────────────────────────────────
  // Un bot llenó el campo invisible. Respondemos 200 con una URL falsa para no
  // enseñarle qué lo delató, pero no creamos ningún pedido.
  if (datos.apellidoSegundo.trim().length > 0) {
    return NextResponse.json({ url: `${SITIO_URL}/pago/error` }, { status: 200 })
  }

  if (datos.tiempoFormulario > 0 && datos.tiempoFormulario < MS_MINIMO_FORMULARIO) {
    return error(
      'Eso fue demasiado rápido. Revisa tus datos y vuelve a enviar el formulario.',
      400,
    )
  }

  // ── c. Recalcular precios en el servidor ──────────────────────────────────
  // Esta es la única aritmética que existe. Sale del catálogo del servidor.
  const totales = calcularTotales(datos.items)

  if (totales.lineas.length === 0 || totales.total <= 0) {
    return error('Tu carrito está vacío.', 400)
  }

  // ── d. Verificar stock, sin descontar ─────────────────────────────────────
  try {
    const disponibilidad = await verificarDisponibilidad(datos.items)

    if (!disponibilidad.ok) {
      const nombres = disponibilidad.faltantes
        .map((f) => {
          const nombre = CATALOGO[f.id].nombre
          return f.disponible === 0
            ? `${nombre} (agotado)`
            : `${nombre} (quedan ${f.disponible})`
        })
        .join(', ')

      return error(
        `Se nos acabó el stock mientras comprabas: ${nombres}. Ajusta tu carrito e inténtalo de nuevo.`,
        409,
      )
    }
  } catch (fallo) {
    console.error('[checkout] no se pudo verificar el stock:', mensajeDe(fallo))
    return error(
      'No pudimos confirmar la disponibilidad en este momento. Inténtalo en unos minutos.',
      503,
    )
  }

  // ── e. Crear el pedido en estado pendiente ────────────────────────────────
  const cliente = datos.cliente
  let pedido: { id: string; numero: number }

  try {
    pedido = await crearPedido({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      comuna: cliente.comuna,
      direccion: cliente.direccion,
      depto: cliente.depto,
      referencia: cliente.referencia,
      horario_preferido: cliente.horarioPreferido,
      es_regalo: cliente.esRegalo,
      mensaje_regalo: cliente.esRegalo ? cliente.mensajeRegalo : null,
      subtotal: totales.subtotal,
      costo_envio: totales.costoEnvio,
      total: totales.total,
      acepta_terminos: datos.consentimientos.terminos,
      acepta_marketing: datos.consentimientos.marketing,
      items: totales.lineas.map((linea) => ({
        producto_id: linea.id,
        // Foto del nombre y del precio al momento de comprar.
        nombre: linea.nombre,
        precio_unit: linea.precioUnitario,
        cantidad: linea.cantidad,
      })),
    })
  } catch (fallo) {
    console.error('[checkout] no se pudo crear el pedido:', mensajeDe(fallo))
    return error(
      'No pudimos registrar tu pedido. Inténtalo de nuevo o escríbenos por WhatsApp.',
      503,
    )
  }

  // ── f. Crear la preferencia en Mercado Pago ───────────────────────────────
  try {
    const preferencia = await crearPreferencia({
      pedidoId: pedido.id,
      numeroPedido: pedido.numero,
      items: totales.lineas.map((linea) => ({
        id: linea.id,
        title: linea.nombre,
        quantity: linea.cantidad,
        unit_price: linea.precioUnitario,
      })),
      costoEnvio: totales.costoEnvio,
      comprador: {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
      },
      urlSitio: SITIO_URL,
    })

    await guardarPreferencia(pedido.id, preferencia.id)

    // ── g. Solo el init_point sale de acá ───────────────────────────────────
    return NextResponse.json(
      { url: preferencia.init_point, pedido: pedido.numero },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (fallo) {
    // Se loguea el número del pedido, nunca los datos personales (docs/06 §8).
    console.error(
      `[checkout] pedido #${pedido.numero}: falló la preferencia de pago:`,
      mensajeDe(fallo),
    )
    return error(
      'No pudimos conectar con Mercado Pago. Tu pedido quedó guardado: escríbenos por WhatsApp y lo resolvemos.',
      502,
    )
  }
}

function mensajeDe(fallo: unknown): string {
  return fallo instanceof Error ? fallo.message : String(fallo)
}
