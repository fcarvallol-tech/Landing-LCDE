/**
 * Aviso obligatorio al pie de los dos documentos legales
 * (docs/07-copy-y-contenido.md §G).
 *
 * Está a la vista, no escondido: estos textos los preparó una máquina y tienen
 * que pasar por un abogado antes de operar comercialmente.
 */
export function AvisoLegal() {
  return (
    <aside
      role="note"
      className="mt-10 rounded-xl border-2 border-[var(--color-dorado)] bg-[var(--color-dorado)]/10 p-5"
    >
      <p className="text-[0.9375rem] leading-relaxed font-semibold text-[var(--color-carbon)]">
        Este texto es un borrador preparado automáticamente. Antes de operar
        comercialmente, revísalo con un abogado.
      </p>
    </aside>
  )
}
