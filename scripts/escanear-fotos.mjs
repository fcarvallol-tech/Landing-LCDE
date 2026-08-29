/**
 * Escanea public/productos/ y public/ y genera src/lib/fotos-generadas.ts.
 *
 * Por qué existe: mientras no haya fotos, la página muestra una ilustración.
 * Apenas Felipe deje un archivo con el nombre correcto y haga push, Vercel
 * vuelve a construir el sitio, este script corre y la foto aparece sola.
 * No hay que tocar código.
 *
 * Corre solo, antes de `npm run build` y de `npm run dev`.
 */

import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const carpetaProductos = join(raiz, 'public', 'productos')
const carpetaPublica = join(raiz, 'public')
const salida = join(raiz, 'src', 'lib', 'fotos-generadas.ts')

const IDS = ['tradicional', 'cm', 'im', 'gm', 'reloj']
const EXTENSIONES = ['jpg', 'jpeg', 'png', 'webp', 'avif']

function archivosDe(carpeta) {
  if (!existsSync(carpeta)) return []
  return readdirSync(carpeta, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
}

const enProductos = archivosDe(carpetaProductos)
const enPublica = archivosDe(carpetaPublica)

/** Devuelve las fotos de un producto: la principal primero, luego -2, -3, ... */
function fotosDe(id) {
  const coincide = enProductos.filter((nombre) => {
    const punto = nombre.lastIndexOf('.')
    if (punto < 0) return false
    const base = nombre.slice(0, punto).toLowerCase()
    const ext = nombre.slice(punto + 1).toLowerCase()
    if (!EXTENSIONES.includes(ext)) return false
    return base === id || new RegExp(`^${id}-\\d+$`).test(base)
  })

  // La principal (sin sufijo) va primero; el resto por número.
  coincide.sort((a, b) => {
    const numero = (n) => {
      const m = n.match(/-(\d+)\./)
      return m ? Number(m[1]) : 0
    }
    return numero(a) - numero(b)
  })

  return coincide.map((n) => `/productos/${n}`)
}

function buscarSuelta(base) {
  const encontrada = enPublica.find((nombre) => {
    const punto = nombre.lastIndexOf('.')
    if (punto < 0) return false
    return (
      nombre.slice(0, punto).toLowerCase() === base &&
      EXTENSIONES.includes(nombre.slice(punto + 1).toLowerCase())
    )
  })
  return encontrada ? `/${encontrada}` : null
}

const fotos = Object.fromEntries(IDS.map((id) => [id, fotosDe(id)]))
const hero = buscarSuelta('hero')
const logo = buscarSuelta('logo')
const og = buscarSuelta('og')

const contenido = `// ⚠ ARCHIVO GENERADO AUTOMÁTICAMENTE. No lo edites a mano.
// Lo escribe scripts/escanear-fotos.mjs antes de cada build.
// Para agregar una foto: déjala en public/productos/ con el nombre del README
// de esa carpeta, haz commit y push. Se regenera solo.

import type { IdProducto } from '@/lib/catalogo'

export const FOTOS_PRODUCTO: Record<IdProducto, string[]> = ${JSON.stringify(fotos, null, 2)}

export const FOTO_HERO: string | null = ${JSON.stringify(hero)}
export const FOTO_LOGO: string | null = ${JSON.stringify(logo)}
export const FOTO_OG: string | null = ${JSON.stringify(og)}
`

if (!existsSync(dirname(salida))) mkdirSync(dirname(salida), { recursive: true })
writeFileSync(salida, contenido, 'utf8')

const total = Object.values(fotos).reduce((a, f) => a + f.length, 0)
console.log(
  `[fotos] ${total} foto(s) de producto` +
    `${hero ? ', hero' : ''}${logo ? ', logo' : ''}${og ? ', og' : ''}` +
    (total === 0 && !hero ? ' — se usan las ilustraciones de reemplazo' : ''),
)
