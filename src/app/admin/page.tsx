import type { Metadata } from 'next'
import { FormularioLogin } from '@/components/admin/FormularioLogin'
import { Escudo } from '@/components/Piezas'

/** Login del panel. Nunca se indexa (docs/06-seguridad.md §7). */
export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametros = await searchParams
  const error = typeof parametros.error === 'string' ? parametros.error : null

  const mensaje =
    error === 'sesion'
      ? 'Tu sesión terminó. Vuelve a entrar.'
      : error === 'configuracion'
        ? 'El panel todavía no está configurado. Falta ADMIN_SESSION_SECRET en las variables de entorno.'
        : null

  return (
    <main
      id="contenido"
      className="grid min-h-screen place-items-center bg-[var(--color-beige)] px-5 py-12"
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Escudo className="h-14 w-auto text-[var(--color-terracota)]" />
          <div>
            <h1 className="text-2xl">Panel de pedidos</h1>
            <p className="mt-1 text-sm text-[var(--color-gris)]">
              La Casa del Estratega
            </p>
          </div>
        </div>

        <FormularioLogin mensajeInicial={mensaje} />
      </div>
    </main>
  )
}
