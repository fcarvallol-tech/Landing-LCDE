import { ImageResponse } from 'next/og'
import { imagenDeMarca } from '@/lib/icono-marca'

/**
 * apple-touch-icon, generado en el build desde public/logo.png.
 *
 * iOS pinta de negro lo transparente y redondea las esquinas por su cuenta,
 * así que el logo va sobre un cuadrado crema con aire alrededor.
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function IconoApple() {
  const src = await imagenDeMarca()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF3E8',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={150} height={150} alt="" />
      </div>
    ),
    size,
  )
}
