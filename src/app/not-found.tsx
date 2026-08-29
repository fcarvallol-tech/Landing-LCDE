import Link from 'next/link'
import { MarcoPagina } from '@/components/MarcoPagina'
import { Caballo } from '@/components/Piezas'
import { WA_CONSULTA } from '@/lib/negocio'

/** 404. El caballo es la pieza que salta a donde no esperabas: viene al caso. */
export default function NoEncontrado() {
  return (
    <MarcoPagina>
      <div className="contenedor seccion">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center">
          <Caballo className="h-24 w-auto text-[var(--color-terracota)]" />
          <p className="eyebrow">Error 404</p>
          <h1 className="text-[length:var(--text-h2)]">
            Esta jugada no existe en el tablero.
          </h1>
          <p className="text-lg">
            La página que buscas no está acá. Puede que el enlace esté mal escrito o que
            ya no exista.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primario">
              Ir a los packs
            </Link>
            <a
              href={WA_CONSULTA}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secundario"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </MarcoPagina>
  )
}
