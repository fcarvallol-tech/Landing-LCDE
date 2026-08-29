import Link from 'next/link'
import { Escudo } from '@/components/Piezas'
import { NEGOCIO } from '@/lib/negocio'

/**
 * Marco simple para las páginas que no son la landing: retorno de pago y
 * legales. Encabezado mínimo y pie con lo justo.
 */
export function MarcoPagina({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-beige-borde)]">
        <div className="contenedor flex h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${NEGOCIO.nombre}, ir al inicio`}
          >
            <Escudo className="h-9 w-auto text-[var(--color-terracota)]" />
            <span className="text-sm leading-none font-[family-name:var(--font-display)] text-[var(--color-carbon)]">
              La Casa
              <br />
              del Estratega
            </span>
          </Link>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-[var(--color-beige-borde)]">
        <div className="contenedor flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-[var(--color-gris)]">
          <p>
            © {new Date().getFullYear()} {NEGOCIO.nombre}
          </p>
          <nav className="flex gap-4" aria-label="Enlaces legales">
            <Link href="/terminos" className="hover:text-[var(--color-terracota)] hover:underline">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-[var(--color-terracota)] hover:underline">
              Privacidad
            </Link>
            <a
              href={`mailto:${NEGOCIO.email}`}
              className="hover:text-[var(--color-terracota)] hover:underline"
            >
              Contacto
            </a>
          </nav>
        </div>
        <div className="tablero-franja" aria-hidden="true" />
      </footer>
    </div>
  )
}
