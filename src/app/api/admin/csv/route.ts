import { NextResponse } from 'next/server'
import { listarPedidos } from '@/lib/datos'
import { formatearTelefono } from '@/lib/validacion'
import { ETIQUETA_ESTADO, type EstadoPedido } from '@/lib/tipos'

/**
 * GET /api/admin/csv — exporta los pedidos a CSV (docs/04-logistica.md).
 *
 * La sesión ya la verificó el proxy (src/proxy.ts).
 *
 * Se escapa cada celda con comillas y, si empieza con =, +, - o @, se le
 * antepone un apóstrofo: es la defensa contra inyección de fórmulas cuando
 * Felipe abra el archivo en Excel o en Google Sheets.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function celda(valor: unknown): string {
  if (valor === null || valor === undefined) return '""'

  let texto = String(valor)

  // Anti inyección de fórmulas en la planilla.
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`

  return `"${texto.replace(/"/g, '""')}"`
}

const COLUMNAS = [
  'Numero',
  'Estado',
  'Comuna',
  'Nombre',
  'Telefono',
  'Email',
  'Direccion',
  'Depto',
  'Referencia',
  'Horario',
  'Es regalo',
  'Mensaje regalo',
  'Productos',
  'Subtotal',
  'Despacho',
  'Total',
  'Creado',
  'Pagado',
  'Entregado',
]

export async function GET(peticion: Request) {
  const url = new URL(peticion.url)
  const filtro = url.searchParams.get('estado')

  try {
    const pedidos = await listarPedidos(
      filtro && filtro !== 'todos'
        ? { estado: filtro as EstadoPedido }
        : { estado: 'todos' },
    )

    // Ordenados por comuna: así el CSV ya viene armado como ruta de entrega.
    const ordenados = [...pedidos].sort(
      (a, b) =>
        a.comuna.localeCompare(b.comuna, 'es') ||
        a.creado_en.localeCompare(b.creado_en),
    )

    const filas = ordenados.map((pedido) =>
      [
        pedido.numero,
        ETIQUETA_ESTADO[pedido.estado] ?? pedido.estado,
        pedido.comuna,
        pedido.nombre,
        formatearTelefono(pedido.telefono),
        pedido.email,
        pedido.direccion,
        pedido.depto ?? '',
        pedido.referencia ?? '',
        pedido.horario_preferido ?? '',
        pedido.es_regalo ? 'Sí' : 'No',
        pedido.mensaje_regalo ?? '',
        pedido.items.map((i) => `${i.nombre} x${i.cantidad}`).join(' | '),
        pedido.subtotal,
        pedido.costo_envio,
        pedido.total,
        pedido.creado_en,
        pedido.pagado_en ?? '',
        pedido.entregado_en ?? '',
      ]
        .map(celda)
        .join(','),
    )

    // El BOM hace que Excel en Windows abra los acentos correctamente.
    const csv = '﻿' + [COLUMNAS.map(celda).join(','), ...filas].join('\r\n')

    const fecha = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pedidos-lcde-${fecha}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (fallo) {
    console.error(
      '[admin] falló la exportación:',
      fallo instanceof Error ? fallo.message : String(fallo),
    )
    return NextResponse.json(
      { mensaje: 'No se pudo generar el CSV' },
      { status: 500 },
    )
  }
}
