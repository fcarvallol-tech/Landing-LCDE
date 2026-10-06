import { Portada } from '@/components/Portada'
import { CAMPANA_POR_DEFECTO } from '@/lib/campanas'

/**
 * La landing. Sin `?c=` (o con un valor desconocido, o con `?c=pantalla`) se
 * sirve esta, con el titular por defecto. Las otras variantes las resuelve el
 * proxy (src/proxy.ts) hacia /campana/[c].
 *
 * Se revalida cada 60 segundos: si Felipe cambia el stock desde el panel, la
 * página se actualiza sola sin necesidad de volver a publicar.
 */
export const revalidate = 60

export default function Pagina() {
  return <Portada campana={CAMPANA_POR_DEFECTO} />
}
