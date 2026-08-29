/**
 * Sesión del panel de administración (docs/06-seguridad.md §7).
 *
 * Cookie firmada con HMAC-SHA256, `httpOnly` + `secure` + `sameSite=lax`,
 * 8 horas de vigencia. Nada de guardar la contraseña ni un token en
 * localStorage: si el navegador no puede leerlo, un XSS tampoco.
 *
 * Se usa Web Crypto (no `node:crypto`) a propósito: así este módulo funciona
 * igual en el middleware —que corre en el runtime Edge— y en las rutas de API.
 */

export const COOKIE_SESION = 'lcde_admin'
export const COOKIE_CSRF = 'lcde_csrf'

/** 8 horas, como pide docs/06-seguridad.md §7. */
export const DURACION_SESION_MS = 8 * 60 * 60 * 1000

function aBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const vista = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binario = ''
  for (const byte of vista) binario += String.fromCharCode(byte)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function firmar(mensaje: string, secreto: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const firma = await crypto.subtle.sign(
    'HMAC',
    clave,
    new TextEncoder().encode(mensaje),
  )
  return aBase64Url(firma)
}

/** Comparación en tiempo constante, sin fugas por la duración. */
export function igualesEnTiempoConstante(a: string, b: string): boolean {
  const bytesA = new TextEncoder().encode(a)
  const bytesB = new TextEncoder().encode(b)

  // La longitud sí se filtra, y no importa: lo que se protege es el contenido.
  if (bytesA.length !== bytesB.length) return false

  let diferencia = 0
  for (let i = 0; i < bytesA.length; i += 1) {
    diferencia |= (bytesA[i] as number) ^ (bytesB[i] as number)
  }
  return diferencia === 0
}

/**
 * Crea el valor de la cookie: `expiraEn.aleatorio.firma`.
 * La firma cubre expiración y aleatorio, así que nadie puede extenderse la
 * sesión editando la cookie.
 */
export async function crearSesion(secreto: string): Promise<{
  valor: string
  expiraEn: number
}> {
  const expiraEn = Date.now() + DURACION_SESION_MS
  const aleatorio = aBase64Url(crypto.getRandomValues(new Uint8Array(18)))
  const cuerpo = `${expiraEn}.${aleatorio}`
  const firma = await firmar(cuerpo, secreto)
  return { valor: `${cuerpo}.${firma}`, expiraEn }
}

export async function sesionValida(
  valor: string | undefined | null,
  secreto: string,
): Promise<boolean> {
  if (!valor) return false

  const partes = valor.split('.')
  if (partes.length !== 3) return false

  const [expiraEnTexto, aleatorio, firmaRecibida] = partes as [string, string, string]

  const expiraEn = Number(expiraEnTexto)
  if (!Number.isFinite(expiraEn) || expiraEn <= Date.now()) return false

  const esperada = await firmar(`${expiraEnTexto}.${aleatorio}`, secreto)
  return igualesEnTiempoConstante(esperada, firmaRecibida)
}

/** Token CSRF por sesión: se genera al entrar y viaja en cada mutación. */
export function nuevoTokenCsrf(): string {
  return aBase64Url(crypto.getRandomValues(new Uint8Array(24)))
}

/**
 * Verificación de origen para mutaciones (docs/06-seguridad.md §7).
 *
 * Doble red: el token CSRF de la sesión y la comprobación de que la petición
 * viene del mismo sitio.
 */
export function origenConfiable(cabeceras: Headers, urlSitio: string): boolean {
  const sitioDeFetch = cabeceras.get('sec-fetch-site')
  if (sitioDeFetch && sitioDeFetch !== 'same-origin') return false

  const origen = cabeceras.get('origin')
  if (origen) {
    try {
      const permitido = new URL(urlSitio).host
      if (new URL(origen).host !== permitido) return false
    } catch {
      return false
    }
  }

  // Sin Origin ni Sec-Fetch-Site no se puede juzgar por acá; el token CSRF
  // sigue siendo obligatorio.
  return true
}
