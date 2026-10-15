import { getImageProps } from 'next/image'
import Link from 'next/link'
import { Peon, Torre } from '@/components/Piezas'
import { FOTO_HERO } from '@/lib/fotos-generadas'
import { formatearPrecio } from '@/lib/catalogo'
import type { Titular } from '@/lib/campanas'

/**
 * Hero (docs/12-rediseno.md §3).
 *
 * Bajo a propósito: la prueba es que al cargar la página, en el celular y en el
 * computador, asome el borde de las tarjetas de producto. Si hay que hacer
 * scroll para sospechar que esto es una tienda, el hero sobra.
 *
 * Un titular, un botón primario. El titular cambia según el anuncio de donde
 * viene la persona (`?c=`, ver src/lib/campanas.ts).
 *
 * La foto `public/hero.jpg` (el tablero a medio enrollar) reemplaza al tablero
 * ilustrado apenas exista. En el computador va a la derecha. En el celular y
 * la tablet es una franja baja arriba del titular, pero SOLO si la pantalla
 * tiene altura suficiente para que las tarjetas sigan asomando con la franja
 * puesta (ver ALTO_MINIMO_FRANJA). Sin foto, en el celular no se muestra
 * ilustración: las tarjetas que vienen justo debajo ya traen la suya.
 */

/**
 * Alto mínimo de pantalla (px CSS) para mostrar la franja de la foto en el
 * celular y la tablet. Calibrado midiendo el borde de la primera tarjeta con
 * la franja puesta: ver docs/09-verificacion.md.
 *
 * ⚠ El mismo número está escrito en la clase `.hero-franja` de
 * src/app/globals.css (una media query no puede leer una variable). Si cambias
 * uno, cambia el otro.
 */
export const ALTO_MINIMO_FRANJA = 830

/** Desde este ancho la foto va en la columna derecha (el `lg` de Tailwind). */
const ANCHO_ESCRITORIO = 1024

/** GIF transparente de 1×1: lo que "descarga" el navegador cuando no hay franja. */
const PIXEL_VACIO = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
export function Hero({ titular }: { titular: Titular }) {
  return (
    <section id="inicio" className="grano relative overflow-hidden">
      <div
        className="tablero-marca-agua absolute inset-0 text-[var(--color-carbon)]"
        aria-hidden="true"
      />

      <div className="contenedor relative z-10 grid items-center gap-5 pt-5 pb-7 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pt-10 lg:pb-10">
        <div className="max-w-2xl">
          <h1 className="text-[length:var(--text-h1-hero)]">
            {titular.antes}
            <span className="text-[var(--color-terracota)]">{titular.destacado}</span>
            {titular.despues}
          </h1>

          <p className="medida mt-3 text-base leading-relaxed text-[var(--color-marron)] sm:mt-4 sm:text-lg">
            Packs de ajedrez para empezar en serio, desde {formatearPrecio(15990)}. Los
            entregamos personalmente en la zona oriente de Santiago.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#packs" className="btn btn-primario text-base">
              Ver los packs
            </a>
            <a
              href="#beneficios"
              className="py-2 text-[0.9375rem] font-semibold text-[var(--color-carbon)] underline decoration-[var(--color-beige-borde)] decoration-2 underline-offset-4 hover:decoration-[var(--color-terracota)]"
            >
              Por qué el ajedrez
            </a>
          </div>

          {/* La puerta para el otro público. Enlace, no botón: no compite. */}
          <p className="mt-3 text-sm">
            <Link
              href="/jugadores"
              className="inline-block py-1.5 text-[var(--color-gris)] underline underline-offset-4 hover:text-[var(--color-terracota)]"
            >
              ¿Compras para ti? Mira el tablero por dentro →
            </Link>
          </p>
        </div>

        {/*
          Una sola imagen para los dos tamaños, así no se descarga dos veces.
          Con foto: en el computador va a la derecha; en el celular, franja
          baja arriba del titular, solo si hay altura (clase .hero-franja).
          Sin foto: la ilustración, solo en el computador.
        */}
        {FOTO_HERO ? (
          <div className="hero-franja relative order-first h-[clamp(7.5rem,40vw,11rem)] overflow-hidden rounded-xl border-2 border-[var(--color-carbon)] lg:order-none lg:aspect-[3/2] lg:h-auto lg:rounded-2xl lg:shadow-[3px_3px_0_var(--color-carbon)]">
            <FotoHero src={FOTO_HERO} />
          </div>
        ) : (
          <div className="hidden lg:block">
            <TableroIlustrado className="max-w-[21rem]" />
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Mientras no haya foto: un tablero real dibujado en CSS, con las piezas de la
 * marca encima. No es un placeholder gris, es una imagen que se sostiene sola.
 */
export function TableroIlustrado({ className = '' }: { className?: string }) {
  const casillas = Array.from({ length: 64 }, (_, i) => i)

  return (
    <div
      className={`relative mx-auto aspect-square w-full rounded-2xl border-2 border-[var(--color-carbon)] bg-[var(--color-beige)] p-3 sombra-block ${className}`}
      role="img"
      aria-label="Ilustración de un tablero de ajedrez con un peón y una torre"
    >
      <div className="grid h-full w-full grid-cols-8 overflow-hidden rounded-md border-2 border-[var(--color-carbon)]">
        {casillas.map((i) => {
          const fila = Math.floor(i / 8)
          const columna = i % 8
          const oscura = (fila + columna) % 2 === 1
          return (
            <div
              key={i}
              className={oscura ? 'bg-[var(--color-terracota)]/85' : 'bg-[var(--color-crema)]'}
            />
          )
        })}
      </div>

      <Peon className="absolute bottom-[16%] left-[19%] h-[26%] w-auto text-[var(--color-carbon)] drop-shadow-[2px_2px_0_rgba(250,243,232,0.45)]" />
      <Torre className="absolute top-[18%] right-[20%] h-[24%] w-auto text-[var(--color-carbon)] drop-shadow-[2px_2px_0_rgba(250,243,232,0.45)]" />
    </div>
  )
}

/**
 * La foto del hero dentro de un <picture>. Cuando la franja está oculta (poca
 * altura, o el navegador pide ahorrar datos) el <source> entrega un pixel
 * vacío: el celular no descarga una foto que no va a mostrar.
 */
function FotoHero({ src }: { src: string }) {
  const { props } = getImageProps({
    src,
    alt: 'Un tablero de ajedrez de La Casa del Estratega a medio enrollar',
    fill: true,
    loading: 'eager',
    fetchPriority: 'high',
    sizes: '(min-width: 1024px) 46vw, 100vw',
  })

  const movil = `(max-width: ${ANCHO_ESCRITORIO - 1}px)`

  return (
    <picture>
      <source media={`${movil} and (max-height: ${ALTO_MINIMO_FRANJA - 1}px)`} srcSet={PIXEL_VACIO} />
      <source media={`${movil} and (prefers-reduced-data: reduce)`} srcSet={PIXEL_VACIO} />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...props} className="object-cover" />
    </picture>
  )
}
