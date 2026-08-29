import type { NextConfig } from 'next'

/**
 * Cabeceras de seguridad aplicadas a todas las rutas (docs/06-seguridad.md §6).
 * La Content-Security-Policy no vive acá: se arma en `src/proxy.ts` porque
 * necesita un nonce distinto por request.
 */
const CABECERAS_SEGURIDAD = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: CABECERAS_SEGURIDAD,
      },
      {
        // El panel nunca se indexa (docs/06-seguridad.md §7).
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ]
  },
}

export default nextConfig
