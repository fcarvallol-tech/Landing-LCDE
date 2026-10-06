import type { Metadata, Viewport } from 'next'
import { Archivo_Black, Inter } from 'next/font/google'
import './globals.css'
import { DESCRIPCION, SITIO_URL, TITULO } from '@/lib/sitio'
import { NEGOCIO } from '@/lib/negocio'
import { BannerCookies } from '@/components/BannerCookies'
import { Analitica } from '@/components/Analitica'
import { RevelarAlEntrar } from '@/components/RevelarAlEntrar'
import { RegistroCampana } from '@/components/RegistroCampana'

/**
 * Las fuentes se autohospedan con next/font: cero requests a Google en runtime.
 * Mejor rendimiento y, sobre todo, no hay que abrir la CSP a dominios externos
 * (docs/06-seguridad.md §6).
 */
const display = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--fuente-display',
  display: 'swap',
})

const cuerpo = Inter({
  subsets: ['latin'],
  variable: '--fuente-cuerpo',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: {
    default: TITULO,
    template: `%s — ${NEGOCIO.nombre}`,
  },
  description: DESCRIPCION,
  applicationName: NEGOCIO.nombre,
  keywords: [
    'ajedrez',
    'comprar ajedrez Santiago',
    'regalo para niños',
    'juego de ajedrez',
    'reloj de ajedrez',
    'tablero de ajedrez Chile',
  ],
  authors: [{ name: NEGOCIO.nombre, url: SITIO_URL }],
  creator: NEGOCIO.nombre,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: SITIO_URL,
    siteName: NEGOCIO.nombre,
    title: TITULO,
    description: DESCRIPCION,
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'La Casa del Estratega — packs de ajedrez con entrega personal en Santiago',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#FAF3E8',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className={`${display.variable} ${cuerpo.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#contenido" className="saltar-al-contenido">
          Saltar al contenido
        </a>
        {children}
        <BannerCookies />
        <Analitica />
        <RevelarAlEntrar />
        <RegistroCampana />
      </body>
    </html>
  )
}
