'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CATALOGO, formatearPrecio, type IdProducto } from '@/lib/catalogo'
import { calcularTotales } from '@/lib/precios'
import { sugerenciaParaEnvioGratis } from '@/lib/sugerencia'
import { agregarAlCarrito } from '@/lib/eventos'
import { useCarrito, type Lineas } from '@/components/CarritoProvider'
import { BarraEnvioGratis } from '@/components/BarraEnvioGratis'
import { FormularioEntrega } from '@/components/FormularioEntrega'
import { FotoProducto } from '@/components/FotoProducto'

/**
 * Pantalla de compra directa (docs/12-rediseno.md §4).
 *
 * Se llega desde el botón "Lo quiero" de una tarjeta, con ese pack ya elegido.
 * Todo en una pantalla: qué llevas, el empujón hacia el despacho gratis y el
 * formulario de entrega. Un solo scroll entre el deseo y el pago.
 *
 * Es independiente del carrito: lo que se elige acá no se mezcla con lo que
 * la persona haya ido juntando en el carrito, ni lo borra.
 *
 * Los montos de esta pantalla son solo para mostrar. El servidor recibe ids y
 * cantidades, y recalcula todo desde su propio catálogo.
 */
export function PantallaCompra({ id }: { id: IdProducto }) {
  const { stock } = useCarrito()
  const [lineas, setLineas] = useState<Lineas>({ [id]: 1 })

  const items = (Object.entries(lineas) as [IdProducto, number][])
    .filter(([, n]) => n > 0)
    .map(([idLinea, cantidad]) => ({ id: idLinea, cantidad }))
  const totales = calcularTotales(items)

  const agotados = useMemo(
    () =>
      new Set(
        (Object.keys(stock) as IdProducto[]).filter((idProducto) => stock[idProducto]?.agotado),
      ),
    [stock],
  )

  const principal = CATALOGO[id]
  const sugerencia = sugerenciaParaEnvioGratis(lineas, agotados)

  if (agotados.has(id)) {
    return (
      <div className="contenedor py-14">
        <div className="mx-auto max-w-lg rounded-2xl border-2 border-[var(--color-carbon)] bg-white p-6 text-center sombra-block">
          <h1 className="text-[length:var(--text-h3)]">{principal.nombre} se agotó</h1>
          <p className="mt-3">
            Se vendió la última unidad. Mira los otros packs o escríbenos por WhatsApp.
          </p>
          <Link href="/#packs" className="btn btn-primario mt-6">
            Ver los packs
          </Link>
        </div>
      </div>
    )
  }

  function sumar(idSumar: IdProducto) {
    setLineas((previas) => ({ ...previas, [idSumar]: 1 }))
    agregarAlCarrito(idSumar, CATALOGO[idSumar].nombre, CATALOGO[idSumar].precio)
  }

  function quitar(idQuitar: IdProducto) {
    setLineas((previas) => {
      const siguientes = { ...previas }
      delete siguientes[idQuitar]
      return siguientes
    })
  }

  return (
    <div className="contenedor pt-4 pb-14 lg:pt-8">
      <Link
        href="/#packs"
        className="inline-block py-2 text-sm text-[var(--color-gris)] underline underline-offset-4 hover:text-[var(--color-terracota)]"
      >
        ← Ver los otros packs
      </Link>

      <div className="mt-2 grid items-start gap-8 lg:mt-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        {/* ── Lo que llevas ──────────────────────────────────────────────── */}
        <section aria-labelledby="titulo-pedido" className="lg:sticky lg:top-24">
          <h1 id="titulo-pedido" className="text-[length:var(--text-h3)]">
            Tu pedido
          </h1>

          <ul className="mt-4 flex flex-col gap-3">
            {totales.lineas.map((linea) => {
              const producto = CATALOGO[linea.id]
              const esPrincipal = linea.id === id
              return (
                <li
                  key={linea.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-[var(--color-carbon)] bg-white p-3 sombra-block-sm"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-beige)] sm:size-20">
                    <FotoProducto producto={producto} sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug font-semibold text-[var(--color-carbon)]">
                      {producto.nombre}
                    </p>
                    <p className="text-sm text-[var(--color-gris)]">{producto.trae}</p>
                    {!esPrincipal && (
                      <button
                        type="button"
                        onClick={() => quitar(linea.id)}
                        className="min-h-[32px] text-xs font-semibold text-[var(--color-gris)] underline underline-offset-2 hover:text-[var(--color-error)]"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <p className="precio shrink-0 self-start text-lg font-bold text-[var(--color-carbon)]">
                    {formatearPrecio(linea.total)}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="mt-4">
            <BarraEnvioGratis subtotal={totales.subtotal} falta={totales.faltaParaEnvioGratis} />
          </div>

          {/* El empujón: sumar sin salir de la pantalla. */}
          {sugerencia && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-[var(--color-terracota)] bg-[var(--color-crema)] p-4">
              <p className="font-[family-name:var(--font-display)] text-[0.9375rem] leading-snug text-[var(--color-carbon)]">
                {tituloSugerencia(sugerencia.id, sugerencia.daEnvioGratis)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-beige)]">
                  <FotoProducto producto={CATALOGO[sugerencia.id]} sizes="48px" />
                </div>
                <p className="min-w-0 flex-1 text-sm leading-snug">
                  {CATALOGO[sugerencia.id].trae}
                  <span className="precio block font-semibold text-[var(--color-carbon)]">
                    + {formatearPrecio(CATALOGO[sugerencia.id].precio)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => sumar(sugerencia.id)}
                  className="btn btn-secundario shrink-0 px-4 py-2 text-sm"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          <dl className="mt-4 flex flex-col gap-1 border-t border-[var(--color-beige-borde)] pt-3 text-sm">
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
        </section>

        {/* ── Dónde te lo llevamos ───────────────────────────────────────── */}
        <section
          aria-labelledby="titulo-entrega"
          className="rounded-2xl border-2 border-[var(--color-carbon)] bg-[var(--color-crema)] p-4 sombra-block sm:p-6"
        >
          <h2 id="titulo-entrega" className="text-[length:var(--text-h3)]">
            Dónde te lo llevamos
          </h2>
          <p className="mt-1 mb-5 text-sm text-[var(--color-gris)]">
            Te escribimos por WhatsApp dentro de 24 horas para coordinar día y hora.
          </p>
          <FormularioEntrega lineas={lineas} totales={totales} mostrarTotal />
        </section>
      </div>
    </div>
  )
}

function tituloSugerencia(id: IdProducto, daEnvioGratis: boolean): string {
  const que = id === 'reloj' ? 'el reloj' : `un ${CATALOGO[id].nombre}`
  return daEnvioGratis ? `Súmale ${que} y te llevas el despacho gratis` : `Súmale ${que}`
}
