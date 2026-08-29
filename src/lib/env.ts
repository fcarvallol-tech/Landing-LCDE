import 'server-only'
import { z } from 'zod'

/**
 * Contrato del entorno (docs/05-arquitectura.md, docs/06-seguridad.md §1).
 *
 * Este módulo es EXCLUSIVAMENTE de servidor: el import de `server-only` hace
 * que el build falle si alguien intenta importarlo desde un componente cliente,
 * que es justo la protección que queremos para los secretos.
 *
 * Reglas:
 *  - Si falta una variable obligatoria, se falla ruidosamente con un mensaje
 *    que dice exactamente qué falta y dónde conseguirlo.
 *  - Si falta una variable opcional, la funcionalidad asociada se apaga sola
 *    y la página sigue funcionando.
 */

const noVacio = (nombre: string) =>
  z.string().trim().min(1, `Falta ${nombre}. Ver PUESTA-EN-MARCHA.md`)

const esquema = z.object({
  // ── Obligatorias para vender ──────────────────────────────────────────────
  MP_ACCESS_TOKEN: noVacio('MP_ACCESS_TOKEN'),
  MP_WEBHOOK_SECRET: noVacio('MP_WEBHOOK_SECRET'),
  NEXT_PUBLIC_SUPABASE_URL: noVacio('NEXT_PUBLIC_SUPABASE_URL').pipe(
    z.url('NEXT_PUBLIC_SUPABASE_URL debe ser una URL completa (https://...)'),
  ),
  SUPABASE_SERVICE_ROLE_KEY: noVacio('SUPABASE_SERVICE_ROLE_KEY'),

  // ── Obligatorias para el panel ────────────────────────────────────────────
  ADMIN_PASSWORD: z
    .string()
    .min(12, 'ADMIN_PASSWORD debe tener al menos 12 caracteres'),
  ADMIN_SESSION_SECRET: z
    .string()
    .min(32, 'ADMIN_SESSION_SECRET debe tener al menos 32 caracteres'),

  // ── Sitio ─────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SITE_URL: z
    .url('NEXT_PUBLIC_SITE_URL debe ser una URL completa (https://...)')
    .default('http://localhost:3000'),

  // ── Opcionales: si faltan, la funcionalidad se apaga ──────────────────────
  RESEND_API_KEY: z.string().trim().optional(),
  MAIL_FROM: z
    .string()
    .trim()
    .default('La Casa del Estratega <pedidos@lacasadelestratega.cl>'),
  MAIL_ADMIN: z.string().trim().default('fcarvallo@lacasadelestratega.cl'),
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().trim().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().trim().optional(),
  CSP_MODO: z.enum(['report-only', 'bloqueante']).default('report-only'),
})

export type Entorno = z.infer<typeof esquema>

/**
 * Durante `next build` no hay credenciales cargadas (Vercel las inyecta en
 * runtime para las funciones, pero el build de las páginas estáticas corre sin
 * ellas en local). Para que el build no reviente, la validación es perezosa:
 * se ejecuta la primera vez que alguien lee de verdad una variable.
 */
let cache: Entorno | null = null

function limpiar(valor: string | undefined): string | undefined {
  if (valor === undefined) return undefined
  const v = valor.trim()
  return v.length === 0 ? undefined : v
}

export function env(): Entorno {
  if (cache) return cache

  const resultado = esquema.safeParse({
    MP_ACCESS_TOKEN: limpiar(process.env.MP_ACCESS_TOKEN),
    MP_WEBHOOK_SECRET: limpiar(process.env.MP_WEBHOOK_SECRET),
    NEXT_PUBLIC_SUPABASE_URL: limpiar(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: limpiar(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ADMIN_PASSWORD: limpiar(process.env.ADMIN_PASSWORD),
    ADMIN_SESSION_SECRET: limpiar(process.env.ADMIN_SESSION_SECRET),
    NEXT_PUBLIC_SITE_URL: limpiar(process.env.NEXT_PUBLIC_SITE_URL),
    RESEND_API_KEY: limpiar(process.env.RESEND_API_KEY),
    MAIL_FROM: limpiar(process.env.MAIL_FROM),
    MAIL_ADMIN: limpiar(process.env.MAIL_ADMIN),
    NEXT_PUBLIC_MP_PUBLIC_KEY: limpiar(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY),
    NEXT_PUBLIC_META_PIXEL_ID: limpiar(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: limpiar(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    CSP_MODO: limpiar(process.env.CSP_MODO),
  })

  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((i) => `  · ${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('\n')
    throw new Error(
      'Falta configuración del entorno.\n\n' +
        problemas +
        '\n\nRevisa tu archivo .env.local (o las variables de entorno en Vercel).\n' +
        'La guía paso a paso está en PUESTA-EN-MARCHA.md\n',
    )
  }

  cache = resultado.data
  return cache
}

/** ¿Están las credenciales mínimas para poder cobrar? */
export function puedeVender(): boolean {
  try {
    env()
    return true
  } catch {
    return false
  }
}

/** El correo es opcional: si no hay API key, no se envía nada y no se rompe nada. */
export function correoActivo(): boolean {
  const clave = limpiar(process.env.RESEND_API_KEY)
  return Boolean(clave)
}
