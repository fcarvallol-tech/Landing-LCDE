import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESION, sesionValida } from '@/lib/sesion'

/**
 * Middleware. Hace dos cosas:
 *
 *  1. Protege /admin/* y /api/admin/* (docs/06-seguridad.md §7).
 *  2. Arma la Content-Security-Policy con un nonce distinto por petición
 *     (docs/06-seguridad.md §6).
 *
 * El webhook de Mercado Pago queda deliberadamente fuera: tiene que poder
 * llamarlo Mercado Pago sin sesión. Su protección es la firma, no una cookie.
 */

/**
 * La CSP arranca en modo `Report-Only`: reporta en la consola sin romper nada.
 * Cuando Felipe verifique en la consola del navegador que el checkout de
 * Mercado Pago, el píxel de Meta y GA funcionan sin avisos, cambia
 * CSP_MODO=bloqueante en Vercel y la protección pasa a ser real.
 * El paso a paso está en PUESTA-EN-MARCHA.md.
 */
function construirCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic' hace que los scripts cargados POR un script con nonce
    // hereden la confianza: es lo que permite que GA y Meta funcionen sin
    // abrir la política a dominios enteros.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    // Tailwind y next/font insertan estilos en línea: no hay forma de evitarlo.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.facebook.com https://www.google-analytics.com https://http2.mlstatic.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
    "frame-src https://*.mercadopago.com https://*.mercadolibre.com",
    "form-action 'self' https://*.mercadopago.com https://*.mercadolibre.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

export async function middleware(peticion: NextRequest) {
  const { pathname } = peticion.nextUrl

  // ── 1. Puerta del panel ───────────────────────────────────────────────────
  const esRutaProtegida =
    (pathname.startsWith('/admin') && pathname !== '/admin') ||
    (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/entrar'))

  if (esRutaProtegida) {
    const secreto = process.env.ADMIN_SESSION_SECRET

    // Sin secreto configurado no hay forma de validar una sesión: se cierra.
    // Es preferible un panel inaccesible a un panel abierto.
    if (!secreto) {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ mensaje: 'Panel no configurado' }, { status: 503 })
        : NextResponse.redirect(new URL('/admin?error=configuracion', peticion.url))
    }

    const cookie = peticion.cookies.get(COOKIE_SESION)?.value
    const valida = await sesionValida(cookie, secreto)

    if (!valida) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ mensaje: 'Sesión expirada' }, { status: 401 })
      }
      const destino = new URL('/admin', peticion.url)
      destino.searchParams.set('error', 'sesion')
      return NextResponse.redirect(destino)
    }
  }

  // ── 2. CSP con nonce ──────────────────────────────────────────────────────
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  )
  const csp = construirCsp(nonce)

  // El nonce llega a los componentes por cabecera de petición: Next lo aplica
  // solo a los scripts que él inyecta.
  const cabeceras = new Headers(peticion.headers)
  cabeceras.set('x-nonce', nonce)

  const respuesta = NextResponse.next({ request: { headers: cabeceras } })

  const bloqueante = process.env.CSP_MODO === 'bloqueante'
  respuesta.headers.set(
    bloqueante ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    csp,
  )

  return respuesta
}

export const config = {
  matcher: [
    /*
     * Todo menos los archivos estáticos y el webhook.
     * El webhook se excluye para no gastarle tiempo en cabeceras que no mira
     * y para dejar constancia de que no depende de ninguna sesión.
     */
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|icono.svg|apple-icon.png|robots.txt|sitemap.xml|api/webhooks).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }],
    },
  ],
}
