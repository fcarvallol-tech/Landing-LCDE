'use client'

import { PRODUCTOS, formatearPrecio } from '@/lib/catalogo'
import { ENVIO_GRATIS_DESDE } from '@/lib/logistica'
import { CardProducto } from '@/components/CardProducto'
import { useCarrito } from '@/components/CarritoProvider'

/**
 * Los packs (docs/07-copy-y-contenido.md §C.4).
 *
 * Las 4 cajas y el reloj suelto. El orden importa: sube de precio y de nivel,
 * y el Pack CM va segundo porque es el punto dulce.
 */
export function Packs() {
  const { stock } = useCarrito()

  return (
    <section id="packs" className="contenedor seccion">
      <div className="revelar max-w-3xl">
        <p className="eyebrow mb-3">Los packs</p>
        <h2 className="text-[length:var(--text-h2)]">
          Cuatro formas de empezar. Una de seguir.
        </h2>
        <p className="medida mt-4 text-lg leading-relaxed">
          Los nombres siguen los títulos del ajedrez, de candidato a maestro a gran
          maestro. Se empieza donde se quiera; el camino hacia arriba ya está puesto.
        </p>
        <p className="mt-3 text-sm text-[var(--color-gris)]">
          Precios finales, IVA incluido. Despacho gratis sobre{' '}
          {formatearPrecio(ENVIO_GRATIS_DESDE)}.
        </p>
      </div>

      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTOS.map((producto) => {
          const info = stock[producto.id]
          return (
            <CardProducto
              key={producto.id}
              producto={producto}
              agotado={info?.agotado ?? false}
              mostrarUltimas={info?.mostrarUltimas ?? false}
              stock={info?.stock ?? 0}
              destacado={false}
            />
          )
        })}
      </div>
    </section>
  )
}
