'use client'

import Link from 'next/link'
import { Escudo } from '@/components/Piezas'
import { NEGOCIO } from '@/lib/negocio'
import { COMUNAS } from '@/lib/logistica'
import { GA_ID, META_PIXEL_ID } from '@/lib/sitio'

/** Pie de página (docs/07-copy-y-contenido.md §C.11). */
export function PieDePagina() {
  const hayPixeles = Boolean(META_PIXEL_ID || GA_ID)

  return (
    <footer className="border-t border-[var(--color-beige-borde)] bg-[var(--color-crema)]">
      <div className="contenedor py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Escudo className="h-9 w-auto text-[var(--color-terracota)]" />
              <p className="text-sm leading-none font-[family-name:var(--font-display)] text-[var(--color-carbon)]">
                La Casa
                <br />
                del Estratega
              </p>
            </div>
            <p className="medida mt-4 text-sm leading-relaxed text-[var(--color-gris)]">
              Tienda chilena de ajedrez. Tableros, piezas, relojes y accesorios, con entrega
              personal en la zona oriente de Santiago.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-[family-name:var(--font-display)] tracking-widest text-[var(--color-carbon)] uppercase">
              Contacto
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <a
                  href={`mailto:${NEGOCIO.email}`}
                  className="hover:text-[var(--color-terracota)] hover:underline"
                >
                  {NEGOCIO.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${NEGOCIO.whatsappNumero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="numeros hover:text-[var(--color-terracota)] hover:underline"
                >
                  {NEGOCIO.whatsappVisible}
                </a>
              </li>
              <li>
                <a
                  href={NEGOCIO.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-terracota)] hover:underline"
                >
                  {NEGOCIO.instagramUsuario}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-[family-name:var(--font-display)] tracking-widest text-[var(--color-carbon)] uppercase">
              Legal
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/terminos" className="hover:text-[var(--color-terracota)] hover:underline">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-[var(--color-terracota)] hover:underline">
                  Política de privacidad
                </Link>
              </li>
              {hayPixeles && (
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('lcde:abrir-cookies'))
                    }
                    className="text-left hover:text-[var(--color-terracota)] hover:underline"
                  >
                    Preferencias de cookies
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--color-beige-borde)] pt-5">
          <p className="text-xs leading-relaxed text-[var(--color-gris)]">
            Despachamos a {COMUNAS.join(' · ')}.
          </p>
          <p className="mt-2 text-xs text-[var(--color-gris)]">
            © {new Date().getFullYear()} {NEGOCIO.nombre}. Precios en pesos chilenos, IVA
            incluido.
          </p>
        </div>
      </div>

      {/* Cierre visual: la franja de tablero como firma de la marca. */}
      <div className="tablero-franja" aria-hidden="true" />
    </footer>
  )
}
