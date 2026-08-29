import 'server-only'

/**
 * Rate limiting (docs/06-seguridad.md §5).
 *
 * Limitador en memoria con un Map. Para el volumen de esta tienda —una landing
 * de 5 productos con tráfico de Instagram— es suficiente y no agrega una
 * dependencia externa ni un servicio más que pagar.
 *
 * Su límite honesto: en Vercel cada instancia serverless tiene su propio Map,
 * así que con varias instancias activas el tope efectivo se multiplica por el
 * número de instancias. Sigue frenando el abuso real (alguien martillando el
 * endpoint) y sigue frenando por completo la fuerza bruta contra el panel
 * dentro de cada instancia. Si algún día hace falta algo exacto, se cambia por
 * Upstash Redis sin tocar a quien lo llama.
 */

type Registro = { intentos: number; expiraEn: number }

const registros = new Map<string, Registro>()

/** Limpieza perezosa: se hace al pasar, no con un temporizador. */
function limpiar(ahora: number) {
  if (registros.size < 5000) return
  for (const [clave, registro] of registros) {
    if (registro.expiraEn <= ahora) registros.delete(clave)
  }
}

export type ResultadoLimite = {
  permitido: boolean
  /** Cuántos intentos quedan en esta ventana. */
  restantes: number
  /** Segundos hasta que se libere, para la cabecera Retry-After. */
  reintentarEn: number
}

export function verificarLimite(
  clave: string,
  maximo: number,
  ventanaMs: number,
): ResultadoLimite {
  const ahora = Date.now()
  limpiar(ahora)

  const registro = registros.get(clave)

  if (!registro || registro.expiraEn <= ahora) {
    registros.set(clave, { intentos: 1, expiraEn: ahora + ventanaMs })
    return { permitido: true, restantes: maximo - 1, reintentarEn: 0 }
  }

  registro.intentos += 1

  if (registro.intentos > maximo) {
    return {
      permitido: false,
      restantes: 0,
      reintentarEn: Math.ceil((registro.expiraEn - ahora) / 1000),
    }
  }

  return {
    permitido: true,
    restantes: maximo - registro.intentos,
    reintentarEn: 0,
  }
}

/** Borra el contador de una clave. Se usa tras un login correcto. */
export function reiniciarLimite(clave: string): void {
  registros.delete(clave)
}

/**
 * IP del cliente. En Vercel llega en x-forwarded-for; se toma la primera, que
 * es la del visitante real.
 *
 * Ojo: la IP nunca se guarda en la base ni se loguea (docs/06 §8). Solo vive
 * en memoria como clave del limitador.
 */
export function ipDe(cabeceras: Headers): string {
  const reenviada = cabeceras.get('x-forwarded-for')
  if (reenviada) {
    const primera = reenviada.split(',')[0]?.trim()
    if (primera) return primera
  }
  return cabeceras.get('x-real-ip')?.trim() || 'desconocida'
}
