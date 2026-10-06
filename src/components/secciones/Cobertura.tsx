import { formatearPrecio } from '@/lib/catalogo'
import {
  COMUNAS,
  COSTO_ENVIO,
  ENVIO_GRATIS_DESDE,
  TEXTO_PLAZO,
} from '@/lib/logistica'
import { WA_FUERA_DE_COBERTURA } from '@/lib/negocio'

/**
 * Cobertura y despacho (docs/04-logistica.md y docs/07 §C.8).
 *
 * Las 9 comunas se listan una por una, en grande. Es una limitación real del
 * negocio y esconderla solo produce pedidos que hay que devolver.
 */
export function Cobertura() {
  return (
    <section id="despacho" className="contenedor seccion">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="revelar">
          <p className="eyebrow mb-3">Cobertura</p>
          <h2 className="text-[length:var(--text-h2)]">
            Estas nueve comunas. Por ahora, solo estas.
          </h2>
          <p className="medida mt-4 text-lg leading-relaxed">
            La entrega la hacemos nosotros, en persona. Por eso la cobertura es acotada:
            preferimos llegar bien a nueve comunas que llegar mal a treinta.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {COMUNAS.map((comuna) => (
              <li
                key={comuna}
                className="rounded-lg border border-[var(--color-carbon)] bg-[var(--color-beige)] px-3 py-1.5 text-sm font-semibold text-[var(--color-carbon)]"
              >
                {comuna}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm">
            <a
              href={WA_FUERA_DE_COBERTURA}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-terracota)] underline underline-offset-2"
            >
              ¿No estás en estas comunas? Escríbenos por WhatsApp y vemos qué podemos
              hacer.
            </a>
          </p>
        </div>

        <div className="revelar flex flex-col gap-4">
          <div className="rounded-xl border-2 border-[var(--color-carbon)] bg-[var(--color-crema)] p-6 sombra-block">
            <h3 className="text-[1.0625rem]">Cuánto cuesta el despacho</h3>
            <dl className="mt-4 flex flex-col gap-3 text-[0.9375rem]">
              <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-beige-borde)] pb-3">
                <dt>Compras desde {formatearPrecio(ENVIO_GRATIS_DESDE)}</dt>
                <dd className="precio font-bold text-[var(--color-exito)]">Gratis</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt>Bajo ese monto</dt>
                <dd className="precio font-bold text-[var(--color-carbon)]">
                  {formatearPrecio(COSTO_ENVIO)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-[var(--color-gris)]">
              El umbral se calcula sobre el valor de los productos, antes del despacho.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-beige-borde)] bg-[var(--color-beige)] p-6">
            <h3 className="text-[1.0625rem]">Cuándo llega</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed">{TEXTO_PLAZO}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
