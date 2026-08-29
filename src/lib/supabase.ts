import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Cliente de Supabase con service_role (docs/05-arquitectura.md).
 *
 * ESTE MÓDULO NUNCA PUEDE LLEGAR AL NAVEGADOR. El import de `server-only`
 * rompe el build si alguien lo importa desde un componente cliente.
 *
 * La service_role key salta RLS. Como las tres tablas tienen RLS activado y
 * cero políticas, este cliente es la ÚNICA forma de tocar los datos: con la
 * clave anónima no se puede leer ni escribir nada.
 */

let cliente: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (cliente) return cliente

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env()

  cliente = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      // No hay usuarios de Supabase Auth acá: no hay sesión que persistir ni
      // token que refrescar. Apagarlos evita trabajo inútil en el servidor.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'x-aplicacion': 'landing-lcde' },
    },
  })

  return cliente
}
