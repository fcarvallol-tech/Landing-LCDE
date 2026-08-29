import { PRODUCTOS } from '@/lib/catalogo'
import { COMUNAS } from '@/lib/logistica'
import { NEGOCIO } from '@/lib/negocio'
import { DESCRIPCION, SITIO_URL } from '@/lib/sitio'
import { PREGUNTAS } from '@/lib/contenido'
import type { ProductoPublico } from '@/lib/tipos'
import type { IdProducto } from '@/lib/catalogo'

/**
 * JSON-LD (docs/05-arquitectura.md, sección SEO).
 *
 * Organization + LocalBusiness con las 9 comunas como areaServed, un Product
 * con su offer por cada SKU, y la FAQ. El contenido sale de las mismas
 * constantes que pinta la página: no hay forma de que se desincronicen.
 */
export function DatosEstructurados({
  stock,
}: {
  stock: Record<IdProducto, ProductoPublico>
}) {
  const organizacion = {
    '@type': 'Organization',
    '@id': `${SITIO_URL}/#organizacion`,
    name: NEGOCIO.nombre,
    url: SITIO_URL,
    email: NEGOCIO.email,
    telephone: `+${NEGOCIO.whatsappNumero}`,
    description: DESCRIPCION,
    sameAs: [NEGOCIO.instagram],
  }

  const negocioLocal = {
    '@type': 'LocalBusiness',
    '@id': `${SITIO_URL}/#negocio`,
    name: NEGOCIO.nombre,
    url: SITIO_URL,
    email: NEGOCIO.email,
    telephone: `+${NEGOCIO.whatsappNumero}`,
    description: DESCRIPCION,
    priceRange: '$$',
    currenciesAccepted: 'CLP',
    paymentAccepted: 'Tarjeta de crédito, tarjeta de débito',
    areaServed: COMUNAS.map((comuna) => ({
      '@type': 'City',
      name: comuna,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Región Metropolitana, Chile',
      },
    })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santiago',
      addressRegion: 'Región Metropolitana',
      addressCountry: 'CL',
    },
  }

  const productos = PRODUCTOS.map((producto) => ({
    '@type': 'Product',
    '@id': `${SITIO_URL}/#producto-${producto.id}`,
    name: producto.nombre,
    description: producto.resumen,
    category: 'Juegos de mesa > Ajedrez',
    brand: { '@type': 'Brand', name: NEGOCIO.nombre },
    audience: {
      '@type': 'PeopleAudience',
      suggestedMinAge: producto.edadMin,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITIO_URL}/#packs`,
      priceCurrency: 'CLP',
      price: producto.precio,
      availability: stock[producto.id]?.agotado
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITIO_URL}/#organizacion` },
      areaServed: COMUNAS.map((comuna) => ({ '@type': 'City', name: comuna })),
    },
  }))

  const faq = {
    '@type': 'FAQPage',
    '@id': `${SITIO_URL}/#faq`,
    mainEntity: PREGUNTAS.map((item) => ({
      '@type': 'Question',
      name: item.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
    })),
  }

  const grafo = {
    '@context': 'https://schema.org',
    '@graph': [organizacion, negocioLocal, faq, ...productos],
  }

  return (
    <script
      type="application/ld+json"
      // El contenido lo generamos nosotros desde constantes del código, nunca
      // desde datos de usuario. Aun así se escapa `<` para que sea imposible
      // cerrar la etiqueta desde adentro.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(grafo).replace(/</g, '\\u003c'),
      }}
    />
  )
}
