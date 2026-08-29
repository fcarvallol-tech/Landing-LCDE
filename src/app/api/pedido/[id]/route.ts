import { NextResponse } from 'next/server'
import { obtenerPedido } from '@/lib/datos'

/**
 * GET /api/pedido/[id] — estado de un pedido, para la página de retorno.
 *
 * Devuelve deliberadamente MUY poco: número, estado y total. Nada de dirección,
 * teléfono ni correo. El id es un UUID, pero aunque alguien adivinara uno, lo
 * único que obtendría es "el pedido 42 está pagado" (docs/06-seguridad.md §8).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _peticion: Request,
  contexto: { params: Promise<{ id: string }> },
) {
  const { id } = await contexto.params

  const esUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (!esUuid) {
    return NextResponse.json({ mensaje: 'Pedido no encontrado' }, { status: 404 })
  }

  try {
    const pedido = await obtenerPedido(id)
    if (!pedido) {
      return NextResponse.json({ mensaje: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(
      {
        numero: pedido.numero,
        estado: pedido.estado,
        total: pedido.total,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json(
      { mensaje: 'No pudimos consultar el pedido' },
      { status: 503 },
    )
  }
}
