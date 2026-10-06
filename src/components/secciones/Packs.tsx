'use client'

import { CATALOGO, PRODUCTOS, formatearPrecio, type IdProducto } from '@/lib/catalogo'
import { COMUNAS, COSTO_ENVIO, ENVIO_GRATIS_DESDE } from '@/lib/logistica'
import { CardProducto } from '@/components/CardProducto'
import { Torre } from '@/components/Piezas'
import { useCarrito } from '@/components/CarritoProvider'

/**
 * Los packs (docs/07 §C.4 y docs/12-rediseno.md §3 y §5).
 *
 * Va inmediatamente después del hero, con una cabecera de una línea: lo que
 * importa es que el borde de las tarjetas asome en la primera pantalla.
 *
 * Debajo de la grilla, la franja de cobertura: dónde entregamos, en grande y
 * sin letra chica (CLAUDE.md, regla 5).
 */
export function Packs({
  titulo = 'Cuatro formas de empezar. Una de seguir.',
  orden,
  etiquetas,
  mostrarEdad = true,
}: {
  titulo?: string
  /** Orden de las cards. Por defecto, el del catálogo. */
  orden?: readonly IdProducto[]
  /** Etiquetas que reemplazan a las del catálogo en esta página. */
  etiquetas?: Partial<Record<IdProducto, string | null>>
  mostrarEdad?: boolean
}) {
  const { stock } = useCarrito()
  const productos = orden ? orden.map((id) => CATALOGO[id]) : PRODUCTOS

  return (
    <section id="packs" className="contenedor pt-1 pb-14 sm:pb-20" aria-labelledby="packs-titulo">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="packs-titulo" className="text-[length:var(--text-h3)]">
          {titulo}
        </h2>
        <p className="text-sm text-[var(--color-gris)]">
          Precios finales, IVA incluido.
        </p>
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => {
          const info = stock[producto.id]
          return (
            <CardProducto
              key={producto.id}
              producto={producto}
              agotado={info?.agotado ?? false}
              mostrarUltimas={info?.mostrarUltimas ?? false}
              stock={info?.stock ?? 0}
              etiqueta={etiquetas?.[producto.id]}
              mostrarEdad={mostrarEdad}
            />
          )
        })}
      </div>

      {/* Franja de cobertura: visible y en grande, no escondida al final. */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-[var(--color-beige-borde)] bg-[var(--color-beige)] p-4 sm:p-5">
        <Torre className="mt-0.5 h-6 w-auto shrink-0 text-[var(--color-terracota)]" />
        <p className="text-[0.9375rem] leading-relaxed">
          <strong className="font-semibold text-[var(--color-carbon)]">
            Entregamos personalmente
          </strong>{' '}
          en {COMUNAS.slice(0, -1).join(', ')} y {COMUNAS[COMUNAS.length - 1]}. Solo en esas
          comunas. Despacho gratis sobre{' '}
          <span className="precio font-semibold">{formatearPrecio(ENVIO_GRATIS_DESDE)}</span>;
          bajo ese monto, <span className="precio">{formatearPrecio(COSTO_ENVIO)}</span>.
        </p>
      </div>
    </section>
  )
}
