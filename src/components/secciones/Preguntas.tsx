import { PREGUNTAS, type Pregunta } from '@/lib/contenido'
import { NEGOCIO, WA_CONSULTA } from '@/lib/negocio'

/**
 * FAQ (docs/07-copy-y-contenido.md §C.9 y §E).
 *
 * Acordeón con <details>/<summary> nativos: accesible de fábrica, navegable
 * con teclado sin una línea de JavaScript y buscable con Ctrl+F en navegadores
 * modernos.
 *
 * /jugadores muestra solo las preguntas prácticas: nada sobre niños ni sobre
 * aprender a jugar (docs/12 §7).
 */
export function Preguntas({
  preguntas = PREGUNTAS,
}: {
  preguntas?: readonly Pregunta[]
} = {}) {
  return (
    <section id="preguntas" className="bg-[var(--color-beige)]">
      <div className="contenedor seccion">
        <div className="revelar max-w-3xl">
          <p className="eyebrow mb-3">Preguntas</p>
          <h2 className="text-[length:var(--text-h2)]">Lo que nos preguntan siempre.</h2>
        </div>

        <div className="revelar mt-8 grid gap-x-8 gap-y-0 lg:grid-cols-2">
          {preguntas.map((item) => (
            <details
              key={item.pregunta}
              className="group border-b border-[var(--color-beige-borde)]"
            >
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-[0.9375rem] font-semibold text-[var(--color-carbon)] marker:hidden [&::-webkit-details-marker]:hidden">
                {item.pregunta}
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-[var(--color-beige-borde)] bg-[var(--color-crema)] text-lg leading-none transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="medida pb-4 text-[0.9375rem] leading-relaxed text-[var(--color-marron)]">
                {item.respuesta}
              </p>
            </details>
          ))}
        </div>

        <p className="revelar mt-8 text-[0.9375rem]">
          ¿Te quedó otra duda?{' '}
          <a
            href={WA_CONSULTA}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--color-terracota)] underline underline-offset-2"
          >
            Escríbenos por WhatsApp
          </a>{' '}
          o a{' '}
          <a
            href={`mailto:${NEGOCIO.email}`}
            className="font-semibold text-[var(--color-terracota)] underline underline-offset-2"
          >
            {NEGOCIO.email}
          </a>
          .
        </p>
      </div>
    </section>
  )
}
