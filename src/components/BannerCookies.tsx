'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GA_ID, META_PIXEL_ID } from '@/lib/sitio'

/**
 * Banner de cookies (docs/06-seguridad.md §8).
 *
 * Los píxeles de Meta y Google NO se cargan hasta que la persona acepta.
 * La preferencia se guarda en localStorage y se puede cambiar después desde
 * el enlace del pie de página.
 *
 * Si no hay ningún píxel configurado, el banner no aparece: no tiene sentido
 * pedir permiso para algo que no vamos a hacer.
 */

export const CLAVE_CONSENTIMIENTO = 'lcde:cookies'
export const EVENTO_CONSENTIMIENTO = 'lcde:consentimiento'

export type Consentimiento = 'aceptado' | 'rechazado'

export function leerConsentimiento(): Consentimiento | null {
  if (typeof window === 'undefined') return null
  const valor = window.localStorage.getItem(CLAVE_CONSENTIMIENTO)
  return valor === 'aceptado' || valor === 'rechazado' ? valor : null
}

function guardar(valor: Consentimiento) {
  window.localStorage.setItem(CLAVE_CONSENTIMIENTO, valor)
  window.dispatchEvent(new CustomEvent(EVENTO_CONSENTIMIENTO, { detail: valor }))
}

export function BannerCookies() {
  const hayPixeles = Boolean(META_PIXEL_ID || GA_ID)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hayPixeles) return
    if (leerConsentimiento() === null) setVisible(true)

    // El pie de página puede reabrir el banner para cambiar la decisión.
    const reabrir = () => setVisible(true)
    window.addEventListener('lcde:abrir-cookies', reabrir)
    return () => window.removeEventListener('lcde:abrir-cookies', reabrir)
  }, [hayPixeles])

  if (!hayPixeles || !visible) return null

  const decidir = (valor: Consentimiento) => {
    guardar(valor)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="titulo-cookies"
      className="fixed inset-x-0 bottom-0 z-[70] p-3 md:p-4"
    >
      <div className="contenedor">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-[var(--color-borde-oscuro)] bg-[var(--color-carbon)] p-4 text-[var(--color-crema)] shadow-[3px_3px_0_var(--color-dorado)] sm:flex-row sm:items-center sm:gap-5">
          <p className="flex-1 text-sm leading-relaxed">
            <span id="titulo-cookies" className="font-semibold">
              Usamos cookies de medición.
            </span>{' '}
            Nos sirven para saber si la publicidad funciona. Si prefieres que no,
            la página anda exactamente igual.{' '}
            <Link
              href="/privacidad"
              className="underline decoration-[var(--color-dorado)] underline-offset-2"
            >
              Política de privacidad
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => decidir('rechazado')}
              className="btn min-h-[44px] border-2 border-[var(--color-crema)] px-4 text-[var(--color-crema)] hover:bg-[var(--color-crema)] hover:text-[var(--color-carbon)]"
            >
              No, gracias
            </button>
            <button
              type="button"
              onClick={() => decidir('aceptado')}
              className="btn btn-sobre-oscuro px-4"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
