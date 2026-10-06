import type { MetadataRoute } from 'next'
import { SITIO_URL } from '@/lib/sitio'

/**
 * robots.txt. El panel, las páginas de pago, los pasos de compra y las
 * variantes de titular por campaña nunca se indexan.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/pago/', '/comprar/', '/campana/'],
      },
    ],
    sitemap: `${SITIO_URL}/sitemap.xml`,
    host: SITIO_URL,
  }
}
