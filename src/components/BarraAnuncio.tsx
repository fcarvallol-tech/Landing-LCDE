import { formatearPrecio } from '@/lib/catalogo'
import { ENVIO_GRATIS_DESDE } from '@/lib/logistica'

/**
 * Barra de anuncio (docs/12-rediseno.md §1 y docs/10).
 *
 * Un solo mensaje, fijo: sin rotación, sin cuenta regresiva, sin botón de
 * cerrar. No es sticky: lo único sticky es el encabezado que viene debajo.
 *
 * En un celular angosto la frase no cabe en una línea: cada mitad va en su
 * propio bloque que no se corta, así se parte justo en el punto, y el punto
 * se esconde para que no quede colgando al final de la primera línea.
 */
export function BarraAnuncio() {
  return (
    <div className="bg-[var(--color-carbon)] text-[var(--color-crema)]">
      <p className="contenedor flex flex-wrap items-center justify-center gap-x-2 py-1.5 text-center text-[0.75rem] leading-snug font-medium tracking-wide sm:py-2 sm:text-[0.8125rem]">
        <span className="whitespace-nowrap">
          Despacho gratis desde{' '}
          <span className="numeros">{formatearPrecio(ENVIO_GRATIS_DESDE)}</span>
        </span>
        <span aria-hidden="true" className="hidden text-[var(--color-dorado)] min-[480px]:inline">
          ·
        </span>
        <span className="whitespace-nowrap">Entrega personal en Santiago oriente</span>
      </p>
    </div>
  )
}
