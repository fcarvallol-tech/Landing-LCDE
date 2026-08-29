import { formatearPrecio } from '@/lib/catalogo'
import { ENVIO_GRATIS_DESDE, COMUNAS } from '@/lib/logistica'

/**
 * Franja de confianza (docs/07-copy-y-contenido.md §C.2).
 *
 * Las cuatro cosas que este ICP necesita saber antes de seguir leyendo:
 * cuánto sale el envío, dónde llega, si es seguro pagar y cómo lo van a
 * contactar. Cuatro datos, sin adornos.
 */

const PUNTOS = [
  {
    titulo: `Despacho gratis sobre ${formatearPrecio(ENVIO_GRATIS_DESDE)}`,
    detalle: 'Bajo ese monto, $3.990.',
  },
  {
    titulo: `Entrega personal en ${COMUNAS.length} comunas`,
    detalle: 'La hacemos nosotros, no un courier.',
  },
  {
    titulo: 'Pago seguro con Mercado Pago',
    detalle: 'No vemos ni guardamos tu tarjeta.',
  },
  {
    titulo: 'Coordinamos por WhatsApp',
    detalle: 'Te escribimos dentro de 24 horas.',
  },
]

export function FranjaConfianza() {
  return (
    <section
      aria-label="Lo que incluye tu compra"
      className="border-y-2 border-[var(--color-carbon)] bg-[var(--color-beige)]"
    >
      <div className="contenedor">
        <ul className="grid grid-cols-1 divide-y divide-[var(--color-beige-borde)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {PUNTOS.map((punto, i) => (
            <li
              key={punto.titulo}
              className={`flex flex-col gap-0.5 py-4 sm:px-5 ${
                i > 0 ? 'lg:border-l lg:border-[var(--color-beige-borde)]' : ''
              } ${i === 1 || i === 3 ? 'sm:border-l sm:border-[var(--color-beige-borde)]' : ''} ${
                i < 2 ? 'sm:border-b sm:border-[var(--color-beige-borde)] lg:border-b-0' : ''
              }`}
            >
              <p className="text-sm leading-snug font-semibold text-[var(--color-carbon)]">
                {punto.titulo}
              </p>
              <p className="text-sm text-[var(--color-gris)]">{punto.detalle}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
