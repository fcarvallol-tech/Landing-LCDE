/**
 * Datos reales del negocio (CLAUDE.md). Un solo lugar para cambiarlos.
 */

export const NEGOCIO = {
  nombre: 'La Casa del Estratega',
  dominio: 'lacasadelestratega.cl',
  email: 'fcarvallo@lacasadelestratega.cl',
  /** Formato humano, para mostrar. */
  whatsappVisible: '+56 9 6292 3073',
  /** Formato para links wa.me: sin +, sin espacios. */
  whatsappNumero: '56962923073',
  instagram: 'https://www.instagram.com/lacasadelestratega/',
  instagramUsuario: '@lacasadelestratega',
} as const

/** Arma un link de WhatsApp con mensaje prellenado. */
export function linkWhatsApp(mensaje: string): string {
  return `https://wa.me/${NEGOCIO.whatsappNumero}?text=${encodeURIComponent(mensaje)}`
}

export const WA_CONSULTA = linkWhatsApp(
  'Hola, tengo una consulta sobre los packs de ajedrez de La Casa del Estratega.',
)

export const WA_FUERA_DE_COBERTURA = linkWhatsApp(
  'Hola, quiero comprar un pack pero no estoy en las comunas de despacho. ¿Qué podemos hacer?',
)
