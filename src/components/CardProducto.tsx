'use client'

import Image from 'next/image'
import { formatearPrecio, type Producto } from '@/lib/catalogo'
import { FOTOS_PRODUCTO } from '@/lib/fotos-generadas'
import { PiezaDeProducto } from '@/components/Piezas'
import { useCarrito } from '@/components/CarritoProvider'
import { verProducto } from '@/lib/eventos'
import { useEffect, useRef } from 'react'

/**
 * Card de producto.
 *
 * Sobre la foto: mientras no exista el archivo en public/productos/, se dibuja
 * la pieza de ajedrez que corresponde al nivel del pack. Apenas Felipe suba la
 * foto con el nombre correcto, el script de build la detecta y aparece sola.
 *
 * La pieza no es decoración: sube de rango junto con el pack (peón → alfil →
 * caballo → rey), que es exactamente lo que promete el naming CM/IM/GM.
 */
export function CardProducto({
  producto,
  agotado,
  mostrarUltimas,
  stock,
  destacado,
}: {
  producto: Producto
  agotado: boolean
  mostrarUltimas: boolean
  stock: number
  destacado: boolean
}) {
  const { agregar, lineas } = useCarrito()
  const enCarrito = lineas[producto.id] ?? 0
  const fotos = FOTOS_PRODUCTO[producto.id]
  const foto = fotos[0]
  const cardRef = useRef<HTMLElement>(null)
  const yaVisto = useRef(false)

  // ViewContent: se dispara cuando la card entra en pantalla de verdad.
  useEffect(() => {
    const el = cardRef.current
    if (!el || yaVisto.current || !('IntersectionObserver' in window)) return

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting || yaVisto.current) continue
          yaVisto.current = true
          verProducto(producto.id, producto.nombre, producto.precio)
          observador.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    observador.observe(el)
    return () => observador.disconnect()
  }, [producto.id, producto.nombre, producto.precio])

  const esDorado = producto.etiqueta === 'tope-de-gama'

  return (
    <article
      ref={cardRef}
      className={`card-elevable revelar flex flex-col overflow-hidden rounded-2xl border-2 bg-white ${
        esDorado
          ? 'card-elevable-dorada border-[var(--color-dorado)] sombra-block-dorada'
          : 'border-[var(--color-carbon)] sombra-block'
      } ${agotado ? 'opacity-60 grayscale' : ''} ${destacado ? 'lg:row-span-2' : ''}`}
    >
      {/* Imagen o ilustración de reemplazo */}
      <div
        className={`relative aspect-square overflow-hidden border-b-2 ${
          esDorado ? 'border-[var(--color-dorado)]' : 'border-[var(--color-carbon)]'
        } bg-[var(--color-beige)]`}
      >
        {foto ? (
          <Image
            src={foto}
            alt={producto.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <>
            {/* Marca de agua de tablero + la pieza del nivel. */}
            <div
              className="tablero-marca-agua absolute inset-0 text-[var(--color-carbon)]"
              aria-hidden="true"
            />
            <div className="absolute inset-0 grid place-items-center p-8">
              <PiezaDeProducto
                id={producto.id}
                className={`h-full max-h-44 w-auto ${
                  esDorado ? 'text-[var(--color-dorado)]' : 'text-[var(--color-terracota)]'
                }`}
              />
            </div>
            <p className="absolute inset-x-0 bottom-0 bg-[var(--color-beige)]/85 px-3 py-1.5 text-center text-[11px] tracking-wide text-[var(--color-gris)]">
              Foto real muy pronto
            </p>
          </>
        )}

        {/* Etiquetas: una sola cosa a la vez para que signifiquen algo. */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
          {producto.etiqueta === 'mas-elegido' && (
            <span className="rounded-md bg-[var(--color-terracota)] px-2.5 py-1 text-[11px] font-[family-name:var(--font-display)] tracking-wider text-[var(--color-crema)] uppercase">
              Más elegido
            </span>
          )}
          {esDorado && (
            <span className="rounded-md bg-[var(--color-dorado)] px-2.5 py-1 text-[11px] font-[family-name:var(--font-display)] tracking-wider text-[var(--color-carbon)] uppercase">
              Tope de gama
            </span>
          )}
        </div>

        {mostrarUltimas && !agotado && (
          <span className="absolute top-3 right-3 rounded-md bg-[var(--color-rojo)] px-2.5 py-1 text-[11px] font-bold text-white">
            {stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`}
          </span>
        )}

        {agotado && (
          <span className="absolute top-3 right-3 rounded-md bg-[var(--color-carbon)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-crema)]">
            Agotado
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-[1.0625rem] leading-tight sm:text-lg">{producto.nombre}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-marron)]">
            {producto.resumen}
          </p>
        </div>

        <ul className="flex flex-col gap-1 text-sm text-[var(--color-marron)]">
          {producto.contenido.map((linea) => (
            <li key={linea} className="flex items-start gap-2">
              <span
                className="mt-[7px] size-1.5 shrink-0 bg-[var(--color-terracota)]"
                aria-hidden="true"
              />
              {linea}
            </li>
          ))}
        </ul>

        <p className="text-xs font-medium tracking-wide text-[var(--color-gris)] uppercase">
          Desde {producto.edadMin} años
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <p className="precio text-2xl leading-none font-bold text-[var(--color-carbon)]">
            {formatearPrecio(producto.precio)}
          </p>

          <button
            type="button"
            onClick={() => agregar(producto.id)}
            disabled={agotado}
            className="btn btn-primario px-5"
            aria-label={
              agotado
                ? `${producto.nombre}: agotado`
                : `Agregar ${producto.nombre} al carrito`
            }
          >
            {agotado ? 'Agotado' : enCarrito > 0 ? `Agregar otro (${enCarrito})` : 'Lo quiero'}
          </button>
        </div>
      </div>
    </article>
  )
}
