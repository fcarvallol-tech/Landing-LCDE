'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { formatearPrecio, type Producto } from '@/lib/catalogo'
import { calcularEnvio } from '@/lib/precios'
import { FotoProducto } from '@/components/FotoProducto'
import { useCarrito } from '@/components/CarritoProvider'
import { agregarAlCarrito, verProducto } from '@/lib/eventos'

/**
 * Tarjeta de producto (docs/12-rediseno.md §5).
 *
 * Orden exacto, de arriba abajo: foto cuadrada → etiqueta → nombre → qué trae
 * en una línea → precio grande → botón. Nada de párrafos de venta.
 *
 * "Lo quiero" lleva directo a la pantalla de compra de ese pack, saltándose el
 * carrito (docs/12 §4). El carrito sigue ahí para quien quiera sumar varias
 * cosas, con un enlace discreto debajo del botón.
 */
export function CardProducto({
  producto,
  agotado,
  mostrarUltimas,
  stock,
  etiqueta,
  mostrarEdad = true,
}: {
  producto: Producto
  agotado: boolean
  mostrarUltimas: boolean
  stock: number
  /**
   * Texto de la etiqueta destacada. Si no se pasa, se usa la del catálogo
   * ("Más elegido" en el Pack CM). `null` la apaga.
   */
  etiqueta?: string | null
  /** En /jugadores no se habla de edades (docs/12 §7). */
  mostrarEdad?: boolean
}) {
  const { agregar } = useCarrito()
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
  const textoDestacado =
    etiqueta === undefined
      ? producto.etiqueta === 'mas-elegido'
        ? 'Más elegido'
        : null
      : etiqueta

  // Una sola etiqueta a la vez, para que signifique algo. La urgencia real
  // (stock) gana sobre la de marketing.
  const etiquetaVisible = agotado
    ? { texto: 'Agotado', clase: 'bg-[var(--color-carbon)] text-[var(--color-crema)]' }
    : mostrarUltimas
      ? {
          texto: stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`,
          clase: 'bg-[var(--color-rojo)] text-white',
        }
      : textoDestacado
        ? { texto: textoDestacado, clase: 'bg-[var(--color-terracota)] text-[var(--color-crema)]' }
        : null

  // "Despacho gratis incluido": sale de calcularEnvio(), la misma función con
  // que el servidor cobra, así que sigue sola a ENVIO_GRATIS_DESDE. Es un dato
  // del precio, no urgencia ni marketing: va junto al precio, con contorno en
  // vez de relleno, y nunca choca con la etiqueta de arriba (si compartieran
  // fila, en las cards angostas se partiría en dos líneas y descuadraría los
  // nombres entre cards). Sobre un producto agotado no aporta nada.
  const incluyeDespacho = !agotado && calcularEnvio(producto.precio) === 0

  return (
    <article
      ref={cardRef}
      className={`card-elevable flex flex-col overflow-hidden rounded-2xl border-2 bg-white ${
        esDorado
          ? 'card-elevable-dorada border-[var(--color-dorado)] sombra-block-dorada'
          : 'border-[var(--color-carbon)] sombra-block'
      } ${agotado ? 'opacity-60 grayscale' : ''}`}
    >
      {/* 1. Foto cuadrada (o la ilustración mientras no exista) */}
      <div
        className={`relative aspect-square overflow-hidden border-b-2 bg-[var(--color-beige)] ${
          esDorado ? 'border-[var(--color-dorado)]' : 'border-[var(--color-carbon)]'
        }`}
      >
        <FotoProducto
          producto={producto}
          dorado={esDorado}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* 2. Etiqueta. En grilla de varias columnas reserva su alto para que
               los nombres queden alineados entre cards. */}
        <div className="mb-2 flex sm:min-h-[1.375rem]">
          {etiquetaVisible && (
            <span
              className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase ${etiquetaVisible.clase}`}
            >
              {etiquetaVisible.texto}
            </span>
          )}
        </div>

        {/* 3. Nombre */}
        <h3 className="text-[1.0625rem] leading-tight sm:text-lg">{producto.nombre}</h3>

        {/* 4. Qué trae, en una línea */}
        <p className="mt-1 text-sm text-[var(--color-marron)]">
          {producto.trae}
          {mostrarEdad && (
            <span className="text-[var(--color-gris)]"> · desde {producto.edadMin} años</span>
          )}
        </p>

        {/* 5. Precio, y si ya alcanza el despacho gratis, dicho al lado */}
        {/* Alto mínimo igual en todas las cards, tenga o no la etiqueta, para
            que los botones queden alineados en la misma fila. */}
        <div className="mt-auto flex min-h-[2.125rem] items-center gap-3 pt-4 box-content">
          <p className="precio text-[1.75rem] leading-none font-extrabold text-[var(--color-carbon)]">
            {formatearPrecio(producto.precio)}
          </p>
          {incluyeDespacho && (
            // Partida en dos líneas cortas para que quepa al lado del precio
            // incluso en las cards más angostas (dos columnas, en tablet).
            <span className="max-w-[8.5rem] rounded-md border border-[var(--color-exito)] px-2 py-0.5 text-[10.5px] leading-[1.2] font-bold tracking-wider text-[var(--color-exito)] uppercase">
              Despacho gratis incluido
            </span>
          )}
        </div>

        {/* 6. Botón */}
        {agotado ? (
          <>
            <button type="button" disabled className="btn btn-primario mt-4 w-full">
              Agotado
            </button>
            {/* Ocupa el lugar de "o agrégalo al carrito" para que el botón
                quede a la misma altura que el de las otras cards. */}
            <div className="mt-1.5 min-h-[44px]" aria-hidden="true" />
          </>
        ) : (
          <>
            <Link
              href={`/comprar/${producto.id}`}
              onClick={() => agregarAlCarrito(producto.id, producto.nombre, producto.precio)}
              className="btn btn-primario mt-4 w-full text-base"
              aria-label={`Lo quiero: comprar ${producto.nombre}`}
            >
              Lo quiero
            </Link>
            <button
              type="button"
              onClick={() => agregar(producto.id)}
              className="mx-auto mt-1.5 min-h-[44px] px-2 text-[0.8125rem] text-[var(--color-gris)] underline underline-offset-4 hover:text-[var(--color-terracota)]"
            >
              o agrégalo al carrito
            </button>
          </>
        )}
      </div>
    </article>
  )
}
