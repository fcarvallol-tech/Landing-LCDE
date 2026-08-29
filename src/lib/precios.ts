import { CATALOGO, type IdProducto } from '@/lib/catalogo'
import { COSTO_ENVIO, ENVIO_GRATIS_DESDE } from '@/lib/logistica'

/**
 * Cálculo de totales (docs/06-seguridad.md §2).
 *
 * Esta función solo recibe `id` y `cantidad`. No existe forma de pasarle un
 * precio: los precios salen exclusivamente de CATALOGO. El servidor llama a
 * esto y el resultado es el único total que se cobra y se guarda.
 *
 * Se usa también en el cliente para pintar el carrito, pero el número que
 * manda es siempre el que recalcula el servidor.
 */

export type LineaCarrito = { id: IdProducto; cantidad: number }

export type LineaCalculada = {
  id: IdProducto
  nombre: string
  precioUnitario: number
  cantidad: number
  total: number
}

export type Totales = {
  lineas: LineaCalculada[]
  /** Suma de productos, antes del despacho. */
  subtotal: number
  costoEnvio: number
  total: number
  /** Cuánto falta para el despacho gratis. 0 si ya se alcanzó. */
  faltaParaEnvioGratis: number
  envioEsGratis: boolean
  /** Cantidad total de unidades. */
  unidades: number
}

export function calcularEnvio(subtotal: number): number {
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
}

export function calcularTotales(items: readonly LineaCarrito[]): Totales {
  const lineas: LineaCalculada[] = items
    .filter((item) => item.cantidad > 0)
    .map((item) => {
      const producto = CATALOGO[item.id]
      const cantidad = Math.trunc(item.cantidad)
      return {
        id: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad,
        total: producto.precio * cantidad,
      }
    })

  const subtotal = lineas.reduce((acc, l) => acc + l.total, 0)
  const costoEnvio = lineas.length === 0 ? 0 : calcularEnvio(subtotal)
  const unidades = lineas.reduce((acc, l) => acc + l.cantidad, 0)

  return {
    lineas,
    subtotal,
    costoEnvio,
    total: subtotal + costoEnvio,
    faltaParaEnvioGratis: Math.max(0, ENVIO_GRATIS_DESDE - subtotal),
    envioEsGratis: subtotal >= ENVIO_GRATIS_DESDE && lineas.length > 0,
    unidades,
  }
}
