import { DATOS_CURIOSOS } from '@/lib/contenido'

/**
 * Datos curiosos (docs/07-copy-y-contenido.md §C.6 y §B).
 *
 * Franja liviana entre dos secciones densas. Todos los hechos son verificables
 * y salen tal cual del documento de contenido. Sirven para dos cosas: dar aire
 * y recordar que el ajedrez es más interesante de lo que parece.
 */
export function DatosCuriosos() {
  return (
    <section aria-labelledby="titulo-curiosos" className="contenedor seccion">
      <div className="revelar flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Para la sobremesa</p>
          <h2 id="titulo-curiosos" className="text-[length:var(--text-h2)]">
            Cuatro cosas que puedes contarle.
          </h2>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DATOS_CURIOSOS.map((dato, i) => (
          <li
            key={dato.titulo}
            className="revelar rounded-xl border border-[var(--color-beige-borde)] bg-[var(--color-beige)] p-5"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <p className="numeros font-[family-name:var(--font-display)] text-2xl leading-none text-[var(--color-terracota)]">
              {dato.titulo}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-marron)]">
              {dato.texto}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
