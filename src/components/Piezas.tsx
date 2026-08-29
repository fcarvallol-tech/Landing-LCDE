/**
 * Piezas de ajedrez dibujadas a mano en SVG.
 *
 * No son iconos de librería: están trazadas con el mismo peso visual que
 * Archivo Black (trazo grueso, formas macizas, sin detalles finos) para que
 * convivan con la tipografía en vez de competir con ella.
 *
 * Se usan para dos cosas:
 *  1. Como marcador de nivel de cada pack. La pieza sube de rango junto con el
 *     pack: peón → alfil → caballo → rey. Eso es exactamente la promesa de la
 *     marca (CM → IM → GM), dicha sin texto.
 *  2. Como ilustración de reemplazo mientras no existan las fotos reales.
 */

type PropsPieza = {
  className?: string
  /** Se dibuja con currentColor: el color lo pone quien la usa. */
  titulo?: string
}

function envoltura(titulo: string | undefined) {
  return titulo
    ? ({ role: 'img' as const, 'aria-label': titulo })
    : ({ 'aria-hidden': true as const, focusable: false as const })
}

/** Peón — el Pack Tradicional. Donde todos empiezan. */
export function Peon({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" {...envoltura(titulo)}>
      <circle cx="50" cy="24" r="17" />
      <path d="M34 42h32l-4 12H38z" />
      <path d="M40 56h20c0 16-6 24-6 36H46c0-12-6-20-6-36z" />
      <path d="M28 96h44l6 16H22z" />
    </svg>
  )
}

/** Alfil — el Pack CM. Ya se mueve en diagonal, ya hay intención. */
export function Alfil({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" {...envoltura(titulo)}>
      <circle cx="50" cy="12" r="7" />
      <path d="M50 22c14 0 24 14 24 28 0 12-8 20-8 26H34c0-6-8-14-8-26 0-14 10-28 24-28z" />
      <path d="M53 34l-9 22h5l9-22z" fill="var(--color-crema)" opacity=".55" />
      <path d="M32 82h36l3 12H29z" />
      <path d="M26 98h48l7 14H19z" />
    </svg>
  )
}

/** Caballo — el Pack IM. La pieza que no se mueve como ninguna otra. */
export function Caballo({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" {...envoltura(titulo)}>
      <path d="M38 10c-2 8-8 12-14 20-8 10-12 20-12 32 0 6 4 10 8 10 3 0 5-2 7-5 3-5 6-8 10-9-3 8-5 14-5 24h44c0-22 2-34-2-46C70 22 58 12 46 8c-4-1-7-1-8 2z" />
      <circle cx="35" cy="42" r="4" fill="var(--color-crema)" />
      <path d="M30 88h44l3 12H27z" />
      <path d="M24 104h56l6 12H18z" />
    </svg>
  )
}

/** Torre — usada en detalles y en la franja de cobertura. */
export function Torre({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" {...envoltura(titulo)}>
      <path d="M22 10h12v10h10V10h12v10h10V10h12v26H22z" />
      <path d="M30 40h40v46H30z" />
      <path d="M26 90h48l4 10H22z" />
      <path d="M20 104h60l6 12H14z" />
    </svg>
  )
}

/** Rey — el Pack GM. El final del camino. */
export function Rey({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" {...envoltura(titulo)}>
      <path d="M44 4h12v10h10v12H56v10H44V26H34V14h10z" />
      <path d="M50 38c16 0 28 10 28 22 0 10-6 16-6 24H28c0-8-6-14-6-24 0-12 12-22 28-22z" />
      <path d="M30 90h40l4 12H26z" />
      <path d="M22 106h56l7 12H15z" />
    </svg>
  )
}

/** Dama — aparece en los datos curiosos. */
export function Dama({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" {...envoltura(titulo)}>
      <circle cx="16" cy="18" r="7" />
      <circle cx="50" cy="10" r="8" />
      <circle cx="84" cy="18" r="7" />
      <path d="M16 24l10 34h48l10-34-18 22-16-26-16 26z" />
      <path d="M28 62h44v24H28z" />
      <path d="M24 90h52l4 12H20z" />
      <path d="M18 106h64l6 12H12z" />
    </svg>
  )
}

/** Reloj de ajedrez — para el SKU suelto. Dos esferas y el botón de arriba. */
export function RelojAjedrez({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 140 100" className={className} fill="currentColor" {...envoltura(titulo)}>
      <rect x="46" y="4" width="14" height="12" rx="3" />
      <rect x="80" y="4" width="14" height="12" rx="3" />
      <path d="M10 18h120a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" />
      <circle cx="45" cy="54" r="22" fill="var(--color-crema)" />
      <circle cx="95" cy="54" r="22" fill="var(--color-crema)" />
      <path
        d="M45 40v14l9 6"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M95 40v14l9 6"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/** Escudo con yelmo: la identidad de la marca, en versión mínima. */
export function Escudo({ className, titulo }: PropsPieza) {
  return (
    <svg viewBox="0 0 100 112" className={className} fill="none" {...envoltura(titulo)}>
      <path
        d="M50 3 92 15v42c0 27-19 43-42 52C27 100 8 84 8 57V15z"
        fill="currentColor"
      />
      {/* Yelmo de caballero: visera con ranura y penacho. */}
      <path
        d="M50 24c-12 0-20 9-20 20v16c0 9 9 16 20 16s20-7 20-16V44c0-11-8-20-20-20z"
        fill="var(--color-crema)"
      />
      <rect x="32" y="44" width="36" height="6" rx="3" fill="currentColor" />
      <rect x="32" y="56" width="36" height="6" rx="3" fill="currentColor" />
      <path d="M44 68h12v8H44z" fill="currentColor" />
    </svg>
  )
}

/** Elige la pieza que corresponde al producto. */
export function PiezaDeProducto({
  id,
  className,
}: {
  id: string
  className?: string
}) {
  switch (id) {
    case 'tradicional':
      return <Peon className={className} />
    case 'cm':
      return <Alfil className={className} />
    case 'im':
      return <Caballo className={className} />
    case 'gm':
      return <Rey className={className} />
    case 'reloj':
      return <RelojAjedrez className={className} />
    default:
      return <Peon className={className} />
  }
}
