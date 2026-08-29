import { BENEFICIOS, CIERRE_BENEFICIOS } from '@/lib/contenido'
import { Dama } from '@/components/Piezas'

/**
 * Por qué el ajedrez — la sección oscura (docs/03 y docs/07 §C.3).
 *
 * Es el único bloque a fondo carbón de toda la página. Ese contraste es lo que
 * evita que la landing se vea plana, y además marca que acá se está hablando
 * en serio.
 *
 * Cada afirmación lleva su fuente en letra pequeña. Incluirlas SUMA confianza
 * con papás informados: la ausencia de fuente es lo que huele a marketing.
 */
export function Beneficios() {
  return (
    <section
      id="beneficios"
      className="grano relative overflow-hidden bg-[var(--color-carbon)] text-[var(--color-crema)]"
    >
      <div
        className="tablero-marca-agua absolute inset-0 text-[var(--color-crema)]"
        aria-hidden="true"
      />

      <div className="contenedor seccion relative z-10">
        <div className="revelar max-w-3xl">
          <p className="eyebrow eyebrow-claro mb-3">Por qué el ajedrez</p>
          <h2 className="text-[length:var(--text-h2)] text-[var(--color-crema)]">
            Lo que dice la evidencia. Y lo que no.
          </h2>
          <p className="medida mt-4 text-lg leading-relaxed text-[var(--color-crema)]/80">
            No vamos a decirte que el ajedrez sube el CI. Vamos a decirte lo que los
            estudios encontraron de verdad, con el nombre de cada uno abajo, para que lo
            revises si quieres.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map((beneficio, i) => (
            <li
              key={beneficio.titulo}
              className={`revelar flex flex-col rounded-xl border border-[var(--color-borde-oscuro)] bg-white/[0.04] p-5 ${
                i === 0 ? 'lg:col-span-2' : ''
              }`}
              style={{ transitionDelay: `${Math.min(i, 4) * 60}ms` }}
            >
              <h3 className="text-[1.0625rem] leading-tight text-[var(--color-dorado)]">
                {beneficio.titulo}
              </h3>
              <p className="medida mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--color-crema)]/85">
                {beneficio.texto}
              </p>
              <p className="mt-4 border-t border-[var(--color-borde-oscuro)] pt-3 text-xs leading-relaxed text-[var(--color-crema)]/45">
                Fuente: {beneficio.fuente}
              </p>
            </li>
          ))}
        </ul>

        {/* El cierre honesto: es el que convierte, no las cifras. */}
        <div className="revelar mt-10 flex items-start gap-5 rounded-xl border-l-4 border-[var(--color-dorado)] bg-white/[0.04] p-6">
          <Dama className="hidden h-16 w-auto shrink-0 text-[var(--color-dorado)] sm:block" />
          <p className="text-lg leading-relaxed text-balance text-[var(--color-crema)]">
            {CIERRE_BENEFICIOS}
          </p>
        </div>
      </div>
    </section>
  )
}
