import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '@/lib/env'

/**
 * Integración con Mercado Pago — Checkout Pro.
 *
 * Se habla con la API REST directamente en vez de usar el SDK: son dos
 * llamadas (crear preferencia y consultar pago) y así no agregamos una
 * dependencia más a la superficie de ataque (docs/06-seguridad.md §9).
 *
 * Contrastado con la documentación oficial vigente:
 *  · POST https://api.mercadopago.com/checkout/preferences
 *    https://www.mercadopago.cl/developers/es/reference/online-payments/checkout-pro/preferences/create-preference/post
 *  · Validación de la firma del webhook
 *    https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/notifications/webhooks
 */

const API = 'https://api.mercadopago.com'

// ── Crear preferencia ───────────────────────────────────────────────────────

export type ItemPreferencia = {
  id: string
  title: string
  quantity: number
  unit_price: number
}

export type ResultadoPreferencia = {
  id: string
  /** URL a la que se redirige a la persona. Sirve igual en prueba y producción:
   *  la documentación dice explícitamente que no se use sandbox_init_point. */
  init_point: string
}

export async function crearPreferencia(opciones: {
  pedidoId: string
  numeroPedido: number
  items: ItemPreferencia[]
  costoEnvio: number
  comprador: { nombre: string; email: string; telefono: string }
  urlSitio: string
}): Promise<ResultadoPreferencia> {
  const { MP_ACCESS_TOKEN } = env()

  // El costo de despacho viaja como un ítem más. Es la forma más transparente:
  // la persona ve el desglose completo en la pantalla de Mercado Pago y el
  // total que cobra MP calza exactamente con el total del pedido.
  const items: ItemPreferencia[] = [...opciones.items]
  if (opciones.costoEnvio > 0) {
    items.push({
      id: 'despacho',
      title: 'Despacho a domicilio',
      quantity: 1,
      unit_price: opciones.costoEnvio,
    })
  }

  // El teléfono viene normalizado como +569XXXXXXXX.
  const soloDigitos = opciones.comprador.telefono.replace(/\D/g, '')

  const cuerpo = {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      // CLP no tiene decimales: los precios van como enteros.
      unit_price: Math.round(item.unit_price),
      currency_id: 'CLP',
      category_id: 'toys',
    })),
    payer: {
      name: opciones.comprador.nombre.slice(0, 60),
      email: opciones.comprador.email,
      phone: {
        area_code: '56',
        number: soloDigitos.slice(2) || soloDigitos,
      },
    },
    back_urls: {
      success: `${opciones.urlSitio}/pago/exito?pedido=${opciones.pedidoId}`,
      pending: `${opciones.urlSitio}/pago/pendiente?pedido=${opciones.pedidoId}`,
      failure: `${opciones.urlSitio}/pago/error?pedido=${opciones.pedidoId}`,
    },
    auto_return: 'approved',
    notification_url: `${opciones.urlSitio}/api/webhooks/mercadopago`,
    // Es como el webhook encuentra el pedido. Máximo 64 caracteres,
    // solo números, letras, guiones y guiones bajos: un UUID cabe justo.
    external_reference: opciones.pedidoId,
    statement_descriptor: 'CASAESTRATEGA',
    metadata: { numero_pedido: opciones.numeroPedido },
  }

  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      // Evita que un reintento de red cree dos preferencias para el mismo pedido.
      'X-Idempotency-Key': opciones.pedidoId,
    },
    body: JSON.stringify(cuerpo),
    cache: 'no-store',
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    throw new Error(
      `Mercado Pago rechazó la preferencia (HTTP ${respuesta.status}): ${detalle.slice(0, 400)}`,
    )
  }

  const datos: unknown = await respuesta.json()
  if (
    typeof datos !== 'object' ||
    datos === null ||
    typeof (datos as { id?: unknown }).id !== 'string' ||
    typeof (datos as { init_point?: unknown }).init_point !== 'string'
  ) {
    throw new Error('Mercado Pago respondió sin init_point')
  }

  return {
    id: (datos as { id: string }).id,
    init_point: (datos as { init_point: string }).init_point,
  }
}

// ── Consultar un pago ───────────────────────────────────────────────────────

export type PagoMP = {
  id: number
  status: string
  status_detail: string | null
  /** El id de nuestro pedido. */
  external_reference: string | null
  /** Monto realmente aprobado. Es el que se compara con el total del pedido. */
  transaction_amount: number | null
  currency_id: string | null
  live_mode: boolean
}

/**
 * Consulta el estado REAL de un pago (docs/06-seguridad.md §3).
 *
 * El cuerpo de la notificación del webhook nunca se usa como fuente de verdad:
 * solo dice "mira el pago X". Quién dice si está aprobado es esta consulta.
 */
export async function obtenerPago(paymentId: string): Promise<PagoMP | null> {
  const { MP_ACCESS_TOKEN } = env()

  const respuesta = await fetch(
    `${API}/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      cache: 'no-store',
    },
  )

  if (respuesta.status === 404) return null
  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    throw new Error(
      `No se pudo consultar el pago en Mercado Pago (HTTP ${respuesta.status}): ${detalle.slice(0, 300)}`,
    )
  }

  const datos = (await respuesta.json()) as Record<string, unknown>

  return {
    id: Number(datos.id),
    status: String(datos.status ?? ''),
    status_detail: datos.status_detail ? String(datos.status_detail) : null,
    external_reference: datos.external_reference ? String(datos.external_reference) : null,
    transaction_amount:
      typeof datos.transaction_amount === 'number' ? datos.transaction_amount : null,
    currency_id: datos.currency_id ? String(datos.currency_id) : null,
    live_mode: Boolean(datos.live_mode),
  }
}

// ── Validación de la firma del webhook ──────────────────────────────────────

/**
 * Valida la cabecera `x-signature` (docs/06-seguridad.md §3).
 *
 * Procedimiento oficial, tal como lo publica Mercado Pago:
 *
 *  1. La cabecera viene como `ts=1704908010,v1=618c8534...`. Se parte por coma
 *     y se saca `ts` (timestamp en milisegundos) y `v1` (la firma).
 *  2. Se arma el manifiesto con esta plantilla exacta:
 *         id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
 *     - `data.id` sale del query param de la URL, no del cuerpo.
 *     - Si `data.id` viene con mayúsculas, se pasa a minúsculas antes de usarlo.
 *     - Si falta `data.id` o `x-request-id`, ese trozo se OMITE del manifiesto
 *       completo (incluyendo su etiqueta), no se deja vacío.
 *  3. HMAC-SHA256 en hexadecimal, con la clave secreta como llave.
 *  4. Se compara con `v1`, en tiempo constante.
 *
 * Devuelve false ante cualquier duda. Firma inválida → 401 sin procesar nada.
 */
export function validarFirmaWebhook(opciones: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
  /** Tolerancia de antigüedad de la notificación, en milisegundos. */
  toleranciaMs?: number
}): { valida: boolean; motivo?: string } {
  const { MP_WEBHOOK_SECRET } = env()
  const { xSignature, xRequestId, dataId } = opciones

  if (!xSignature) return { valida: false, motivo: 'sin cabecera x-signature' }

  // 1. Desarmar la cabecera.
  let ts: string | null = null
  let v1: string | null = null

  for (const parte of xSignature.split(',')) {
    const separador = parte.indexOf('=')
    if (separador < 0) continue
    const clave = parte.slice(0, separador).trim()
    const valor = parte.slice(separador + 1).trim()
    if (clave === 'ts') ts = valor
    else if (clave === 'v1') v1 = valor
  }

  if (!ts || !v1) return { valida: false, motivo: 'x-signature mal formada' }

  // 2. Armar el manifiesto. Los trozos ausentes se omiten enteros.
  const trozos: string[] = []
  if (dataId) trozos.push(`id:${dataId.toLowerCase()};`)
  if (xRequestId) trozos.push(`request-id:${xRequestId};`)
  trozos.push(`ts:${ts};`)
  const manifiesto = trozos.join('')

  // 3. Calcular la contrafirma.
  const calculada = createHmac('sha256', MP_WEBHOOK_SECRET)
    .update(manifiesto)
    .digest('hex')

  // 4. Comparar en tiempo constante.
  const esperado = Buffer.from(calculada, 'utf8')
  const recibido = Buffer.from(v1, 'utf8')

  if (esperado.length !== recibido.length) {
    return { valida: false, motivo: 'firma no coincide' }
  }
  if (!timingSafeEqual(esperado, recibido)) {
    return { valida: false, motivo: 'firma no coincide' }
  }

  // Extra: rechazar notificaciones muy viejas para cortar reenvíos maliciosos.
  const tolerancia = opciones.toleranciaMs ?? 15 * 60 * 1000
  const marca = Number(ts)
  if (Number.isFinite(marca) && tolerancia > 0) {
    // El timestamp viene en milisegundos, pero se ha visto en segundos:
    // se normaliza mirando la magnitud.
    const enMs = marca > 1e12 ? marca : marca * 1000
    if (Math.abs(Date.now() - enMs) > tolerancia) {
      return { valida: false, motivo: 'notificación fuera de plazo' }
    }
  }

  return { valida: true }
}
