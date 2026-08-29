'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATALOGO, formatearPrecio, type IdProducto } from '@/lib/catalogo'
import { COOKIE_CSRF } from '@/lib/sesion'
import type { FilaProducto } from '@/lib/tipos'

/**
 * Editor de stock (docs/02-catalogo.md §3: requisito duro).
 *
 * Felipe tiene que poder contar sus cajas y escribir el número acá, sin tocar
 * código y sin entrar nunca a Supabase. Un campo por producto y un botón.
 */
export function EditorStock({ productos }: { productos: FilaProducto[] }) {
  return (
    <div className="rounded-xl border border-[var(--color-beige-borde)] bg-white p-4">
      <h2 className="text-lg">Stock</h2>
      <p className="mt-1 text-sm text-[var(--color-gris)]">
        Cuenta lo que tienes y escribe el número. Se guarda al instante y la página
        pública se actualiza dentro del minuto.
      </p>

      <ul className="mt-4 flex flex-col divide-y divide-[var(--color-beige-borde)]">
        {productos.map((producto) => (
          <li key={producto.id}>
            <FilaStock producto={producto} />
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-lg bg-[var(--color-beige)] p-3 text-xs leading-relaxed text-[var(--color-marron)]">
        Con 0 unidades el producto aparece en gris y no se puede comprar. Entre 1 y 5 se
        muestra “Últimas N unidades”. Sobre 5 no se muestra ningún número.
      </p>
    </div>
  )
}

function FilaStock({ producto }: { producto: FilaProducto }) {
  const router = useRouter()
  const [valor, setValor] = useState(String(producto.stock))
  const [estado, setEstado] = useState<'quieto' | 'guardando' | 'listo' | 'error'>(
    'quieto',
  )
  const [mensaje, setMensaje] = useState<string | null>(null)

  const catalogo = CATALOGO[producto.id as IdProducto]
  const cambiado = String(producto.stock) !== valor

  async function guardar() {
    const numero = Number(valor)
    if (!Number.isInteger(numero) || numero < 0) {
      setEstado('error')
      setMensaje('Escribe un número entero, 0 o más.')
      return
    }

    setEstado('guardando')
    setMensaje(null)

    const csrf =
      document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${COOKIE_CSRF}=`))
        ?.slice(COOKIE_CSRF.length + 1) ?? ''

    try {
      const respuesta = await fetch('/api/admin/acciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'stock',
          productoId: producto.id,
          stock: numero,
          csrf: decodeURIComponent(csrf),
        }),
      })

      if (!respuesta.ok) {
        const cuerpo = (await respuesta.json().catch(() => null)) as {
          mensaje?: string
        } | null
        setEstado('error')
        setMensaje(cuerpo?.mensaje ?? 'No se pudo guardar.')
        return
      }

      setEstado('listo')
      setMensaje('Guardado')
      router.refresh()
      setTimeout(() => setEstado('quieto'), 2000)
    } catch {
      setEstado('error')
      setMensaje('Se cortó la conexión.')
    }
  }

  const idCampo = `stock-${producto.id}`

  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={idCampo} className="block font-medium text-[var(--color-carbon)]">
          {catalogo?.nombre ?? producto.nombre}
        </label>
        <p className="precio text-sm text-[var(--color-gris)]">
          {formatearPrecio(producto.precio)}
        </p>
      </div>

      <input
        id={idCampo}
        type="number"
        inputMode="numeric"
        min={0}
        max={100000}
        step={1}
        value={valor}
        onChange={(e) => {
          setValor(e.target.value)
          setEstado('quieto')
          setMensaje(null)
        }}
        className="campo numeros w-24 text-center"
      />

      <button
        type="button"
        onClick={guardar}
        disabled={!cambiado || estado === 'guardando'}
        className="btn btn-primario min-h-[44px] px-4 text-sm"
      >
        {estado === 'guardando' ? 'Guardando…' : 'Guardar'}
      </button>

      <p
        aria-live="polite"
        className={`w-full text-sm sm:w-auto ${
          estado === 'error'
            ? 'font-semibold text-[var(--color-error)]'
            : 'text-[var(--color-exito)]'
        }`}
      >
        {mensaje}
      </p>
    </div>
  )
}
