/**
 * Los dos íconos del encabezado (docs/12-rediseno.md §1).
 *
 * Dibujados a mano con el mismo trazo grueso que las piezas (docs/03: nada de
 * sets de iconos de librería). Son decorativos: el texto accesible lo pone el
 * botón o el enlace que los contiene.
 */

type PropsIcono = { className?: string }

/** Bolsa de compras: el carrito. */
export function IconoBolsa({ className }: PropsIcono) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

/** Globo de conversación con un auricular: WhatsApp, sin copiar el logo. */
export function IconoWhatsApp({ className }: PropsIcono) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.6z" />
      <path
        d="M9.2 8.6c.2-.5.6-.6 1-.5l.6 1.4c.1.3 0 .5-.2.7l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.4-.3.7-.2l1.4.6c.1.4 0 .8-.5 1-1.6.8-5.9-2.4-5.5-5.5z"
        fill="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}
