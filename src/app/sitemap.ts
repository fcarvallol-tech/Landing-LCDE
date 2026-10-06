import type { MetadataRoute } from 'next'
import { SITIO_URL } from '@/lib/sitio'

/** Sitemap: la landing, /jugadores y los dos textos legales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date()

  return [
    { url: SITIO_URL, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITIO_URL}/jugadores`,
      lastModified: ahora,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITIO_URL}/terminos`,
      lastModified: ahora,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITIO_URL}/privacidad`,
      lastModified: ahora,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
