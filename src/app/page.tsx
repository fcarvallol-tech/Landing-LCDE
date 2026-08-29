import { obtenerEstadoProductos } from '@/lib/datos'
import { CarritoProvider } from '@/components/CarritoProvider'
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
 * La landing completa: una sola página con secciones ancladas.
 *
 * El stock se lee en el servidor (Server Component) y baja al cliente como
 * dato ya calculado. El navegador nunca habla con Supabase.
 *
 * Se revalida cada 60 segundos: si Felipe cambia el stock desde el panel, la
 * página se actualiza sola sin necesidad de volver a publicar.
 */
export const revalidate = 60

export default async function Pagina() {
  const stock = await obtenerEstadoProductos()

  return (
    <CarritoProvider stock={stock}>
      <DatosEstructurados stock={stock} />

      <Encabezado />

      <main id="contenido">
        <Hero />
        <FranjaConfianza />
        <Beneficios />
        <Packs />
        <ComoFunciona />
        <DatosCuriosos />
        <NoNecesitasSaber />
        <Cobertura />
        <Preguntas />
        <Cierre />
      </main>

      <PieDePagina />

      {/* Deja aire al final para que la barra fija no tape el pie en mobile. */}
      <div className="espacio-barra-movil" aria-hidden="true" />

      <PanelCarrito />
      <BarraCompraMovil />
    </CarritoProvider>
  )
}
