import { obtenerEstadoProductos } from '@/lib/datos'
import { TITULARES, type CampanaPortada } from '@/lib/campanas'
import { CarritoProvider } from '@/components/CarritoProvider'
import { BarraAnuncio } from '@/components/BarraAnuncio'
import { Encabezado } from '@/components/Encabezado'
import { PanelCarrito } from '@/components/PanelCarrito'
import { BarraCompraMovil } from '@/components/BarraCompraMovil'
import { PieDePagina } from '@/components/PieDePagina'
import { DatosEstructurados } from '@/components/DatosEstructurados'
import { Hero } from '@/components/secciones/Hero'
import { FranjaConfianza } from '@/components/secciones/FranjaConfianza'
import { Beneficios } from '@/components/secciones/Beneficios'
import { Packs } from '@/components/secciones/Packs'
import { ComoFunciona } from '@/components/secciones/ComoFunciona'
import { DatosCuriosos } from '@/components/secciones/DatosCuriosos'
import { NoNecesitasSaber } from '@/components/secciones/NoNecesitasSaber'
import { Cobertura } from '@/components/secciones/Cobertura'
import { Preguntas } from '@/components/secciones/Preguntas'
import { Cierre } from '@/components/secciones/Cierre'

/**
 * La portada completa. La usan `/` y las variantes por campaña
 * (`/?c=juntos`, que el proxy sirve desde /campana/juntos): lo único que
 * cambia entre ellas es el titular.
 *
 * El stock se lee en el servidor y baja al cliente ya calculado. El navegador
 * nunca habla con Supabase.
 *
 * Orden (docs/12-rediseno.md §3): los packs van inmediatamente después del
 * hero, antes que los beneficios, para que asomen en la primera pantalla.
 */
export async function Portada({ campana }: { campana: CampanaPortada }) {
  const stock = await obtenerEstadoProductos()

  return (
    <CarritoProvider stock={stock}>
      <DatosEstructurados stock={stock} />

      <BarraAnuncio />
      <Encabezado
        inicio="#inicio"
        enlaces={[
          { href: '#packs', texto: 'Los packs' },
          { href: '#beneficios', texto: 'Por qué ajedrez' },
        ]}
      />

      <main id="contenido">
        <Hero titular={TITULARES[campana]} />
        <Packs />
        <FranjaConfianza />
        <Beneficios />
        <ComoFunciona />
        <DatosCuriosos />
        <NoNecesitasSaber />
        <Cobertura />
        <Preguntas />
        <Cierre />
      </main>

      <PieDePagina />

      {/* Deja aire al final para que la barra fija no tape el pie en mobile. */}
      <div className="espacio-barra-movil bg-[var(--color-carbon)]" aria-hidden="true" />

      <PanelCarrito />
      <BarraCompraMovil />
    </CarritoProvider>
  )
}
