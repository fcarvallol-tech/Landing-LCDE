import 'server-only'
import { supabase } from '@/lib/supabase'
import { IDS_PRODUCTO, esIdProducto, type IdProducto } from '@/lib/catalogo'
import type {
  EstadoPedido,
  FilaPedido,
  FilaPedidoItem,
  FilaProducto,
  PedidoConItems,
  ProductoPublico,
} from '@/lib/tipos'

/**
 * Acceso a datos. Todo pasa por acá; ningún componente habla con Supabase
 * directamente.
 */

/** Umbral bajo el cual se muestra "Últimas N unidades" (docs/02-catalogo.md §4). */
const UMBRAL_STOCK_BAJO = 5

/**
 * Estado de stock de los 5 productos, para pintar la landing.
 *
 * Si Supabase no responde (o todavía no está configurado) devolvemos todos los
 * productos como disponibles sin badge: la página se ve bien igual y el
 * servidor volverá a validar el stock de verdad al momento del checkout.
 */
export async function obtenerEstadoProductos(): Promise<Record<IdProducto, ProductoPublico>> {
  const porDefecto = () =>
    Object.fromEntries(
      IDS_PRODUCTO.map((id) => [
        id,
        { id, stock: 99, activo: true, agotado: false, mostrarUltimas: false },
      ]),
    ) as Record<IdProducto, ProductoPublico>

  try {
    const { data, error } = await supabase()
      .from('productos')
      .select('id, stock, activo')

    if (error || !data) return porDefecto()

    const mapa = porDefecto()
    for (const fila of data as Pick<FilaProducto, 'id' | 'stock' | 'activo'>[]) {
      if (!esIdProducto(fila.id)) continue
      const stock = Math.max(0, fila.stock ?? 0)
      const activo = fila.activo !== false
      mapa[fila.id] = {
        id: fila.id,
        stock,
        activo,
        agotado: !activo || stock <= 0,
        mostrarUltimas: activo && stock > 0 && stock <= UMBRAL_STOCK_BAJO,
      }
    }
    return mapa
  } catch {
    return porDefecto()
  }
}

/** Stock crudo de todos los productos, para el panel. */
export async function obtenerProductosAdmin(): Promise<FilaProducto[]> {
  const { data, error } = await supabase()
    .from('productos')
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw new Error(`No se pudo leer los productos: ${error.message}`)
  return (data ?? []) as FilaProducto[]
}

export async function actualizarStock(id: string, stock: number): Promise<void> {
  if (!esIdProducto(id)) throw new Error('Producto desconocido')
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    throw new Error('Stock inválido')
  }

  const { error } = await supabase().from('productos').update({ stock }).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el stock: ${error.message}`)
}

export async function actualizarActivo(id: string, activo: boolean): Promise<void> {
  if (!esIdProducto(id)) throw new Error('Producto desconocido')
  const { error } = await supabase().from('productos').update({ activo }).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`)
}

/**
 * Verifica que haya stock suficiente para todas las líneas del carrito.
 * Ojo: acá NO se descuenta nada. El descuento ocurre solo cuando el pago se
 * confirma, dentro de confirmar_pago() (docs/02-catalogo.md §5).
 */
export async function verificarDisponibilidad(
  items: readonly { id: IdProducto; cantidad: number }[],
): Promise<{ ok: true } | { ok: false; faltantes: { id: IdProducto; disponible: number }[] }> {
  const ids = [...new Set(items.map((i) => i.id))]

  const { data, error } = await supabase()
    .from('productos')
    .select('id, stock, activo')
    .in('id', ids)

  if (error) throw new Error(`No se pudo verificar el stock: ${error.message}`)

  const stockPorId = new Map<string, { stock: number; activo: boolean }>()
  for (const fila of (data ?? []) as Pick<FilaProducto, 'id' | 'stock' | 'activo'>[]) {
    stockPorId.set(fila.id, { stock: fila.stock ?? 0, activo: fila.activo !== false })
  }

  const faltantes: { id: IdProducto; disponible: number }[] = []
  for (const id of ids) {
    const pedido = items
      .filter((i) => i.id === id)
      .reduce((acc, i) => acc + i.cantidad, 0)
    const fila = stockPorId.get(id)
    // Si el producto no está en la base todavía, tratamos el stock como 0:
    // preferimos no vender algo que no sabemos si existe.
    const disponible = fila && fila.activo ? fila.stock : 0
    if (disponible < pedido) faltantes.push({ id, disponible })
  }

  return faltantes.length === 0 ? { ok: true } : { ok: false, faltantes }
}

export type NuevoPedido = {
  nombre: string
  email: string
  telefono: string
  comuna: string
  direccion: string
  depto: string | null
  referencia: string | null
  horario_preferido: string | null
  es_regalo: boolean
  mensaje_regalo: string | null
  subtotal: number
  costo_envio: number
  total: number
  acepta_terminos: boolean
  acepta_marketing: boolean
  /** Ángulo del anuncio (`?c=`). Null si la persona no llegó desde uno. */
  campana: string | null
  items: { producto_id: string; nombre: string; precio_unit: number; cantidad: number }[]
}

/** Crea el pedido en estado `pendiente` y sus ítems. Devuelve id y número. */
export async function crearPedido(
  pedido: NuevoPedido,
): Promise<{ id: string; numero: number }> {
  const { items, ...cabecera } = pedido

  let { data, error } = await supabase()
    .from('pedidos')
    .insert({ ...cabecera, estado: 'pendiente' })
    .select('id, numero')
    .single()

  // Red de seguridad: si todavía no se corrió la migración 004, la columna
  // `campana` no existe y el insert falla. Perder el dato de la campaña es
  // aceptable; perder la venta, no. Se reintenta sin ella y se deja aviso.
  if (error && esColumnaCampanaFaltante(error)) {
    console.warn('[pedidos] falta la columna "campana": corre supabase/migrations/004_campana.sql')
    const { campana: _omitida, ...sinCampana } = cabecera
    void _omitida
    ;({ data, error } = await supabase()
      .from('pedidos')
      .insert({ ...sinCampana, estado: 'pendiente' })
      .select('id, numero')
      .single())
  }

  if (error || !data) {
    throw new Error(`No se pudo crear el pedido: ${error?.message ?? 'sin datos'}`)
  }

  const pedidoId = data.id as string

  const { error: errorItems } = await supabase()
    .from('pedido_items')
    .insert(items.map((i) => ({ ...i, pedido_id: pedidoId })))

  if (errorItems) {
    // Si los ítems fallan, el pedido sin líneas no sirve para nada: lo borramos
    // para no dejar basura en la base.
    await supabase().from('pedidos').delete().eq('id', pedidoId)
    throw new Error(`No se pudo guardar el detalle del pedido: ${errorItems.message}`)
  }

  return { id: pedidoId, numero: data.numero as number }
}

function esColumnaCampanaFaltante(error: { code?: string; message?: string }): boolean {
  // PGRST204: PostgREST no encuentra la columna en su caché del esquema.
  // 42703: Postgres no encuentra la columna.
  return (
    (error.code === 'PGRST204' || error.code === '42703') &&
    (error.message ?? '').includes('campana')
  )
}

export async function guardarPreferencia(
  pedidoId: string,
  preferenceId: string,
): Promise<void> {
  const { error } = await supabase()
    .from('pedidos')
    .update({ mp_preference_id: preferenceId })
    .eq('id', pedidoId)

  if (error) throw new Error(`No se pudo guardar la preferencia: ${error.message}`)
}

export async function obtenerPedido(id: string): Promise<PedidoConItems | null> {
  const { data, error } = await supabase()
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null

  const { data: items } = await supabase()
    .from('pedido_items')
    .select('*')
    .eq('pedido_id', id)

  return { ...(data as FilaPedido), items: (items ?? []) as FilaPedidoItem[] }
}

export async function obtenerPedidoPorPaymentId(
  paymentId: string,
): Promise<FilaPedido | null> {
  const { data } = await supabase()
    .from('pedidos')
    .select('*')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()

  return (data as FilaPedido) ?? null
}

/**
 * Confirma el pago llamando a la función de Postgres. Todo el trabajo delicado
 * (idempotencia, comparación de montos, descuento atómico de stock) ocurre
 * dentro de una única transacción en la base.
 */
export type ResultadoConfirmacion =
  | 'ya_procesado'
  | 'pagado'
  | 'pagado_sin_stock'
  | 'monto_no_coincide'
  | 'pedido_no_encontrado'
  | 'pago_de_otro_pedido'

export async function confirmarPago(
  pedidoId: string,
  paymentId: string,
  monto: number,
): Promise<ResultadoConfirmacion> {
  const { data, error } = await supabase().rpc('confirmar_pago', {
    p_pedido_id: pedidoId,
    p_payment_id: paymentId,
    p_monto: monto,
  })

  if (error) throw new Error(`Falló la confirmación del pago: ${error.message}`)
  return data as ResultadoConfirmacion
}

/** Marca un pedido como rechazado o cancelado (pago que no prosperó). */
export async function marcarEstado(
  pedidoId: string,
  estado: EstadoPedido,
  paymentId?: string,
): Promise<void> {
  const parche: Record<string, unknown> = { estado }
  if (paymentId) parche.mp_payment_id = paymentId

  const { error } = await supabase()
    .from('pedidos')
    .update(parche)
    .eq('id', pedidoId)
    .eq('estado', 'pendiente') // nunca degradar un pedido ya pagado

  if (error) throw new Error(`No se pudo actualizar el pedido: ${error.message}`)
}

// ── Panel ──────────────────────────────────────────────────────────────────

export async function listarPedidos(filtro?: {
  estado?: EstadoPedido | 'todos'
}): Promise<PedidoConItems[]> {
  let consulta = supabase()
    .from('pedidos')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(500)

  if (filtro?.estado && filtro.estado !== 'todos') {
    consulta = consulta.eq('estado', filtro.estado)
  }

  const { data, error } = await consulta
  if (error) throw new Error(`No se pudo leer los pedidos: ${error.message}`)

  const pedidos = (data ?? []) as FilaPedido[]
  if (pedidos.length === 0) return []

  const { data: items } = await supabase()
    .from('pedido_items')
    .select('*')
    .in(
      'pedido_id',
      pedidos.map((p) => p.id),
    )

  const porPedido = new Map<string, FilaPedidoItem[]>()
  for (const item of (items ?? []) as FilaPedidoItem[]) {
    const lista = porPedido.get(item.pedido_id) ?? []
    lista.push(item)
    porPedido.set(item.pedido_id, lista)
  }

  return pedidos.map((p) => ({ ...p, items: porPedido.get(p.id) ?? [] }))
}

export async function marcarEntregado(pedidoId: string): Promise<void> {
  const { error } = await supabase()
    .from('pedidos')
    .update({ estado: 'entregado', entregado_en: new Date().toISOString() })
    .eq('id', pedidoId)

  if (error) throw new Error(`No se pudo marcar como entregado: ${error.message}`)
}

export async function desmarcarEntregado(pedidoId: string): Promise<void> {
  const { error } = await supabase()
    .from('pedidos')
    .update({ estado: 'pagado', entregado_en: null })
    .eq('id', pedidoId)
    .eq('estado', 'entregado')

  if (error) throw new Error(`No se pudo revertir la entrega: ${error.message}`)
}
