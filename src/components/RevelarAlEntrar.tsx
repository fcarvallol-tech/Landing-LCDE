'use client'

import { useEffect } from 'react'

/**
 * Fade-up de las secciones al entrar en pantalla (docs/03-marca-y-estilo.md).
 *
 * IntersectionObserver puro, sin librería de animación. Cada elemento se revela
 * una sola vez y después se deja de observar.
 *
 * Si el usuario pidió menos movimiento, esto no hace absolutamente nada: se
 * marca todo como visible de inmediato.
 */
export function RevelarAlEntrar() {
  useEffect(() => {
    const elementos = document.querySelectorAll<HTMLElement>('.revelar')
    if (elementos.length === 0) return

    const prefiereMenosMovimiento = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefiereMenosMovimiento || !('IntersectionObserver' in window)) {
      elementos.forEach((el) => el.classList.add('visible'))
      return
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('visible')
          observador.unobserve(entrada.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    elementos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
  }, [])

  return null
}
