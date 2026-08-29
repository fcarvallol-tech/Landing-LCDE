/**
 * Datos del sitio que necesitan tanto el servidor como el cliente.
 * Ojo: acá no puede entrar ningún secreto. Solo variables NEXT_PUBLIC_*.
 */

export const SITIO_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null

export const TITULO = 'Packs de ajedrez para regalar — La Casa del Estratega'
export const DESCRIPCION =
  'Packs de ajedrez desde $15.990, entregados personalmente en la zona oriente de Santiago. Despacho gratis sobre $40.000 y pago seguro con Mercado Pago.'
