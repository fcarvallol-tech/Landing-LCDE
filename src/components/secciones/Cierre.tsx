import { Rey } from '@/components/Piezas'
import { NEGOCIO, WA_CONSULTA } from '@/lib/negocio'

/**
 * Cierre (docs/07-copy-y-contenido.md §C.10).
 *
 * Último empujón, y los tres canales reales de contacto. Que se vea a quién le
 * están comprando es parte de resolver la objeción "¿esto es confiable?".
 */
export function Cierre() {
  return (
    <section className="grano relative overflow-hidden bg-[var(--color-carbon)] text-[var(--color-crema)]">
      <div
        className="tablero-marca-agua absolute inset-0 text-[var(--color-crema)]"
        aria-hidden="true"
      />

      <div className="contenedor seccion relative z-10">
        <div className="revelar mx-auto flex max-w-3xl flex-col items-center text-center">
          <Rey className="h-20 w-auto text-[var(--color-dorado)]" />

          <h2 className="mt-6 text-[length:var(--text-h2)] text-[var(--color-crema)]">
            El regalo que va a querer abrir dos veces.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--color-crema)]/80">
            La primera por la caja. La segunda porque ya aprendió a ganarte.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#packs" className="btn btn-sobre-oscuro text-base">
              Ver los packs
            </a>
            <a
              href={WA_CONSULTA}
              target="_blank"
              rel="noopener noreferrer"
              className="btn min-h-[44px] border-2 border-[var(--color-crema)] text-[var(--color-crema)] hover:bg-[var(--color-crema)] hover:text-[var(--color-carbon)]"
            >
              Escríbenos por WhatsApp 💬
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--color-crema)]/70">
            <a
              href={NEGOCIO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[var(--color-dorado)]"
            >
              {NEGOCIO.instagramUsuario}
            </a>
            <a
              href={`mailto:${NEGOCIO.email}`}
              className="underline underline-offset-4 hover:text-[var(--color-dorado)]"
            >
              {NEGOCIO.email}
            </a>
            <span className="numeros">{NEGOCIO.whatsappVisible}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
