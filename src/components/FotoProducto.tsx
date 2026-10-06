import Image from 'next/image'
import { FOTOS_PRODUCTO } from '@/lib/fotos-generadas'
import { PiezaDeProducto } from '@/components/Piezas'
import type { Producto } from '@/lib/catalogo'

/**
 * La foto cuadrada de un producto, o su ilustración mientras no exista.
 *
 * Llena el contenedor que la envuelve (que pone el tamaño y el borde). Apenas
 * Felipe deja `public/productos/<id>.jpg` y hace push, el build la detecta y
 * aparece sola; hasta entonces se dibuja la pieza del nivel del pack sobre una
 * marca de agua de tablero (peón → alfil → caballo → rey).
 */
export function FotoProducto({
  producto,
  sizes,
  dorado = false,
  piezaClassName = 'max-h-40',
}: {
  producto: Producto
  /** El atributo `sizes` de next/image: cuánto mide en pantalla. */
  sizes: string
  dorado?: boolean
  piezaClassName?: string
}) {
  const foto = FOTOS_PRODUCTO[producto.id][0]

  if (foto) {
    return <Image src={foto} alt={producto.alt} fill sizes={sizes} className="object-cover" />
  }

  return (
    <>
      <div
        className="tablero-marca-agua absolute inset-0 text-[var(--color-carbon)]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 grid place-items-center p-[18%]">
        <PiezaDeProducto
          id={producto.id}
          className={`h-full w-auto ${piezaClassName} ${
            dorado ? 'text-[var(--color-dorado)]' : 'text-[var(--color-terracota)]'
          }`}
        />
      </div>
    </>
  )
}
