/**
 * Variantes de titular por campaña (docs/12-rediseno.md §6).
 *
 * El anuncio promete algo y la página abre diciendo exactamente eso. El ángulo
 * llega en la URL como `?c=` y se guarda en el pedido (columna `campana`) para
 * saber después qué ángulo trajo compras.
 *
 * No es un test A/B: es coherencia entre el anuncio y la página.
 *
 * Este módulo no tiene secretos: lo usan el servidor, el proxy y el navegador.
 */

export const CAMPANAS = ['pantalla', 'juntos', 'pensar', 'practico'] as const
export type Campana = (typeof CAMPANAS)[number]

/** Las que cambian el titular de la página principal. */
export type CampanaPortada = Exclude<Campana, 'practico'>

/** Valor desconocido o ausente → este titular. */
export const CAMPANA_POR_DEFECTO: CampanaPortada = 'pantalla'

/**
 * Las que necesitan su propia versión pre-generada de la portada. `pantalla`
 * no está porque es la portada normal; `practico` tampoco, porque vive en
 * /jugadores.
 */
export const CAMPANAS_CON_VARIANTE = ['juntos', 'pensar'] as const

/**
 * Titular partido en tres para poder pintar en terracota la parte que pesa.
 * Textos literales de docs/12-rediseno.md §6.
 */
export type Titular = { antes: string; destacado: string; despues: string }

export const TITULARES: Record<CampanaPortada, Titular> = {
  pantalla: {
    antes: 'Una hora de ajedrez es una hora que ',
    destacado: 'no fue de pantalla',
    despues: '.',
  },
  juntos: {
    antes: 'El mejor regalo para tu hijo eres tú, ',
    destacado: 'sentado al frente',
    despues: '.',
  },
  pensar: {
    antes: 'Que aprenda a pensar ',
    destacado: 'dos jugadas más adelante',
    despues: '.',
  },
}

export function esCampana(valor: unknown): valor is Campana {
  return typeof valor === 'string' && (CAMPANAS as readonly string[]).includes(valor)
}

/** Normaliza lo que venga en `?c=`: minúsculas, sin espacios. Null si no sirve. */
export function leerCampana(valor: string | null | undefined): Campana | null {
  if (!valor) return null
  const limpio = valor.trim().toLowerCase()
  return esCampana(limpio) ? limpio : null
}

export function esCampanaConVariante(
  valor: unknown,
): valor is (typeof CAMPANAS_CON_VARIANTE)[number] {
  return (
    typeof valor === 'string' && (CAMPANAS_CON_VARIANTE as readonly string[]).includes(valor)
  )
}

// ── Recordar la campaña durante la visita ──────────────────────────────────
// La persona puede llegar con ?c=juntos, pasar por /jugadores y comprar desde
// /comprar/cm: para entonces el parámetro ya no está en la URL. Se guarda en
// sessionStorage (muere al cerrar la pestaña) y se manda con el pedido.
// No es un dato personal: es solo el nombre del ángulo del anuncio.

const CLAVE = 'lcde:campana'

export function recordarCampana(campana: Campana): void {
  try {
    window.sessionStorage.setItem(CLAVE, campana)
  } catch {
    // Almacenamiento bloqueado: el pedido se guarda igual, sin campaña.
  }
}

export function campanaRecordada(): Campana | null {
  try {
    return leerCampana(window.sessionStorage.getItem(CLAVE))
  } catch {
    return null
  }
}
