import { NextResponse, type NextRequest } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { env } from '@/lib/env'
import { ipDe, reiniciarLimite, verificarLimite } from '@/lib/limite'
import {
  COOKIE_CSRF,
  COOKIE_SESION,
  crearSesion,
  nuevoTokenCsrf,
} from '@/lib/sesion'

/**
 * POST /api/admin/entrar — login del panel (docs/06-seguridad.md §7).
 *
 * Puntos que importan:
 *  · La contraseña se compara en TIEMPO CONSTANTE con `timingSafeEqual`, nunca
 *    con `===`. Se comparan los hashes SHA-256 y no los textos, para que la
 *    comparación no filtre siquiera el largo de la contraseña real.
 *  · Rate limiting con backoff: 5 intentos cada 15 minutos por IP.
 *  · La sesión va en cookie firmada httpOnly. El navegador no puede leerla.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_INTENTOS = 5
const VENTANA_MS = 15 * 60 * 1000

const esquema = z.object({ password: z.string().max(200) }).strict()

/** Compara sin filtrar tiempo ni longitud. */
function contrasenaCorrecta(recibida: string, esperada: string): boolean {
  const a = createHash('sha256').update(recibida, 'utf8').digest()
  const b = createHash('sha256').update(esperada, 'utf8').digest()
  return timingSafeEqual(a, b)
}

export async function POST(peticion: NextRequest) {
  const ip = ipDe(peticion.headers)
  const clave = `admin-login:${ip}`
  const limite = verificarLimite(clave, MAX_INTENTOS, VENTANA_MS)

  if (!limite.permitido) {
    const minutos = Math.ceil(limite.reintentarEn / 60)
    return NextResponse.json(
      {
        mensaje: `Demasiados intentos. Vuelve a probar en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}.`,
      },
      { status: 429, headers: { 'Retry-After': String(limite.reintentarEn) } },
    )
  }

  let entorno
  try {
    entorno = env()
  } catch {
    return NextResponse.json(
      {
        mensaje:
          'El panel todavía no está configurado. Falta ADMIN_PASSWORD o ADMIN_SESSION_SECRET.',
      },
      { status: 503 },
    )
  }

  let crudo: unknown
  try {
    crudo = await peticion.json()
  } catch {
    return NextResponse.json({ mensaje: 'Petición inválida' }, { status: 400 })
  }

  const analisis = esquema.safeParse(crudo)
  if (!analisis.success) {
    return NextResponse.json({ mensaje: 'Petición inválida' }, { status: 400 })
  }

  if (!contrasenaCorrecta(analisis.data.password, entorno.ADMIN_PASSWORD)) {
    // Mensaje deliberadamente vago: no confirma ni desmiente nada.
    return NextResponse.json({ mensaje: 'Contraseña incorrecta' }, { status: 401 })
  }

  // Login correcto: se limpia el contador para no castigar la sesión buena.
  reiniciarLimite(clave)

  const sesion = await crearSesion(entorno.ADMIN_SESSION_SECRET)
  const csrf = nuevoTokenCsrf()

  const respuesta = NextResponse.json({ ok: true }, { status: 200 })
  const enProduccion = process.env.NODE_ENV === 'production'

  respuesta.cookies.set(COOKIE_SESION, sesion.valor, {
    httpOnly: true,
    secure: enProduccion,
    sameSite: 'lax',
    path: '/',
    expires: new Date(sesion.expiraEn),
  })

  // El token CSRF sí lo lee el JavaScript del panel para mandarlo de vuelta:
  // ese es justamente el punto del patrón "double submit".
  respuesta.cookies.set(COOKIE_CSRF, csrf, {
    httpOnly: false,
    secure: enProduccion,
    sameSite: 'lax',
    path: '/',
    expires: new Date(sesion.expiraEn),
  })

  return respuesta
}

/** DELETE — cerrar sesión. */
export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true })
  respuesta.cookies.delete(COOKIE_SESION)
  respuesta.cookies.delete(COOKIE_CSRF)
  return respuesta
}
