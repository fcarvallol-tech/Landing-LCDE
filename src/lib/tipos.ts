import type { IdProducto } from '@/lib/catalogo'
import type { Comuna, HorarioPreferido } from '@/lib/logistica'

/** Estados posibles de un pedido. Coincide con el CHECK de la migración 001. */
export const ESTADOS_PEDIDO = [
  'pendiente',
  'pagado',
  'pagado_sin_stock',
  'revisar',
  'entregado',
  'cancelado',
  'rechazado',
] as const

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number]

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente de pago',
  pagado: 'Pagado',
  pagado_sin_stock: 'Pagado SIN STOCK',
  revisar: 'Revisar',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  rechazado: 'Rechazado',
}

export type FilaProducto = {
  id: IdProducto
  nombre: string
  precio: number
  stock: number
  activo: boolean
  orden: number
  actualizado_en: string
}

export type FilaPedidoItem = {
  id: string
  pedido_id: string
  producto_id: string
  nombre: string
  precio_unit: number
  cantidad: number
}

export type FilaPedido = {
  id: string
  numero: number
  estado: EstadoPedido
  nombre: string
  email: string
  telefono: string
  comuna: Comuna
  direccion: string
  depto: string | null
  referencia: string | null
  horario_preferido: HorarioPreferido | null
  es_regalo: boolean
  mensaje_regalo: string | null
  subtotal: number
  costo_envio: number
  total: number
  mp_preference_id: string | null
  mp_payment_id: string | null
  acepta_terminos: boolean
  acepta_marketing: boolean
  creado_en: string
  pagado_en: string | null
  entregado_en: string | null
  notas_internas: string | null
}

export type PedidoConItems = FilaPedido & { items: FilaPedidoItem[] }

/** Vista pública de un producto: lo que la landing necesita saber. */
export type ProductoPublico = {
  id: IdProducto
  stock: number
  activo: boolean
  /** true si stock === 0 o el producto está desactivado. */
  agotado: boolean
  /** Se muestra "Últimas N unidades" solo entre 1 y 5. */
  mostrarUltimas: boolean
}
