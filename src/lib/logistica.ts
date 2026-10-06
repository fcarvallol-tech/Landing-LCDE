/**
 * Cobertura y despacho (docs/04-logistica.md).
 *
 * Solo estas 9 comunas. La entrega la hace Felipe en persona.
 * Estas constantes son la única definición: cámbialas acá y cambian en toda
 * la aplicación (página, formulario, validación del servidor y correos).
 */

export const COMUNAS = [
  'Peñalolén',
  'La Reina',
  'Las Condes',
  'Ñuñoa',
  'Santiago Centro',
  'Providencia',
  'Vitacura',
  'Lo Barnechea',
  'Huechuraba',
] as const

export type Comuna = (typeof COMUNAS)[number]

export function esComunaValida(valor: unknown): valor is Comuna {
  return typeof valor === 'string' && (COMUNAS as readonly string[]).includes(valor)
}

/** Umbral de despacho gratis, sobre el SUBTOTAL de productos (antes del envío). */
export const ENVIO_GRATIS_DESDE = 39990

/** Costo de despacho bajo el umbral. */
export const COSTO_ENVIO = 3990

/** Límites anti-abuso del carrito (docs/06-seguridad.md §2). */
export const MAX_CANTIDAD_POR_SKU = 10
export const MAX_ITEMS_POR_PEDIDO = 20

export const HORARIOS_PREFERIDOS = ['mañana', 'tarde', 'indiferente'] as const
export type HorarioPreferido = (typeof HORARIOS_PREFERIDOS)[number]

export const ETIQUETA_HORARIO: Record<HorarioPreferido, string> = {
  'mañana': 'En la mañana',
  tarde: 'En la tarde',
  indiferente: 'Me da lo mismo',
}

/** Redacción autorizada de plazos (docs/04-logistica.md). No prometer más que esto. */
export const TEXTO_PLAZO =
  'Te escribimos por WhatsApp dentro de 24 horas para coordinar día y hora de entrega. La mayoría de los pedidos llega en 1 a 3 días hábiles.'

/** La franja de cobertura, tal cual la pide docs/04-logistica.md. */
export const TEXTO_COBERTURA = `Entregamos personalmente en ${COMUNAS.slice(0, -1).join(', ')} y ${COMUNAS[COMUNAS.length - 1]}.`
