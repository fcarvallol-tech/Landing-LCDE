import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Portada } from '@/components/Portada'
import { CAMPANAS_CON_VARIANTE, esCampanaConVariante } from '@/lib/campanas'

/**
 * Variantes de la portada por campaña (docs/12-rediseno.md §6).
 *
 * Nadie llega acá escribiendo esta URL: el proxy reescribe `/?c=juntos` hacia
 * `/campana/juntos` sin cambiar la barra de direcciones. Se pre-generan en el
 * build igual que la portada, así que son igual de rápidas.
 *
 * Son la misma página con otro titular: para los buscadores, la canónica es
 * `/` y estas no se indexan.
 */
export const revalidate = 60
export const dynamicParams = false

export function generateStaticParams() {
  return CAMPANAS_CON_VARIANTE.map((c) => ({ c }))
}

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
}

export default async function PaginaCampana({ params }: { params: Promise<{ c: string }> }) {
  const { c } = await params
  if (!esCampanaConVariante(c)) notFound()
  return <Portada campana={c} />
}
