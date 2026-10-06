'use client'

import { useEffect } from 'react'
import { leerCampana, recordarCampana } from '@/lib/campanas'

/**
 * Anota el `?c=` con que la persona llegó desde el anuncio, para mandarlo con
 * el pedido aunque después navegue a otra página (docs/12-rediseno.md §6).
 *
 * Los anuncios abren la página con una carga completa, así que basta con
 * mirarlo una vez al montar. Un valor desconocido se ignora.
 */
export function RegistroCampana() {
  useEffect(() => {
    const campana = leerCampana(new URLSearchParams(window.location.search).get('c'))
    if (campana) recordarCampana(campana)
  }, [])

  return null
}
