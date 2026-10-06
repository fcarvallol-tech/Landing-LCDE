import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Imagen de la marca como data URI, para los íconos generados con next/og.
 *
 * Usa `public/logo.png` (el de fondo claro: favicon y apple-touch-icon van
 * sobre fondo claro). Si el archivo no existe, cae al escudo dibujado de
 * `public/icono.svg`, así el build nunca falla por un logo que falta.
 */
export async function imagenDeMarca(): Promise<string> {
  try {
    const png = await readFile(join(process.cwd(), 'public', 'logo.png'), 'base64')
    return `data:image/png;base64,${png}`
  } catch {
    const svg = await readFile(join(process.cwd(), 'public', 'icono.svg'), 'base64')
    return `data:image/svg+xml;base64,${svg}`
  }
}
