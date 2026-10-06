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

/**
 * Fotos sueltas de public/ (docs/11-fotografia.md). La clave es el nombre de la
 * constante que se exporta; el valor, el nombre del archivo sin extensión.
 */
const SUELTAS = {
  FOTO_HERO: 'hero',
  FOTO_LOGO: 'logo',
  FOTO_LOGO_OSCURO: 'logo-oscuro',
  FOTO_OG: 'og',
  FOTO_MEDIDAS: 'medidas',
  FOTO_GUARDADO: 'guardado',
  FOTO_JUGANDO: 'jugando',
  FOTO_JUGANDO_ADULTO: 'jugando-adulto',
  FOTO_DETALLE: 'detalle',
}

const sueltas = Object.fromEntries(
  Object.entries(SUELTAS).map(([constante, base]) => [constante, buscarSuelta(base)]),
)

const contenido = `// ⚠ ARCHIVO GENERADO AUTOMÁTICAMENTE. No lo edites a mano.
// Lo escribe scripts/escanear-fotos.mjs antes de cada build.
// Para agregar una foto: déjala en public/productos/ o en public/ con el nombre
// de docs/11-fotografia.md, haz commit y push. Se regenera solo.

import type { IdProducto } from '@/lib/catalogo'

export const FOTOS_PRODUCTO: Record<IdProducto, string[]> = ${JSON.stringify(fotos, null, 2)}

${Object.entries(sueltas)
  .map(([constante, ruta]) => `export const ${constante}: string | null = ${JSON.stringify(ruta)}`)
  .join('\n')}
`

if (!existsSync(dirname(salida))) mkdirSync(dirname(salida), { recursive: true })
writeFileSync(salida, contenido, 'utf8')

const total = Object.values(fotos).reduce((a, f) => a + f.length, 0)
const encontradas = Object.entries(SUELTAS)
  .filter(([constante]) => sueltas[constante])
  .map(([, base]) => base)
console.log(
  `[fotos] ${total} foto(s) de producto` +
    (encontradas.length ? `, ${encontradas.join(', ')}` : '') +
    (total === 0 ? ' — los packs usan las ilustraciones de reemplazo' : ''),
)
