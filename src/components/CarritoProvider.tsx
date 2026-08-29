'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CATALOGO, esIdProducto, type IdProducto } from '@/lib/catalogo'
import { calcularTotales, type Totales } from '@/lib/precios'
import { MAX_CANTIDAD_POR_SKU, MAX_ITEMS_POR_PEDIDO } from '@/lib/logistica'
import { agregarAlCarrito as pixelAgregar } from '@/lib/eventos'
import type { ProductoPublico } from '@/lib/tipos'

/**
 * Estado del carrito. Vive solo en el navegador (docs/05-arquitectura.md §1):
 * acá no se guarda ningún dato personal, solo qué productos y cuántos.
 *
 * Los totales que se muestran salen de calcularTotales(), la misma función que
 * usa el servidor. Pero el número que se cobra es SIEMPRE el que recalcula el
 * servidor: esto es solo para que la persona vea lo que va a pasar.
 */

const CLAVE = 'lcde:carrito'

export type Lineas = Partial<Record<IdProducto, number>>

type ContextoCarrito = {
  lineas: Lineas
  totales: Totales
  /** Estado de stock de cada producto, leído en el servidor. */
  stock: Record<IdProducto, ProductoPublico>
  abierto: boolean
  agregar: (id: IdProducto) => void
  quitar: (id: IdProducto) => void
  fijarCantidad: (id: IdProducto, cantidad: number) => void
  vaciar: () => void
  abrir: () => void
  cerrar: () => void
  /** Se llenó el pedido máximo: sirve para avisar sin bloquear en silencio. */
  aviso: string | null
  limpiarAviso: () => void
}

const Contexto = createContext<ContextoCarrito | null>(null)

export function useCarrito(): ContextoCarrito {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return ctx
}

function leerGuardado(): Lineas {
  if (typeof window === 'undefined') return {}
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    if (!crudo) return {}
    const datos: unknown = JSON.parse(crudo)
    if (typeof datos !== 'object' || datos === null) return {}

    const limpio: Lineas = {}
    for (const [id, cantidad] of Object.entries(datos)) {
      if (!esIdProducto(id)) continue
      if (typeof cantidad !== 'number' || !Number.isFinite(cantidad)) continue
      const n = Math.trunc(cantidad)
      if (n > 0) limpio[id] = Math.min(n, MAX_CANTIDAD_POR_SKU)
    }
    return limpio
  } catch {
    return {}
  }
}

export function CarritoProvider({
  stock,
  children,
}: {
  stock: Record<IdProducto, ProductoPublico>
  children: ReactNode
}) {
  const [lineas, setLineas] = useState<Lineas>({})
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [hidratado, setHidratado] = useState(false)

  // El carrito se recupera después del primer render para que el HTML del
  // servidor y el del cliente coincidan.
  useEffect(() => {
    setLineas(leerGuardado())
    setHidratado(true)
  }, [])

  useEffect(() => {
    if (!hidratado) return
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(lineas))
    } catch {
      // Modo incógnito con almacenamiento bloqueado: el carrito simplemente
      // no sobrevive a un refresh. No es motivo para romper nada.
    }
  }, [lineas, hidratado])

  // Cerrar el panel con Escape.
  useEffect(() => {
    if (!abierto) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', alTeclado)
    return () => document.removeEventListener('keydown', alTeclado)
  }, [abierto])

  // Bloquear el scroll del fondo mientras el panel está abierto.
  useEffect(() => {
    if (!abierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [abierto])

  const unidadesTotales = useMemo(
    () => Object.values(lineas).reduce((a, n) => a + (n ?? 0), 0),
    [lineas],
  )

  const fijarCantidad = useCallback(
    (id: IdProducto, cantidad: number) => {
      setLineas((previas) => {
        const siguientes = { ...previas }
        const disponible = stock[id]?.stock ?? 0
        const tope = Math.min(MAX_CANTIDAD_POR_SKU, Math.max(0, disponible))
        const n = Math.max(0, Math.min(Math.trunc(cantidad), tope))

        if (n === 0) {
          delete siguientes[id]
        } else {
          siguientes[id] = n
        }
        return siguientes
      })
    },
    [stock],
  )

  const agregar = useCallback(
    (id: IdProducto) => {
      const info = stock[id]
      if (!info || info.agotado) return

      if (unidadesTotales >= MAX_ITEMS_POR_PEDIDO) {
        setAviso(
          `Un pedido puede llevar hasta ${MAX_ITEMS_POR_PEDIDO} unidades. Para más, escríbenos por WhatsApp.`,
        )
        return
      }

      const actual = lineas[id] ?? 0
      const tope = Math.min(MAX_CANTIDAD_POR_SKU, info.stock)

      if (actual >= tope) {
        setAviso(
          actual >= MAX_CANTIDAD_POR_SKU
            ? `Máximo ${MAX_CANTIDAD_POR_SKU} unidades por producto.`
            : `Nos quedan ${info.stock} unidades de este producto.`,
        )
        return
      }

      setLineas((previas) => ({ ...previas, [id]: (previas[id] ?? 0) + 1 }))
      setAviso(null)
      pixelAgregar(id, CATALOGO[id].nombre, CATALOGO[id].precio)
      setAbierto(true)
    },
    [lineas, stock, unidadesTotales],
  )

  const quitar = useCallback((id: IdProducto) => {
    setLineas((previas) => {
      const siguientes = { ...previas }
      delete siguientes[id]
      return siguientes
    })
  }, [])

  const vaciar = useCallback(() => setLineas({}), [])

  const totales = useMemo(
    () =>
      calcularTotales(
        (Object.entries(lineas) as [IdProducto, number][]).map(([id, cantidad]) => ({
          id,
          cantidad,
        })),
      ),
    [lineas],
  )

  const valor = useMemo<ContextoCarrito>(
    () => ({
      lineas,
      totales,
      stock,
      abierto,
      agregar,
      quitar,
      fijarCantidad,
      vaciar,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
      aviso,
      limpiarAviso: () => setAviso(null),
    }),
    [lineas, totales, stock, abierto, agregar, quitar, fijarCantidad, vaciar, aviso],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
