'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Login del panel. La contraseña solo viaja en el POST; no se guarda en ningún lado. */
export function FormularioLogin({ mensajeInicial }: { mensajeInicial: string | null }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(mensajeInicial)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return

    const datos = new FormData(evento.currentTarget)
    setEnviando(true)
    setError(null)

    try {
      const respuesta = await fetch('/api/admin/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: String(datos.get('password') ?? '') }),
      })

      if (respuesta.ok) {
        router.push('/admin/pedidos')
        router.refresh()
        return
      }

      const cuerpo = (await respuesta.json().catch(() => null)) as {
        mensaje?: string
      } | null
      setError(cuerpo?.mensaje ?? 'No pudimos entrar. Inténtalo de nuevo.')
    } catch {
      setError('Se cortó la conexión. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col gap-4 rounded-xl border-2 border-[var(--color-carbon)] bg-[var(--color-crema)] p-6 sombra-block"
    >
      {error && (
        <p
          role="alert"
          className="rounded-lg border-2 border-[var(--color-error)] bg-[var(--color-error)]/8 p-3 text-sm font-medium text-[var(--color-error)]"
        >
          {error}
        </p>
      )}

      <div>
        <label className="etiqueta" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="campo"
          autoComplete="current-password"
          required
          autoFocus
        />
      </div>

      <button type="submit" className="btn btn-primario w-full" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
