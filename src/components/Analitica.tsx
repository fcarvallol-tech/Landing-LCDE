'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { GA_ID, META_PIXEL_ID } from '@/lib/sitio'
import { EVENTO_CONSENTIMIENTO, leerConsentimiento } from '@/components/BannerCookies'

/**
 * Meta Pixel y GA4 (docs/05-arquitectura.md).
 *
 * Dos condiciones para que se cargue algo:
 *   1. Que exista el ID en el entorno. Si no está, no se carga nada y la
 *      página funciona perfecto igual.
 *   2. Que la persona haya aceptado cookies. Antes de eso: cero scripts.
 */
export function Analitica() {
  const [aceptado, setAceptado] = useState(false)

  useEffect(() => {
    setAceptado(leerConsentimiento() === 'aceptado')
    const alCambiar = (e: Event) => {
      const detalle = (e as CustomEvent<string>).detail
      setAceptado(detalle === 'aceptado')
    }
    window.addEventListener(EVENTO_CONSENTIMIENTO, alCambiar)
    return () => window.removeEventListener(EVENTO_CONSENTIMIENTO, alCambiar)
  }, [])

  if (!aceptado) return null

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
