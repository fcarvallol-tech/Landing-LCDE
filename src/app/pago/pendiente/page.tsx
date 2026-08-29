import type { Metadata } from 'next'
import { EstadoPago } from '@/components/EstadoPago'
import { MarcoPagina } from '@/components/MarcoPagina'

/**
 * Retorno de Mercado Pago.
 *
 * La página no confía en los parámetros que trae la URL: el componente
 * consulta el estado real del pedido en nuestro servidor.
 */
export const metadata: Metadata = {
  title: 'Confirmando tu pago',
  // Estas páginas llevan un id de pedido en la URL: no se indexan.
  robots: { index: false, follow: false },
}

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametros = await searchParams
  const bruto = parametros.pedido
  const pedidoId = typeof bruto === 'string' ? bruto : null

  return (
    <MarcoPagina>
      <div className="contenedor seccion">
        <EstadoPago pedidoId={pedidoId} variante="pendiente" />
      </div>
    </MarcoPagina>
  )
}
