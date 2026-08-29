import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { IDS_PRODUCTO } from '@/lib/catalogo'
import {
  actualizarActivo,
  actualizarStock,
  desmarcarEntregado,
  marcarEntregado,
} from '@/lib/datos'
import { COOKIE_CSRF, igualesEnTiempoConstante, origenConfiable } from '@/lib/sesion'
import { SITIO_URL } from '@/lib/sitio'

/**
 * POST /api/admin/acciones — mutaciones del panel.
 *
 * La sesión ya la verificó el proxy (src/proxy.ts) antes de llegar acá. Lo que se agrega
 * en este archivo es la protección CSRF (docs/06-seguridad.md §7): token de
 * doble envío MÁS verificación de origen. Con las dos, un sitio ajeno no puede
 * hacer que el navegador de Felipe cambie el stock sin que él se entere.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const esquema = z.discriminatedUnion('accion', [
  z
    .object({
      accion: z.literal('stock'),
      productoId: z.enum(IDS_PRODUCTO),
      stock: z.number().int().min(0).max(100000),
      csrf: z.string().min(1).max(200),
    })
    .strict(),
  z
    .object({
      accion: z.literal('activo'),
      productoId: z.enum(IDS_PRODUCTO),
      activo: z.boolean(),
      csrf: z.string().min(1).max(200),
    })
    .strict(),
  z
    .object({
      accion: z.literal('entregado'),
      pedidoId: z.uuid(),
      entregado: z.boolean(),
      csrf: z.string().min(1).max(200),
    })
    .strict(),
])

export async function POST(peticion: NextRequest) {
  if (!origenConfiable(peticion.headers, SITIO_URL)) {
    return NextResponse.json({ mensaje: 'Origen no permitido' }, { status: 403 })
  }

  let crudo: unknown
  try {
    crudo = await peticion.json()
  } catch {
    return NextResponse.json({ mensaje: 'Petición inválida' }, { status: 400 })
  }

  const analisis = esquema.safeParse(crudo)
  if (!analisis.success) {
    return NextResponse.json(
      { mensaje: analisis.error.issues[0]?.message ?? 'Petición inválida' },
      { status: 400 },
    )
  }

  const datos = analisis.data

  const tokenCookie = peticion.cookies.get(COOKIE_CSRF)?.value
  if (!tokenCookie || !igualesEnTiempoConstante(tokenCookie, datos.csrf)) {
    return NextResponse.json(
      { mensaje: 'Tu sesión cambió. Recarga la página e inténtalo de nuevo.' },
      { status: 403 },
    )
  }

  try {
    switch (datos.accion) {
      case 'stock':
        await actualizarStock(datos.productoId, datos.stock)
        break
      case 'activo':
        await actualizarActivo(datos.productoId, datos.activo)
        break
      case 'entregado':
        if (datos.entregado) await marcarEntregado(datos.pedidoId)
        else await desmarcarEntregado(datos.pedidoId)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (fallo) {
    console.error(
      '[admin] falló la acción:',
      fallo instanceof Error ? fallo.message : String(fallo),
    )
    return NextResponse.json(
      { mensaje: 'No se pudo guardar el cambio. Inténtalo de nuevo.' },
      { status: 500 },
    )
  }
}
