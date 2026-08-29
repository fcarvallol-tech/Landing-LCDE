import { Caballo } from '@/components/Piezas'

/**
 * "No necesitas saber jugar" (docs/07-copy-y-contenido.md §C.7).
 *
 * Resuelve la objeción principal del ICP, que casi nunca se dice en voz alta:
 * el papá o la mamá teme que le regalen algo que después no va a poder
 * acompañar. Se responde directo, sin rodeos y sin venderle un curso.
 */
export function NoNecesitasSaber() {
  return (
    <section className="bg-[var(--color-beige)]">
      <div className="contenedor seccion">
        <div className="revelar grid items-center gap-8 md:grid-cols-[auto_1fr] md:gap-12">
          <Caballo className="mx-auto h-32 w-auto text-[var(--color-terracota)] md:h-48" />

          <div className="max-w-2xl">
            <p className="eyebrow mb-3">La pregunta que nadie hace</p>
            <h2 className="text-[length:var(--text-h2)]">
              No necesitas saber jugar.
            </h2>
            <div className="mt-4 flex flex-col gap-4 text-lg leading-relaxed">
              <p className="medida">
                El ajedrez se aprende jugando. Las reglas básicas caben en una tarde: cómo
                se mueve cada pieza, qué es el jaque, qué es el mate. Después de eso ya
                están jugando, mal, los dos, y esa es exactamente la parte buena.
              </p>
              <p className="medida">
                Lo más probable es que tu hijo te gane antes de lo que te gustaría. También
                es lo mejor que puede pasar: aprender a perder frente a alguien que lo
                quiere es parte del regalo.
              </p>
            </div>

            <a href="#packs" className="btn btn-primario mt-6">
              Ver los packs
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
