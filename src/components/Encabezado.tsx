'use client'

import { useEffect, useState } from 'react'
import { Escudo } from '@/components/Piezas'
import { useCarrito } from '@/components/CarritoProvider'
import { NEGOCIO } from '@/lib/negocio'
import { FOTO_LOGO } from '@/lib/fotos-generadas'

/**
 * Encabezado fijo. Discreto: la landing es la protagonista, no la navegación.
 * Se opaca al hacer scroll para que el contenido no se lea a través de él.
 */
export function Encabezado() {
  const { totales, abrir } = useCarrito()
  const [conFondo, setConFondo] = useState(false)

  useEffect(() => {
    const alScroll = () => setConFondo(window.scrollY > 24)
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        conFondo
          ? 'border-b border-[var(--color-beige-borde)] bg-[var(--color-crema)]/95 backdrop-blur-sm'
          : 'border-b border-transparent'
      }`}
    >
      <div className="contenedor flex h-16 items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-2.5" aria-label={`${NEGOCIO.nombre}, ir al inicio`}>
          {FOTO_LOGO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={FOTO_LOGO} alt="" className="h-9 w-auto" width={36} height={40} />
          ) : (
            <Escudo className="h-9 w-auto text-[var(--color-terracota)]" />
          )}
          <span className="hidden text-sm leading-none font-[family-name:var(--font-display)] tracking-tight text-[var(--color-carbon)] sm:block">
            La Casa
            <br />
            del Estratega
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Secciones">
          <a href="#packs" className="hover:text-[var(--color-terracota)]">
            Los packs
          </a>
          <a href="#beneficios" className="hover:text-[var(--color-terracota)]">
            Por qué ajedrez
          </a>
          <a href="#despacho" className="hover:text-[var(--color-terracota)]">
            Despacho
          </a>
          <a href="#preguntas" className="hover:text-[var(--color-terracota)]">
            Preguntas
          </a>
        </nav>

        <button
          type="button"
          onClick={abrir}
          className="btn btn-secundario relative min-h-[44px] px-4 py-2 text-sm"
          aria-label={
            totales.unidades > 0
              ? `Abrir el carrito, ${totales.unidades} ${totales.unidades === 1 ? 'producto' : 'productos'}`
              : 'Abrir el carrito, está vacío'
          }
        >
          Carrito
          {totales.unidades > 0 && (
            <span
              className="numeros grid size-5 place-items-center rounded-full bg-[var(--color-terracota)] text-[11px] font-bold text-[var(--color-crema)]"
              aria-hidden="true"
            >
              {totales.unidades}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
