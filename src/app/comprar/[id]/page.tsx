import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { obtenerEstadoProductos } from '@/lib/datos'
import { CATALOGO, IDS_PRODUCTO, esIdProducto } from '@/lib/catalogo'
import { CarritoProvider } from '@/components/CarritoProvider'
import { BarraAnuncio } from '@/components/BarraAnuncio'
import { Encabezado } from '@/components/Encabezado'
import { PanelCarrito } from '@/components/PanelCarrito'
import { PieDePagina } from '@/components/PieDePagina'
import { PantallaCompra } from '@/components/PantallaCompra'

/**
 * /comprar/[id] — la pantalla de compra directa (docs/12-rediseno.md §4).
 *
 * Una por producto, pre-generadas en el build y revalidadas cada 60 segundos,
 * igual que la portada: el stock que se ve es el del último minuto. Igual
 * el servidor lo vuelve a verificar al crear el pago.
 *
 * No se indexa: es un paso de compra, no una página para llegar desde Google.
 */
export const revalidate = 60
export const dynamicParams = false

export function generateStaticParams() {
  return IDS_PRODUCTO.map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (!esIdProducto(id)) return {}
  return {
    title: `Comprar ${CATALOGO[id].nombre}`,
    robots: { index: false, follow: false },
  }
}

export default async function PaginaComprar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!esIdProducto(id)) notFound()

  const stock = await obtenerEstadoProductos()

  return (
    <CarritoProvider stock={stock}>
      <BarraAnuncio />
      <Encabezado
        enlaces={[
          { href: '/#packs', texto: 'Los packs' },
          { href: '/#beneficios', texto: 'Por qué ajedrez' },
        ]}
      />

      <main id="contenido">
        <PantallaCompra id={id} />
      </main>

      <PieDePagina />
      <PanelCarrito />
    </CarritoProvider>
  )
}
