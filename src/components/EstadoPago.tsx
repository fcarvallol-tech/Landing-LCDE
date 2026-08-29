'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatearPrecio } from '@/lib/catalogo'
import { TEXTO_PLAZO } from '@/lib/logistica'
import { NEGOCIO, WA_CONSULTA } from '@/lib/negocio'
import { compraConfirmada } from '@/lib/eventos'
import { Rey, Peon } from '@/components/Piezas'

/**
 * Estado del pago tras volver de Mercado Pago (docs/05-arquitectura.md §7).
 *
 * Esta pantalla NO confirma el pago por sí sola. La redirección de Mercado Pago
 * es solo eso: una redirección, y sus parámetros vienen en la URL, donde
 * cualquiera puede escribir lo que quiera. Lo único que confirma un pago es el
 * webhook, y lo único en lo que confía esta página es el estado guardado en
 * nuestra base.
 *
 * Como el webhook puede llegar unos segundos después que la persona, se hace
 * polling suave mientras el pedido siga pendiente.
 */

type Respuesta = { numero: number; estado: string; total: number }

const INTERVALO_MS = 2500
const INTENTOS_MAXIMOS = 16 // ~40 segundos

export function EstadoPago({
  pedidoId,
  variante,
}: {
  pedidoId: string | null
  variante: 'exito' | 'pendiente' | 'error'
}) {
  const [pedido, setPedido] = useState<Respuesta | null>(null)
  const [consultando, setConsultando] = useState(Boolean(pedidoId))
  const [seRindio, setSeRindio] = useState(false)
  const pixelDisparado = useRef(false)

  useEffect(() => {
    if (!pedidoId) {
      setConsultando(false)
      return
    }

    let intentos = 0
    let vivo = true
    let temporizador: ReturnType<typeof setTimeout> | undefined

    const consultar = async () => {
      if (!vivo) return
      intentos += 1

      try {
        const respuesta = await fetch(`/api/pedido/${pedidoId}`, { cache: 'no-store' })
        if (!respuesta.ok) throw new Error('sin respuesta')

        const datos = (await respuesta.json()) as Respuesta
        if (!vivo) return

        setPedido(datos)
        setConsultando(false)

        const finalizado = datos.estado !== 'pendiente'

        if (
          finalizado &&
          (datos.estado === 'pagado' ||
            datos.estado === 'pagado_sin_stock' ||
            datos.estado === 'entregado') &&
          !pixelDisparado.current
        ) {
          // Purchase con el valor REAL, leído del servidor. Nunca del carrito
          // ni de la URL.
          pixelDisparado.current = true
          compraConfirmada(datos.numero, datos.total)
        }

        if (!finalizado && intentos < INTENTOS_MAXIMOS) {
          temporizador = setTimeout(consultar, INTERVALO_MS)
        } else if (!finalizado) {
          setSeRindio(true)
        }
      } catch {
        if (!vivo) return
        if (intentos < INTENTOS_MAXIMOS) {
          temporizador = setTimeout(consultar, INTERVALO_MS)
        } else {
          setConsultando(false)
          setSeRindio(true)
        }
      }
    }

    void consultar()

    return () => {
      vivo = false
      if (temporizador) clearTimeout(temporizador)
    }
  }, [pedidoId])

  const estado = pedido?.estado

  // Confirmado de verdad, según nuestra base de datos.
  if (estado === 'pagado' || estado === 'entregado') {
    return (
      <Marco
        pieza={<Rey className="h-16 w-auto text-[var(--color-exito)]" />}
        titulo="Listo. Tu pedido está confirmado."
        etiqueta={`Pedido #${pedido?.numero}`}
      >
        <p className="text-lg">
          Pagaste{' '}
          <strong className="precio">{formatearPrecio(pedido?.total ?? 0)}</strong>. Te
          mandamos la confirmación por correo.
        </p>
        <p className="rounded-xl border border-[var(--color-beige-borde)] bg-[var(--color-beige)] p-4 text-[0.9375rem]">
          {TEXTO_PLAZO}
        </p>
        <Acciones />
      </Marco>
    )
  }

  if (estado === 'pagado_sin_stock' || estado === 'revisar') {
    return (
      <Marco
        pieza={<Peon className="h-16 w-auto text-[var(--color-dorado)]" />}
        titulo="Recibimos tu pago, pero hay algo que revisar."
        etiqueta={`Pedido #${pedido?.numero}`}
      >
        <p className="text-lg">
          Tu pago entró correctamente y ya le avisamos a nuestro equipo. Te vamos a
          escribir a la brevedad para resolverlo contigo, sea coordinando una alternativa
          o devolviéndote el dinero.
        </p>
        <p className="text-[0.9375rem] text-[var(--color-gris)]">
          Si prefieres apurarlo, escríbenos por WhatsApp con el número de tu pedido.
        </p>
        <Acciones />
      </Marco>
    )
  }

  if (estado === 'rechazado' || estado === 'cancelado' || variante === 'error') {
    return (
      <Marco
        pieza={<Peon className="h-16 w-auto text-[var(--color-error)]" />}
        titulo="El pago no se completó."
        etiqueta={pedido ? `Pedido #${pedido.numero}` : undefined}
      >
        <p className="text-lg">
          No se te cobró nada. Puede ser un problema con la tarjeta o que el pago se haya
          cancelado antes de terminar.
        </p>
        <p className="text-[0.9375rem]">
          Puedes intentarlo de nuevo con otra tarjeta, o escribirnos por WhatsApp y lo
          resolvemos contigo.
        </p>
        <Acciones reintentar />
      </Marco>
    )
  }

  // Pendiente: o el webhook aún no llega, o el medio de pago demora.
  return (
    <Marco
      pieza={<Peon className="h-16 w-auto text-[var(--color-terracota)]" />}
      titulo={
        seRindio ? 'Tu pago sigue en proceso.' : 'Estamos confirmando tu pago…'
      }
      etiqueta={pedido ? `Pedido #${pedido.numero}` : undefined}
    >
      {consultando || !seRindio ? (
        <p className="text-lg" aria-live="polite">
          Dale unos segundos. No cierres esta página: se actualiza sola apenas Mercado
          Pago nos confirme.
        </p>
      ) : (
        <p className="text-lg" aria-live="polite">
          Algunos medios de pago tardan un poco más en confirmarse. Apenas se confirme te
          llega el correo. Si en un rato no recibes nada, escríbenos por WhatsApp.
        </p>
      )}
      <Acciones />
    </Marco>
  )
}

function Marco({
  pieza,
  titulo,
  etiqueta,
  children,
}: {
  pieza: React.ReactNode
  titulo: string
  etiqueta?: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
      {pieza}
      {etiqueta && <p className="eyebrow">{etiqueta}</p>}
      <h1 className="text-[length:var(--text-h2)]">{titulo}</h1>
      {children}
    </div>
  )
}

function Acciones({ reintentar }: { reintentar?: boolean }) {
  return (
    <div className="mt-2 flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primario">
          {reintentar ? 'Volver a intentar' : 'Volver al inicio'}
        </Link>
        <a
          href={WA_CONSULTA}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secundario"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
      <p className="text-sm text-[var(--color-gris)]">
        O a{' '}
        <a
          href={`mailto:${NEGOCIO.email}`}
          className="underline underline-offset-2 hover:text-[var(--color-terracota)]"
        >
          {NEGOCIO.email}
        </a>
      </p>
    </div>
  )
}
