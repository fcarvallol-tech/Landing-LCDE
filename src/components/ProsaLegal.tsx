/** Contenedor de tipografía para los documentos legales. */
export function ProsaLegal({
  titulo,
  actualizado,
  children,
}: {
  titulo: string
  actualizado: string
  children: React.ReactNode
}) {
  return (
    <div className="contenedor seccion">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[length:var(--text-h2)]">{titulo}</h1>
        <p className="mt-3 text-sm text-[var(--color-gris)]">
          Última actualización: {actualizado}
        </p>

        <div className="mt-8 flex flex-col gap-6 [&_a]:text-[var(--color-terracota)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-4 [&_h2]:text-[1.25rem] [&_li]:leading-relaxed [&_p]:leading-relaxed [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  )
}
