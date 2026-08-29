'use client'

import { ENVIO_GRATIS_DESDE } from '@/lib/logistica'
import { formatearPrecio } from '@/lib/catalogo'

/**
 * Barra de progreso hacia el despacho gratis (docs/04-logistica.md).
 *
 * Es la palanca de conversión más importante de la página: empuja del Pack
 * Tradicional hacia sumar el reloj o subir de pack. Por eso vive en el carrito
 * y no escondida en una FAQ.
 */
export function BarraEnvioGratis({
  subtotal,
  falta,
}: {
  subtotal: number
  falta: number
}) {
  const conseguido = falta <= 0
  const porcentaje = Math.min(100, Math.round((subtotal / ENVIO_GRATIS_DESDE) * 100))

  return (
    <div
      className={`rounded-xl border p-3 ${
        conseguido
          ? 'border-[var(--color-exito)] bg-[var(--color-exito)]/8'
          : 'border-[var(--color-beige-borde)] bg-[var(--color-beige)]'
      }`}
    >
      <p
        className="mb-2 text-sm leading-snug"
        // El texto cambia solo: hay que anunciarlo a los lectores de pantalla.
        aria-live="polite"
      >
        {conseguido ? (
          <span className="font-semibold text-[var(--color-exito)]">
            Despacho gratis conseguido
          </span>
        ) : (
          <>
            Te faltan{' '}
            <strong className="precio font-semibold text-[var(--color-carbon)]">
              {formatearPrecio(falta)}
            </strong>{' '}
            para el despacho gratis.
          </>
        )}
      </p>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-beige-borde)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        aria-label="Progreso hacia el despacho gratis"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
            conseguido ? 'bg-[var(--color-exito)]' : 'bg-[var(--color-terracota)]'
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
