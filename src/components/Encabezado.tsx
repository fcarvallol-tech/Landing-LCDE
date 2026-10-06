'use client'

import Link from 'next/link'
import { useCarrito } from '@/components/CarritoProvider'
import { Logo } from '@/components/Logo'
import { IconoBolsa, IconoWhatsApp } from '@/components/Iconos'
import { NEGOCIO, WA_CONSULTA } from '@/lib/negocio'

/**
 * Encabezado (docs/12-rediseno.md §1).
 *
 * Logo al centro, como en deathwishcoffee.com. A la izquierda dos enlaces; a
 * la derecha el carrito y WhatsApp, como íconos. En móvil solo el logo y los
 * dos íconos.
 *
 * El carrito es un ícono discreto con un contador que aparece solo cuando hay
 * algo adentro: para una visita nueva el carrito siempre está vacío y no puede
 * ser lo más llamativo de la pantalla.
 *
 * Es lo único sticky de la página (docs/10).
 */

export type EnlaceEncabezado = { href: string; texto: string }

export function Encabezado({
  enlaces,
  inicio = '/',
}: {
  /** Los dos enlaces de la izquierda. Cada página decide a dónde llevan. */
  enlaces: EnlaceEncabezado[]
  /** A dónde lleva el logo. En la portada, al ancla del hero. */
  inicio?: string
}) {
  const { totales, abrir } = useCarrito()
  const unidades = totales.unidades

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-beige-borde)] bg-[var(--color-crema)]/95 backdrop-blur-sm">
      <div className="contenedor grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-16">
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Secciones">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="py-2 hover:text-[var(--color-terracota)] hover:underline hover:underline-offset-4"
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>
        {/* En móvil la columna izquierda queda vacía: mantiene el logo centrado. */}
        <span className="md:hidden" aria-hidden="true" />

        <Link
          href={inicio}
          className="grid place-items-center rounded-full"
          aria-label={`${NEGOCIO.nombre}, ir al inicio`}
        >
          <Logo fondo="claro" tamano={40} prioridad className="size-8 md:size-10" />
        </Link>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={abrir}
            className="relative grid size-11 place-items-center rounded-lg text-[var(--color-carbon)] hover:bg-[var(--color-beige)]"
            aria-label={
              unidades > 0
                ? `Abrir el carrito, ${unidades} ${unidades === 1 ? 'producto' : 'productos'}`
                : 'Abrir el carrito, está vacío'
            }
          >
            <IconoBolsa className="size-6" />
            {unidades > 0 && (
              <span
                className="numeros absolute top-1 right-0.5 grid min-w-[18px] place-items-center rounded-full bg-[var(--color-terracota)] px-1 text-[10px] leading-[18px] font-bold text-[var(--color-crema)]"
                aria-hidden="true"
              >
                {unidades}
              </span>
            )}
          </button>

          <a
            href={WA_CONSULTA}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-11 place-items-center rounded-lg text-[var(--color-carbon)] hover:bg-[var(--color-beige)]"
            aria-label="Escríbenos por WhatsApp (se abre en otra pestaña)"
          >
            <IconoWhatsApp className="size-6" />
          </a>
        </div>
      </div>
    </header>
  )
}
