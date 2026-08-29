/**
 * Catálogo — ÚNICA fuente de verdad de precios (docs/02-catalogo.md).
 *
 * Este archivo se importa desde el servidor para calcular totales. El cliente
 * jamás envía un precio: envía `id` y `cantidad`, y el servidor recalcula.
 * Los datos de este módulo son públicos (nombres, precios) y por eso también
 * se pueden renderizar en el cliente, pero el CÁLCULO del total ocurre solo
 * en el servidor (ver src/lib/precios.ts).
 */

export const IDS_PRODUCTO = ['tradicional', 'cm', 'im', 'gm', 'reloj'] as const
export type IdProducto = (typeof IDS_PRODUCTO)[number]

export type Producto = {
  id: IdProducto
  nombre: string
  /** Bajada corta para la card. */
  resumen: string
  /** Lo que viene dentro, en viñetas. */
  contenido: string[]
  /** Precio final en CLP, IVA incluido, sin decimales. */
  precio: number
  edadMin: number
  /** Orden de aparición en la página. */
  orden: number
  /** Etiqueta destacada, si corresponde. */
  etiqueta?: 'mas-elegido' | 'tope-de-gama'
  /** Texto alternativo de la foto, para accesibilidad. */
  alt: string
}

export const CATALOGO: Record<IdProducto, Producto> = {
  tradicional: {
    id: 'tradicional',
    nombre: 'Pack Tradicional',
    resumen: 'El punto de partida. Tablero y piezas para aprender jugando.',
    contenido: ['Tablero de ajedrez', 'Juego completo de piezas'],
    precio: 15990,
    edadMin: 5,
    orden: 1,
    alt: 'Pack Tradicional: tablero de ajedrez con su juego completo de piezas',
  },
  cm: {
    id: 'cm',
    nombre: 'Pack CM · Candidato a Maestro',
    resumen: 'El juego completo más un bolso para llevarlo a todas partes.',
    contenido: ['Tablero de ajedrez', 'Juego completo de piezas', 'Bolso para transportarlo'],
    precio: 29990,
    edadMin: 6,
    orden: 2,
    etiqueta: 'mas-elegido',
    alt: 'Pack CM: juego de ajedrez completo junto a su bolso de transporte',
  },
  im: {
    id: 'im',
    nombre: 'Pack IM · Maestro Internacional',
    resumen: 'Con reloj: acá empiezan las partidas de verdad.',
    contenido: ['Tablero de ajedrez', 'Juego completo de piezas', 'Reloj de ajedrez'],
    precio: 39990,
    edadMin: 8,
    orden: 3,
    alt: 'Pack IM: juego de ajedrez completo junto a un reloj de ajedrez',
  },
  gm: {
    id: 'gm',
    nombre: 'Pack GM · Gran Maestro',
    resumen: 'Todo lo que necesita un jugador de club. El regalo grande.',
    contenido: [
      'Tablero de ajedrez',
      'Juego completo de piezas',
      'Reloj de ajedrez',
      'Bolso profesional',
    ],
    precio: 49990,
    edadMin: 8,
    orden: 4,
    etiqueta: 'tope-de-gama',
    alt: 'Pack GM: juego de ajedrez completo con reloj y bolso profesional',
  },
  reloj: {
    id: 'reloj',
    nombre: 'Reloj de ajedrez',
    resumen: 'El mismo reloj de los packs IM y GM, en su cajita. Regalo perfecto.',
    contenido: ['Reloj de ajedrez', 'Cajita original'],
    precio: 24990,
    edadMin: 8,
    orden: 5,
    alt: 'Reloj de ajedrez presentado en su cajita',
  },
}

/** Lista ordenada, la forma en que se muestra en la página. */
export const PRODUCTOS: Producto[] = IDS_PRODUCTO.map((id) => CATALOGO[id]).sort(
  (a, b) => a.orden - b.orden,
)

export function esIdProducto(valor: unknown): valor is IdProducto {
  return typeof valor === 'string' && (IDS_PRODUCTO as readonly string[]).includes(valor)
}

/** Formato chileno: $29.990. Sin decimales, punto como separador de miles. */
export function formatearPrecio(clp: number): string {
  return '$' + Math.round(clp).toLocaleString('es-CL', { maximumFractionDigits: 0 })
}
