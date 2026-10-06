import type { Metadata } from 'next'
import Image from 'next/image'
import { obtenerEstadoProductos } from '@/lib/datos'
import { MEDIDAS, PREGUNTAS_JUGADORES } from '@/lib/contenido'
import {
  FOTO_DETALLE,
  FOTO_GUARDADO,
  FOTO_HERO,
  FOTO_JUGANDO_ADULTO,
  FOTO_MEDIDAS,
} from '@/lib/fotos-generadas'
import { NEGOCIO } from '@/lib/negocio'
import { SITIO_URL } from '@/lib/sitio'
import { CarritoProvider } from '@/components/CarritoProvider'
import { BarraAnuncio } from '@/components/BarraAnuncio'
import { Encabezado } from '@/components/Encabezado'
import { PanelCarrito } from '@/components/PanelCarrito'
import { BarraCompraMovil } from '@/components/BarraCompraMovil'
import { PieDePagina } from '@/components/PieDePagina'
import { Rey } from '@/components/Piezas'
import { TableroIlustrado } from '@/components/secciones/Hero'
import { Packs } from '@/components/secciones/Packs'
import { FranjaConfianza } from '@/components/secciones/FranjaConfianza'
import { Cobertura } from '@/components/secciones/Cobertura'
import { Preguntas } from '@/components/secciones/Preguntas'

/**
 * /jugadores — para quien ya sabe jugar y compra por practicidad
 * (docs/12-rediseno.md §7 y docs/10 "la bifurcación de los dos públicos").
 *
 * No son competidores de club. Cero contenido infantil, cero beneficios
 * cognitivos: eso los espanta. El argumento son las medidas, con números,
 * como prueba de que no es un juguete.
 *
 * Mismo sistema visual, mismo checkout, mismo stock. Sí se indexa.
 */
export const revalidate = 60

const TITULO = 'Tablero de ajedrez de 50 × 50 cm que se enrolla'
const DESCRIPCION =
  'Tablero de 50 × 50 cm con casillas de 5,8 cm, rey de 9,6 cm y superficie de goma que se enrolla. Pack con reloj de ajedrez. Entrega personal en Santiago oriente.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/jugadores' },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: `${SITIO_URL}/jugadores`,
    siteName: NEGOCIO.nombre,
    title: `${TITULO} — ${NEGOCIO.nombre}`,
    description: DESCRIPCION,
    images: [{ url: '/og', width: 1200, height: 630, alt: NEGOCIO.nombre }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITULO} — ${NEGOCIO.nombre}`,
    description: DESCRIPCION,
    images: ['/og'],
  },
}

/** La foto del hero: la de un adulto jugando fuera de casa, si existe. */
const FOTO_PORTADA = FOTO_JUGANDO_ADULTO ?? FOTO_HERO

/** Las fotos que prueban las medidas. Solo las que existen: nunca un hueco. */
const FOTOS_PRUEBA = [
  { src: FOTO_MEDIDAS, alt: 'El rey de pie junto a una huincha: mide 9,6 cm', pie: 'El rey, medido' },
  { src: FOTO_DETALLE, alt: 'La superficie de goma del tablero, de cerca, con piezas de pie', pie: 'La superficie, de cerca' },
  { src: FOTO_GUARDADO, alt: 'El tablero enrollado dentro de una mochila', pie: 'Enrollado, en la mochila' },
].filter((f): f is { src: string; alt: string; pie: string } => Boolean(f.src))

export default async function PaginaJugadores() {
  const stock = await obtenerEstadoProductos()

  return (
    <CarritoProvider stock={stock}>
      <BarraAnuncio />
      <Encabezado
        enlaces={[
          { href: '#medidas', texto: 'Las medidas' },
          { href: '#packs', texto: 'Los packs' },
        ]}
      />

      <main id="contenido">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section id="inicio" className="grano relative overflow-hidden">
          <div
            className="tablero-marca-agua absolute inset-0 text-[var(--color-carbon)]"
            aria-hidden="true"
          />

          <div className="contenedor relative z-10 grid items-center gap-5 pt-5 pb-7 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pt-10 lg:pb-10">
            <div className="max-w-2xl">
              <p className="eyebrow mb-3">Para quien ya juega</p>
              <h1 className="text-[length:var(--text-h1-hero)]">
                Medidas de verdad.{' '}
                <span className="text-[var(--color-terracota)]">Caben en una mochila.</span>
              </h1>

              <p className="medida mt-3 text-base leading-relaxed text-[var(--color-marron)] sm:mt-4 sm:text-lg">
                Un tablero de 50 × 50 cm que se enrolla, piezas con un rey de 9,6 cm y, si
                lo quieres, el reloj. Te lo entregamos en persona en Santiago oriente.
              </p>

              {/* Las medidas, de entrada y con números. */}
              <dl className="mt-5 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border-2 border-[var(--color-carbon)] bg-[var(--color-carbon)] sm:grid-cols-4">
                {MEDIDAS.map((m) => (
                  <div key={m.valor} className="flex flex-col bg-[var(--color-crema)] px-3 py-2.5">
                    <dt className="order-2 text-xs leading-snug text-[var(--color-gris)]">
                      {m.detalle}
                    </dt>
                    <dd className="numeros font-[family-name:var(--font-display)] text-[1.0625rem] leading-tight text-[var(--color-carbon)]">
                      {m.valor}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#packs" className="btn btn-primario text-base">
                  Ver el Pack IM
                </a>
                <a
                  href="#medidas"
                  className="py-2 text-[0.9375rem] font-semibold text-[var(--color-carbon)] underline decoration-[var(--color-beige-borde)] decoration-2 underline-offset-4 hover:decoration-[var(--color-terracota)]"
                >
                  Por qué no es un juguete
                </a>
              </div>
            </div>

            {FOTO_PORTADA ? (
              <div className="relative order-first aspect-[16/7] overflow-hidden rounded-xl border-2 border-[var(--color-carbon)] lg:order-none lg:aspect-[3/2] lg:rounded-2xl lg:shadow-[3px_3px_0_var(--color-carbon)]">
                <Image
                  src={FOTO_PORTADA}
                  alt="Una partida en curso sobre el tablero de La Casa del Estratega, fuera de casa"
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

        {/* ── Productos: el Pack IM y el reloj primero ──────────────────── */}
        <Packs
          titulo="El juego, el reloj, o los dos."
          orden={['im', 'reloj', 'gm', 'cm', 'tradicional']}
          etiquetas={{ im: 'El que más llevan los jugadores', cm: null }}
          mostrarEdad={false}
        />

        {/* ── Por qué no es un juguete ──────────────────────────────────── */}
        <section
          id="medidas"
          className="grano relative overflow-hidden bg-[var(--color-carbon)] text-[var(--color-crema)]"
        >
          <div
            className="tablero-marca-agua absolute inset-0 text-[var(--color-crema)]"
            aria-hidden="true"
          />
          <div className="contenedor seccion relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="eyebrow eyebrow-claro mb-3">Las medidas</p>
              <h2 className="text-[length:var(--text-h2)] text-[var(--color-crema)]">
                No es un juguete. Mídelo.
              </h2>
              <p className="medida mt-4 text-lg leading-relaxed text-[var(--color-crema)]/80">
                Un tablero de juguete se delata por las medidas: casillas chicas y piezas
                que se pierden en la mano. Este tiene casillas de 5,8 cm y un rey de 9,6
                cm, el tamaño con que se juega en serio. Y como es de goma, lo enrollas y
                lo llevas.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {MEDIDAS.map((m) => (
                  <li
                    key={m.valor}
                    className="rounded-xl border border-[var(--color-borde-oscuro)] bg-white/[0.04] p-4"
                  >
                    <p className="numeros font-[family-name:var(--font-display)] text-2xl leading-none text-[var(--color-dorado)]">
                      {m.valor}
                    </p>
                    <p className="mt-1.5 text-sm text-[var(--color-crema)]/75">{m.detalle}</p>
                  </li>
                ))}
              </ul>
            </div>

            {FOTOS_PRUEBA.length > 0 ? (
              <ul
                className={`grid gap-4 ${FOTOS_PRUEBA.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
              >
                {FOTOS_PRUEBA.map((foto, i) => (
                  <li
                    key={foto.src}
                    className={FOTOS_PRUEBA.length === 3 && i === 0 ? 'col-span-2' : ''}
                  >
                    <figure>
                      <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-[var(--color-borde-oscuro)]">
                        <Image
                          src={foto.src}
                          alt={foto.alt}
                          fill
                          sizes="(min-width: 1024px) 36rem, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="mt-2 text-sm text-[var(--color-crema)]/70">
                        {foto.pie}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            ) : (
              <IlustracionMedidas />
            )}
          </div>
        </section>

        <FranjaConfianza />
        <Cobertura />
        <Preguntas preguntas={PREGUNTAS_JUGADORES} />
      </main>

      <PieDePagina />
      <div className="espacio-barra-movil bg-[var(--color-carbon)]" aria-hidden="true" />

      <PanelCarrito />
      <BarraCompraMovil />
    </CarritoProvider>
  )
}

/**
 * Mientras no existan las fotos de prueba: un plano acotado, como de
 * carpintero. El tablero con su cota de 50 cm, una casilla con la suya y el
 * rey de pie con sus 9,6 cm.
 */
function IlustracionMedidas() {
  const casillas = Array.from({ length: 64 }, (_, i) => i)

  return (
    <figure
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label="Plano del tablero: 50 por 50 centímetros, casillas de 5,8 centímetros y un rey de 9,6 centímetros de alto"
    >
      <div className="relative pt-9 pl-9">
        {/* Cota horizontal: 50 cm */}
        <div className="absolute top-0 right-0 left-9 flex items-center gap-2 text-[var(--color-dorado)]">
          <span className="h-px flex-1 bg-current" />
          <span className="numeros text-sm font-bold">50 cm</span>
          <span className="h-px flex-1 bg-current" />
        </div>
        {/* Cota vertical: 50 cm */}
        <div className="absolute top-9 bottom-0 left-0 flex flex-col items-center gap-2 text-[var(--color-dorado)]">
          <span className="w-px flex-1 bg-current" />
          <span className="numeros text-sm font-bold [writing-mode:vertical-rl] rotate-180">
            50 cm
          </span>
          <span className="w-px flex-1 bg-current" />
        </div>

        <div className="relative aspect-square overflow-hidden rounded-md border-2 border-[var(--color-crema)]">
          <div className="grid h-full w-full grid-cols-8">
            {casillas.map((i) => {
              const oscura = (Math.floor(i / 8) + (i % 8)) % 2 === 1
              return (
                <div
                  key={i}
                  className={
                    i === 9
                      ? 'bg-[var(--color-dorado)]'
                      : oscura
                        ? 'bg-[var(--color-terracota)]/80'
                        : 'bg-[var(--color-crema)]/90'
                  }
                />
              )
            })}
          </div>

          {/* La casilla marcada y su medida */}
          <span className="numeros absolute top-[3%] left-[27%] rounded bg-[var(--color-carbon)] px-1.5 py-0.5 text-xs font-bold text-[var(--color-dorado)]">
            ← 5,8 cm
          </span>

          {/* El rey de pie, con su cota */}
          <div className="absolute right-[10%] bottom-[8%] flex h-[19.2%] items-stretch gap-1.5">
            <Rey className="h-full w-auto text-[var(--color-carbon)] drop-shadow-[2px_2px_0_rgba(250,243,232,0.6)]" />
            <div className="flex flex-col items-center text-[var(--color-carbon)]">
              <span className="h-px w-2 bg-current" />
              <span className="w-px flex-1 bg-current" />
              <span className="numeros rounded bg-[var(--color-carbon)] px-1 py-0.5 text-xs font-bold whitespace-nowrap text-[var(--color-dorado)]">
                9,6 cm
              </span>
              <span className="w-px flex-1 bg-current" />
              <span className="h-px w-2 bg-current" />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-[var(--color-crema)]/70">
        Las medidas reales, en plano.
      </figcaption>
    </figure>
  )
}
