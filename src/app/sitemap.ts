import type { MetadataRoute } from 'next'
import { SITIO_URL } from '@/lib/sitio'

/** Sitemap. Son tres páginas públicas: la landing y los dos textos legales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date()

  return [
    { url: SITIO_URL, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
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
