import Image from 'next/image'
import { Escudo } from '@/components/Piezas'
import { FOTO_LOGO, FOTO_LOGO_OSCURO } from '@/lib/fotos-generadas'

/**
 * El logo real (docs/12-rediseno.md §2).
 *
 * Hay dos archivos y se elige por el fondo donde se pinta, nunca al revés:
 *  - `public/logo.png`: yelmo café sobre círculo beige, para fondos claros.
 *  - `public/logo-oscuro.png`: yelmo crema sobre círculo café, para fondos oscuros.
 *
 * Si el archivo que corresponde no existe, se dibuja el escudo SVG de siempre.
 * La página nunca queda con un hueco donde iba el logo.
 *
 * Los PNG originales miden 2250 px: next/image los sirve achicados al tamaño
 * real en pantalla, así que no pesan lo que pesa el archivo.
 */
export function Logo({
  fondo,
  className,
  tamano,
  prioridad = false,
}: {
  fondo: 'claro' | 'oscuro'
  /** Clases de alto y ancho. El logo es un círculo: alto y ancho iguales. */
  className?: string
  /** Lado más grande al que se va a mostrar, en px CSS. */
  tamano: number
  prioridad?: boolean
}) {
  const archivo = fondo === 'claro' ? FOTO_LOGO : FOTO_LOGO_OSCURO

  if (archivo) {
    return (
      <Image
        src={archivo}
        alt=""
        width={tamano}
        height={tamano}
        sizes={`${tamano}px`}
        loading={prioridad ? 'eager' : 'lazy'}
        className={className}
      />
    )
  }

  return (
    <Escudo
      className={`${className ?? ''} ${
        fondo === 'claro' ? 'text-[var(--color-terracota)]' : 'text-[var(--color-dorado)]'
      }`}
    />
  )
}
