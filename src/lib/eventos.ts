/**
 * Eventos de conversión (docs/05-arquitectura.md).
 *
 * Todas las funciones son seguras de llamar siempre: si no hay píxel cargado
 * —porque no hay ID configurado o porque la persona no aceptó cookies— no
 * hacen nada y no lanzan error.
 */

type Fbq = (accion: string, evento: string, datos?: Record<string, unknown>) => void
type Gtag = (accion: string, evento: string, datos?: Record<string, unknown>) => void

function fbq(): Fbq | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { fbq?: Fbq }).fbq ?? null
}

function gtag(): Gtag | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { gtag?: Gtag }).gtag ?? null
}

const MONEDA = 'CLP'

export function verProducto(id: string, nombre: string, valor: number) {
  fbq()?.('track', 'ViewContent', {
    content_ids: [id],
    content_name: nombre,
    content_type: 'product',
    value: valor,
    currency: MONEDA,
  })
  gtag()?.('event', 'view_item', {
    currency: MONEDA,
    value: valor,
    items: [{ item_id: id, item_name: nombre, price: valor }],
  })
}

export function agregarAlCarrito(id: string, nombre: string, valor: number) {
  fbq()?.('track', 'AddToCart', {
    content_ids: [id],
    content_name: nombre,
    content_type: 'product',
    value: valor,
    currency: MONEDA,
  })
  gtag()?.('event', 'add_to_cart', {
    currency: MONEDA,
    value: valor,
    items: [{ item_id: id, item_name: nombre, price: valor }],
  })
}

export function iniciarCheckout(valor: number, unidades: number) {
  fbq()?.('track', 'InitiateCheckout', {
    value: valor,
    currency: MONEDA,
    num_items: unidades,
  })
  gtag()?.('event', 'begin_checkout', { currency: MONEDA, value: valor })
}

/** Se dispara en /pago/exito con el valor REAL leído del servidor. */
export function compraConfirmada(numeroPedido: number, valor: number) {
  fbq()?.('track', 'Purchase', {
    value: valor,
    currency: MONEDA,
    content_type: 'product',
  })
  gtag()?.('event', 'purchase', {
    transaction_id: String(numeroPedido),
    currency: MONEDA,
    value: valor,
  })
}
