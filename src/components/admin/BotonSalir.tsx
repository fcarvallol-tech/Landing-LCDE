'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** Cierra la sesión del panel borrando las cookies en el servidor. */
export function BotonSalir() {
  const router = useRouter()
  const [saliendo, setSaliendo] = useState(false)

  async function salir() {
    setSaliendo(true)
    try {
      await fetch('/api/admin/entrar', { method: 'DELETE' })
    } catch {
      // Da igual: igual mandamos al login.
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className="btn btn-secundario min-h-[44px] px-4 text-sm"
    >
      {saliendo ? 'Saliendo…' : 'Salir'}
    </button>
  )
}
