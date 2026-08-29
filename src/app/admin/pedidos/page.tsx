import type { Metadata } from 'next'
import { listarPedidos, obtenerProductosAdmin } from '@/lib/datos'
import {
  ESTADOS_PEDIDO,
  type EstadoPedido,
  type FilaProducto,
  type PedidoConItems,
} from '@/lib/tipos'
import { PanelPedidos } from '@/components/admin/PanelPedidos'
import { EditorStock } from '@/components/admin/EditorStock'
import { BotonSalir } from '@/components/admin/BotonSalir'
import { Escudo } from '@/components/Piezas'

/**
 * Panel de pedidos y stock.
 *
 * El proxy (src/proxy.ts) ya verificó la sesión antes de que se ejecute nada de acá:
 * sin cookie válida, esta página nunca llega a renderizarse.
 */
export const metadata: Metadata = {
  title: 'Pedidos',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

function filtroValido(valor: string | undefined): EstadoPedido | 'todos' {
  if (valor === 'todos') return 'todos'
  if (valor && (ESTADOS_PEDIDO as readonly string[]).includes(valor)) {
    return valor as EstadoPedido
  }
  // Por defecto: lo que Felipe tiene que salir a entregar.
  return 'pagado'
}

export default async function PaginaPedidos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametros = await searchParams
  const bruto = parametros.estado
  const filtro = filtroValido(typeof bruto === 'string' ? bruto : undefined)

  let pedidos: PedidoConItems[] = []
  let productos: FilaProducto[] = []
  let errorCarga: string | null = null

  try {
    ;[pedidos, productos] = await Promise.all([
      listarPedidos({ estado: filtro }),
      obtenerProductosAdmin(),
    ])
  } catch (fallo) {
    errorCarga =
      fallo instanceof Error
        ? fallo.message
        : 'No pudimos conectar con la base de datos.'
  }

  return (
    <div className="min-h-screen bg-[var(--color-beige)]">
      <header className="border-b-2 border-[var(--color-carbon)] bg-[var(--color-crema)]">
        <div className="contenedor flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Escudo className="h-10 w-auto text-[var(--color-terracota)]" />
            <div>
              <h1 className="text-xl leading-none">Pedidos</h1>
              <p className="mt-1 text-xs text-[var(--color-gris)]">
                La Casa del Estratega
              </p>
            </div>
          </div>
          <BotonSalir />
        </div>
      </header>

      <main id="contenido" className="contenedor flex flex-col gap-6 py-6">
        {errorCarga && (
          <div
            role="alert"
            className="rounded-xl border-2 border-[var(--color-error)] bg-white p-4"
          >
            <h2 className="text-base text-[var(--color-error)]">
              No se pudo leer la base de datos
            </h2>
            <p className="mt-1 text-sm">
              Revisa que <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> estén bien configuradas y que hayas
              corrido las migraciones. El detalle técnico: {errorCarga}
            </p>
          </div>
        )}

        <PanelPedidos pedidos={pedidos} filtroActivo={filtro} />

        {productos.length > 0 && <EditorStock productos={productos} />}
      </main>
    </div>
  )
}
