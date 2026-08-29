'use client'

import { useEffect, useRef, useState } from 'react'
import { CATALOGO, formatearPrecio, type IdProducto } from '@/lib/catalogo'
import { useCarrito } from '@/components/CarritoProvider'
import { BarraEnvioGratis } from '@/components/BarraEnvioGratis'
import { FormularioEntrega } from '@/components/FormularioEntrega'
import { PiezaDeProducto } from '@/components/Piezas'

/**
 * Carrito como panel lateral (docs/07-copy-y-contenido.md §C).
 *
 * Dos pasos dentro del mismo panel: primero qué llevas, después a dónde te lo
 * llevamos. Nunca saca a la persona de la página.
 *
 * Accesibilidad: es un diálogo modal de verdad — foco atrapado adentro, cierra
 * con Escape, devuelve el foco a donde estaba al cerrarse.
 */

const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function PanelCarrito() {
  const { abierto, cerrar, lineas, totales, stock, fijarCantidad, quitar, aviso, limpiarAviso } =
    useCarrito()

  const [paso, setPaso] = useState<'carrito' | 'entrega'>('carrito')
  const panelRef = useRef<HTMLDivElement>(null)
  const focoAnterior = useRef<HTMLElement | null>(null)

  // Al abrir: recordar dónde estaba el foco y llevarlo al panel.
  useEffect(() => {
    if (!abierto) {
      focoAnterior.current?.focus?.()
      setPaso('carrito')
      return
    }

    focoAnterior.current = document.activeElement as HTMLElement | null
    const primero = panelRef.current?.querySelector<HTMLElement>(SELECTOR_ENFOCABLES)
    primero?.focus()
  }, [abierto])

  // Atrapar el tabulador dentro del panel mientras está abierto.
  useEffect(() => {
    if (!abierto) return

    const alTabular = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return

      const enfocables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES),
      ).filter((el) => el.offsetParent !== null)

      if (enfocables.length === 0) return

      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      if (!primero || !ultimo) return

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alTabular)
    return () => document.removeEventListener('keydown', alTabular)
  }, [abierto])

  const entradas = Object.entries(lineas).filter(([, cantidad]) => (cantidad ?? 0) > 0) as [
    IdProducto,
    number,
  ][]

  const vacio = entradas.length === 0

  return (
    <>
      {/* Telón */}
      <div
        className={`fixed inset-0 z-[60] bg-[var(--color-carbon)]/55 transition-opacity duration-200 ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={cerrar}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        aria-hidden={!abierto}
        className={`fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col border-l border-[var(--color-beige-borde)] bg-[var(--color-crema)] transition-transform duration-250 ease-out ${
          abierto ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[var(--color-beige-borde)] px-5 py-4">
          <h2 className="text-lg">
            {paso === 'carrito' ? 'Tu carrito' : 'Dónde te lo llevamos'}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            className="grid size-11 place-items-center rounded-lg border border-[var(--color-beige-borde)] bg-white text-xl leading-none hover:bg-[var(--color-beige)]"
            aria-label="Cerrar el carrito"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {paso === 'carrito' ? (
            vacio ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <PiezaDeProducto
                  id="tradicional"
                  className="h-20 w-auto text-[var(--color-beige-borde)]"
                />
                <p className="text-[var(--color-gris)]">
                  Todavía no eliges nada.
                  <br />
                  Los packs están más arriba.
                </p>
                <button type="button" onClick={cerrar} className="btn btn-secundario">
                  Ver los packs
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {aviso && (
                  <div
                    role="status"
                    className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-dorado)] bg-[var(--color-dorado)]/10 p-3 text-sm"
                  >
                    <span>{aviso}</span>
                    <button
                      type="button"
                      onClick={limpiarAviso}
                      aria-label="Cerrar el aviso"
                      className="shrink-0 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                <ul className="flex flex-col gap-3">
                  {entradas.map(([id, cantidad]) => {
                    const producto = CATALOGO[id]
                    const disponible = stock[id]?.stock ?? 0

                    return (
                      <li
                        key={id}
                        className="flex gap-3 rounded-xl border border-[var(--color-beige-borde)] bg-white p-3"
                      >
                        <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-[var(--color-beige)]">
                          <PiezaDeProducto
                            id={id}
                            className="h-10 w-auto text-[var(--color-terracota)]"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug font-semibold text-[var(--color-carbon)]">
                            {producto.nombre}
                          </p>
                          <p className="precio mt-0.5 text-sm text-[var(--color-gris)]">
                            {formatearPrecio(producto.precio)} c/u
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center rounded-lg border border-[var(--color-beige-borde)]">
                              <button
                                type="button"
                                onClick={() => fijarCantidad(id, cantidad - 1)}
                                className="grid size-9 place-items-center text-lg leading-none hover:bg-[var(--color-beige)]"
                                aria-label={`Quitar una unidad de ${producto.nombre}`}
                              >
                                −
                              </button>
                              <span
                                className="precio w-8 text-center text-sm font-semibold"
                                aria-live="polite"
                                aria-label={`${cantidad} unidades de ${producto.nombre}`}
                              >
                                {cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={() => fijarCantidad(id, cantidad + 1)}
                                disabled={cantidad >= Math.min(10, disponible)}
                                className="grid size-9 place-items-center text-lg leading-none hover:bg-[var(--color-beige)] disabled:opacity-35"
                                aria-label={`Agregar una unidad de ${producto.nombre}`}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => quitar(id)}
                              className="ml-auto min-h-[36px] text-xs font-semibold text-[var(--color-gris)] underline underline-offset-2 hover:text-[var(--color-error)]"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>

                        <p className="precio shrink-0 self-start text-sm font-bold text-[var(--color-carbon)]">
                          {formatearPrecio(producto.precio * cantidad)}
                        </p>
                      </li>
                    )
                  })}
                </ul>

                <BarraEnvioGratis
                  subtotal={totales.subtotal}
                  falta={totales.faltaParaEnvioGratis}
                />
              </div>
            )
          ) : (
            <FormularioEntrega onVolver={() => setPaso('carrito')} />
          )}
        </div>

        {/* Pie con el total: siempre visible, en los dos pasos. */}
        {!vacio && (
          <div className="border-t border-[var(--color-beige-borde)] bg-[var(--color-beige)] px-5 py-4">
            <dl className="mb-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <dt>Productos</dt>
                <dd className="precio font-semibold">{formatearPrecio(totales.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Despacho</dt>
                <dd className="precio font-semibold">
                  {totales.envioEsGratis ? (
                    <span className="text-[var(--color-exito)]">Gratis</span>
                  ) : (
                    formatearPrecio(totales.costoEnvio)
                  )}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-[var(--color-beige-borde)] pt-2 text-base">
                <dt className="font-semibold text-[var(--color-carbon)]">Total</dt>
                <dd className="precio text-lg font-bold text-[var(--color-carbon)]">
                  {formatearPrecio(totales.total)}
                </dd>
              </div>
            </dl>

            {paso === 'carrito' && (
              <button
                type="button"
                onClick={() => setPaso('entrega')}
                className="btn btn-primario w-full text-base"
              >
                Continuar
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
