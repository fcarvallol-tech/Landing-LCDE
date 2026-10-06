import Image from 'next/image'
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
 * ilustrado apenas exista. En el celular la ilustración no se muestra: las
 * tarjetas que vienen justo debajo ya traen la suya, y el espacio vale más
 * mostrando productos.
 */
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
          Con foto: en el celular sube arriba del titular como una franja baja;
          en el computador va a la derecha. Sin foto: la ilustración, solo en
          el computador.
        */}
        {FOTO_HERO ? (
          <div className="relative order-first aspect-[16/7] overflow-hidden rounded-xl border-2 border-[var(--color-carbon)] lg:order-none lg:aspect-[3/2] lg:rounded-2xl lg:shadow-[3px_3px_0_var(--color-carbon)]">
            <Image
              src={FOTO_HERO}
              alt="Un tablero de ajedrez de La Casa del Estratega a medio enrollar"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
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
