import { ImageResponse } from 'next/og'
import { FOTO_OG } from '@/lib/fotos-generadas'
import { imagenDeMarca } from '@/lib/icono-marca'

/**
 * Imagen que se ve al compartir el link (1200×630).
 *
 * Si algún día Felipe deja un `public/og.jpg`, se usa ese archivo. Mientras
 * tanto se genera una con la paleta y la tipografía de la marca, para que el
 * link nunca se comparta "pelado" en WhatsApp o Instagram. Lleva el logo real
 * (public/logo.png) y, si faltara, el escudo dibujado.
 */

// Node y no edge: hay que leer el logo desde el disco.
export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export async function GET(peticion: Request) {
  // Si existe la foto real, se redirige a ella.
  if (FOTO_OG) {
    return Response.redirect(new URL(FOTO_OG, peticion.url), 307)
  }

  const casillas = Array.from({ length: 32 }, (_, i) => i)
  const logo = await imagenDeMarca()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAF3E8',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Franja de tablero arriba: la firma visual de la marca. */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0 }}>
          {casillas.map((i) => (
            <div
              key={i}
              style={{
                width: 38,
                height: 38,
                backgroundColor: i % 2 === 0 ? '#A8452C' : '#F0E1CB',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 26,
              letterSpacing: 4,
              color: '#A8452C',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={84} height={84} alt="" />
            La Casa del Estratega
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 78,
              lineHeight: 1.03,
              fontWeight: 900,
              color: '#1E1A17',
              marginTop: 26,
              maxWidth: 940,
            }}
          >
            Una hora de ajedrez es una hora que no fue de pantalla.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '4px solid #1E1A17',
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 30, color: '#3D2F26' }}>
              Packs de ajedrez desde $15.990
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: '#7A6A5C', marginTop: 8 }}>
              Entrega personal en la zona oriente de Santiago
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: '#A8452C',
              color: '#FAF3E8',
              fontSize: 28,
              fontWeight: 700,
              padding: '18px 34px',
              borderRadius: 10,
            }}
          >
            lacasadelestratega.cl
          </div>
        </div>
      </div>
    ),
    size,
  )
}
