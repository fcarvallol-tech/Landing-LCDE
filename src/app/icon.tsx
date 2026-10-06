import { ImageResponse } from 'next/og'
import { imagenDeMarca } from '@/lib/icono-marca'

/**
 * Favicon, generado en el build desde public/logo.png (docs/12-rediseno.md §2).
 * Fondo transparente: el círculo del logo ya se recorta solo en la pestaña.
 */
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icono() {
  const src = await imagenDeMarca()

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} width={64} height={64} alt="" />
    ),
    size,
  )
}
