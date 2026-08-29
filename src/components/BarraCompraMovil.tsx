'use client'

import { useEffect, useState } from 'react'
import { formatearPrecio } from '@/lib/catalogo'
import { useCarrito } from '@/components/CarritoProvider'

/**
 * Barra fija inferior en mobile (docs/03-marca-y-estilo.md, "mobile first").
 *
 * La campaña es de Instagram: casi todo el tráfico llega desde el celular y el
 * botón de compra tiene que estar siempre a un gesto de distancia.
 *
 * Aparece recién cuando la persona pasó el hero, para no tapar la primera
 * impresión. Se esconde mientras el panel del carrito está abierto.
 */
export function BarraCompraMovil() {
  const { totales, abrir, abierto } = useCarrito()
  const [pasoElHero, setPasoElHero] = useState(false)

  useEffect(() => {
    const alScroll = () => setPasoElHero(window.scrollY > 420)
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  const hayCarrito = totales.unidades > 0
  const visible = pasoElHero && !abierto

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-beige-borde)] bg-[var(--color-crema)]/97 backdrop-blur-sm transition-transform duration-200 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          {hayCarrito ? (
            <>
              <p className="text-xs text-[var(--color-gris)]">
                {totales.unidades} {totales.unidades === 1 ? 'producto' : 'productos'}
                {totales.envioEsGratis && ' · despacho gratis'}
              </p>
              <p className="precio text-lg leading-tight font-bold text-[var(--color-carbon)]">
                {formatearPrecio(totales.total)}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--color-gris)]">Packs desde</p>
              <p className="precio text-lg leading-tight font-bold text-[var(--color-carbon)]">
                {formatearPrecio(15990)}
              </p>
            </>
          )}
        </div>

        {hayCarrito ? (
          <button type="button" onClick={abrir} className="btn btn-primario flex-1">
            Ir a pagar
          </button>
        ) : (
          <a href="#packs" className="btn btn-primario flex-1">
            Ver los packs
          </a>
        )}
      </div>
    </div>
  )
}
