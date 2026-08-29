import Image from 'next/image'
import { Escudo, Peon, Torre } from '@/components/Piezas'
import { FOTO_HERO } from '@/lib/fotos-generadas'
import { COMUNAS } from '@/lib/logistica'
import { formatearPrecio } from '@/lib/catalogo'

/**
 * Hero (docs/07-copy-y-contenido.md §C.1 y §D).
 *
 * La tesis de la página en una frase: el ajedrez es lo contrario a una pantalla.
 * Titular elegido de la lista autorizada de docs/07 §D, sin inventar uno nuevo.
 *
 * La franja de cobertura va acá arriba, no escondida al final: para este ICP,
 * saber cuándo y dónde llega importa más que el precio.
 */
export function Hero() {
  return (
    <section id="inicio" className="grano relative overflow-hidden">
      {/* Marca de agua de tablero, muy tenue: da textura sin gritar. */}
      <div
        className="tablero-marca-agua absolute inset-0 text-[var(--color-carbon)]"
        aria-hidden="true"
      />

      <div className="contenedor relative z-10 grid items-center gap-10 pt-10 pb-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-16">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <Escudo className="h-5 w-auto text-[var(--color-terracota)]" />
            Ajedrez · Santiago oriente
          </p>

          <h1 className="text-[length:var(--text-h1)]">
            Una hora de ajedrez es una hora que{' '}
            <span className="text-[var(--color-terracota)]">no fue de pantalla</span>.
          </h1>

          <p className="medida mt-5 text-lg leading-relaxed text-[var(--color-marron)]">
            Packs de ajedrez para empezar en serio, desde {formatearPrecio(15990)}. Los
            entregamos personalmente en la zona oriente de Santiago.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#packs" className="btn btn-primario text-base">
              Ver los packs
            </a>
            <a href="#beneficios" className="btn btn-secundario text-base">
              Por qué el ajedrez
            </a>
          </div>

          {/* Franja de cobertura: visible, cerca del hero, no letra chica. */}
          <div className="mt-8 rounded-xl border border-[var(--color-beige-borde)] bg-[var(--color-beige)] p-4">
            <p className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Torre
                className="mt-0.5 h-5 w-auto shrink-0 text-[var(--color-terracota)]"
              />
              <span>
                <strong className="font-semibold text-[var(--color-carbon)]">
                  Entregamos personalmente
                </strong>{' '}
                en {COMUNAS.slice(0, -1).join(', ')} y {COMUNAS[COMUNAS.length - 1]}.
              </span>
            </p>
          </div>
        </div>

        {/* Imagen o composición de reemplazo */}
        <div className="relative">
          {FOTO_HERO ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-[var(--color-carbon)] sombra-block">
              <Image
                src={FOTO_HERO}
                alt="Un tablero de ajedrez de La Casa del Estratega listo para jugar"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
            </div>
          ) : (
            <TableroIlustrado />
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Mientras no haya foto del hero: un tablero real dibujado en CSS, con las
 * piezas de la marca encima. No es un placeholder gris, es una imagen que se
 * sostiene sola y que se reemplaza cuando llegue la foto.
 */
function TableroIlustrado() {
  const casillas = Array.from({ length: 64 }, (_, i) => i)

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md rounded-2xl border-2 border-[var(--color-carbon)] bg-[var(--color-beige)] p-4 sombra-block"
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
