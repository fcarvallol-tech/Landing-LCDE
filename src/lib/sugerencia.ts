import { CATALOGO, type IdProducto } from '@/lib/catalogo'
import { calcularTotales } from '@/lib/precios'
import { ENVIO_GRATIS_DESDE } from '@/lib/logistica'

/**
 * Qué sugerir en la pantalla de compra para llegar al despacho gratis
 * (docs/12-rediseno.md §4 y docs/04 "palanca de conversión").
 *
 * La regla es simple y la misma para todos:
 *  - Si ya hay despacho gratis, nada.
 *  - Si en la compra todavía no hay un reloj, el reloj: es el complemento
 *    natural de los packs sin reloj, y con cualquiera de ellos cruza $40.000.
 *  - Si ya hay reloj (Pack IM, Pack GM o el reloj suelto), el Pack Tradicional:
 *    un segundo tablero es lo único que tiene sentido sumar.
 *  - Nunca algo agotado ni algo que ya está en la compra.
 */

/** Productos que ya traen reloj. */
const TRAEN_RELOJ: readonly IdProducto[] = ['im', 'gm', 'reloj']

export type Sugerencia = {
  id: IdProducto
  /** true si sumarlo alcanza para el despacho gratis. */
  daEnvioGratis: boolean
}

export function sugerenciaParaEnvioGratis(
  lineas: Partial<Record<IdProducto, number>>,
  agotados: ReadonlySet<IdProducto>,
): Sugerencia | null {
  const items = (Object.entries(lineas) as [IdProducto, number][])
    .filter(([, n]) => n > 0)
    .map(([id, cantidad]) => ({ id, cantidad }))

  const { subtotal } = calcularTotales(items)
  if (items.length === 0 || subtotal >= ENVIO_GRATIS_DESDE) return null

  const yaTieneReloj = items.some((i) => TRAEN_RELOJ.includes(i.id))
  const candidato: IdProducto = yaTieneReloj ? 'tradicional' : 'reloj'

  if (agotados.has(candidato) || (lineas[candidato] ?? 0) > 0) return null

  return {
    id: candidato,
    daEnvioGratis: subtotal + CATALOGO[candidato].precio >= ENVIO_GRATIS_DESDE,
  }
}
