import { z } from 'zod'
import { IDS_PRODUCTO } from '@/lib/catalogo'
import { CAMPANAS } from '@/lib/campanas'
import {
  COMUNAS,
  HORARIOS_PREFERIDOS,
  MAX_CANTIDAD_POR_SKU,
  MAX_ITEMS_POR_PEDIDO,
} from '@/lib/logistica'

/**
 * Validación del checkout (docs/06-seguridad.md §4).
 *
 * Este esquema es la puerta del servidor. Es `.strict()`: cualquier campo que
 * no esté acá se rechaza. En particular, si alguien intenta mandar `precio`,
 * `total` o `envio`, el pedido se rechaza en vez de ignorarlos en silencio.
 *
 * El mismo módulo lo usa el formulario del navegador para mostrar los errores
 * antes de enviar. La validación del navegador es una cortesía; la que manda
 * es la del servidor.
 */

// ── Teléfono chileno ────────────────────────────────────────────────────────

/**
 * Normaliza un móvil chileno a `+569XXXXXXXX`.
 * Acepta lo que la gente escribe de verdad: +56 9 1234 5678, 9 1234 5678,
 * 912345678, 56912345678, con puntos, guiones o paréntesis.
 * Devuelve null si no es un móvil chileno válido.
 */
export function normalizarTelefono(entrada: string): string | null {
  const digitos = entrada.replace(/[^\d]/g, '')

  // 56 9 XXXXXXXX  → 11 dígitos
  if (digitos.length === 11 && digitos.startsWith('569')) return `+${digitos}`
  // 9 XXXXXXXX     → 9 dígitos
  if (digitos.length === 9 && digitos.startsWith('9')) return `+56${digitos}`
  // XXXXXXXX       → 8 dígitos: se asume que olvidó el 9 inicial
  if (digitos.length === 8) return `+569${digitos}`

  return null
}

/** Muestra +569XXXXXXXX como +56 9 XXXX XXXX. */
export function formatearTelefono(normalizado: string): string {
  const d = normalizado.replace(/[^\d]/g, '')
  if (d.length !== 11) return normalizado
  return `+${d.slice(0, 2)} ${d.slice(2, 3)} ${d.slice(3, 7)} ${d.slice(7)}`
}

const telefono = z
  .string()
  .trim()
  .min(8, 'Escribe tu celular')
  .max(24, 'Ese número es demasiado largo')
  .transform((valor, ctx) => {
    const normalizado = normalizarTelefono(valor)
    if (!normalizado) {
      ctx.addIssue({
        code: 'custom',
        message: 'Necesitamos un celular chileno, por ejemplo +56 9 1234 5678',
      })
      return z.NEVER
    }
    return normalizado
  })

// ── Textos ──────────────────────────────────────────────────────────────────

/** Caracteres de control: no tienen nada que hacer en una dirección. */
const CONTROL = /[\u0000-\u001F\u007F-\u009F]/g

function limpiar(valor: string): string {
  return valor.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Texto libre obligatorio. No se hace escape de HTML acá: React escapa al
 * renderizar y los correos escapan al armarse (src/lib/correo.ts). Guardar el
 * dato tal como lo escribió la persona es lo correcto; el escape es
 * responsabilidad de cada salida.
 */
function textoObligatorio(max: number, minimo: number, mensaje: string) {
  return z
    .string()
    .max(max + 500, `Máximo ${max} caracteres`)
    .transform(limpiar)
    .pipe(z.string().min(minimo, mensaje).max(max, `Máximo ${max} caracteres`))
}

function textoOpcional(max: number) {
  return z
    .string()
    .max(max + 500)
    .transform((v) => {
      const limpio = limpiar(v).slice(0, max)
      return limpio.length === 0 ? null : limpio
    })
    .nullable()
    .optional()
    .transform((v) => v ?? null)
}

// ── Esquema del checkout ────────────────────────────────────────────────────

export const esquemaItem = z
  .object({
    id: z.enum(IDS_PRODUCTO),
    cantidad: z
      .number()
      .int('La cantidad debe ser un número entero')
      .min(1, 'Mínimo 1 unidad')
      .max(MAX_CANTIDAD_POR_SKU, `Máximo ${MAX_CANTIDAD_POR_SKU} por producto`),
  })
  .strict()

export const esquemaCliente = z
  .object({
    nombre: textoObligatorio(80, 3, 'Escribe tu nombre y apellido'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, 'Ese correo es demasiado largo')
      .pipe(z.email('Revisa tu correo, parece que le falta algo')),
    telefono,
    comuna: z.enum(COMUNAS, {
      message: 'Elige una de las comunas donde entregamos',
    }),
    direccion: textoObligatorio(140, 5, 'Escribe la calle y el número'),
    depto: textoOpcional(40),
    referencia: textoOpcional(200),
    horarioPreferido: z.enum(HORARIOS_PREFERIDOS).nullable().optional().default(null),
    esRegalo: z.boolean().optional().default(false),
    mensajeRegalo: textoOpcional(200),
  })
  .strict()

export const esquemaConsentimientos = z
  .object({
    terminos: z.literal(true, {
      message: 'Para comprar necesitas aceptar los términos y la privacidad',
    }),
    marketing: z.boolean().optional().default(false),
  })
  .strict()

export const esquemaCheckout = z
  .object({
    items: z
      .array(esquemaItem)
      .min(1, 'Tu carrito está vacío')
      .max(IDS_PRODUCTO.length, 'Hay productos repetidos en el pedido')
      .refine(
        (items) => new Set(items.map((i) => i.id)).size === items.length,
        'Hay productos repetidos en el pedido',
      )
      .refine(
        (items) => items.reduce((a, i) => a + i.cantidad, 0) <= MAX_ITEMS_POR_PEDIDO,
        `Un pedido puede llevar hasta ${MAX_ITEMS_POR_PEDIDO} unidades`,
      ),
    cliente: esquemaCliente,
    consentimientos: esquemaConsentimientos,
    /**
     * Honeypot. Las personas no lo ven; los bots lo llenan.
     * Si llega con algo, respondemos 200 falso y no creamos nada.
     */
    apellidoSegundo: z.string().max(500).optional().default(''),
    /**
     * Milisegundos desde que se montó el formulario. Menos de 3 segundos es
     * un bot: nadie llena una dirección completa en ese tiempo.
     */
    tiempoFormulario: z.number().int().min(0).max(86_400_000).optional().default(0),
    /**
     * Ángulo del anuncio con que llegó la persona (`?c=`, docs/12 §6). Lista
     * cerrada: cualquier otro valor hace fallar la petición, igual que un
     * campo desconocido. No influye en nada del cobro; solo se guarda.
     */
    campana: z.enum(CAMPANAS).nullable().optional().default(null),
  })
  .strict()

export type DatosCheckout = z.infer<typeof esquemaCheckout>

/** Tiempo mínimo razonable para llenar el formulario (docs/06 §5). */
export const MS_MINIMO_FORMULARIO = 3000
