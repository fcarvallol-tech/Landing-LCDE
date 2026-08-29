import type { MetadataRoute } from 'next'
import { SITIO_URL } from '@/lib/sitio'

/** robots.txt. El panel y las páginas de retorno de pago nunca se indexan. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/pago/'],
      },
    ],
    sitemap: `${SITIO_URL}/sitemap.xml`,
    host: SITIO_URL,
  }
}
