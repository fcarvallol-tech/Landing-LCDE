'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatearPrecio } from '@/lib/catalogo'
import { formatearTelefono } from '@/lib/validacion'
import { ETIQUETA_ESTADO, type EstadoPedido, type PedidoConItems } from '@/lib/tipos'
import { COOKIE_CSRF } from '@/lib/sesion'
import { ETIQUETA_HORARIO, type HorarioPreferido } from '@/lib/logistica'

/**
 * Panel de pedidos (docs/04-logistica.md, "Vista de entregas para Felipe").
 *
 * La vista por defecto está agrupada por comuna, porque la pregunta real que
 * Felipe se hace cada mañana no es "¿qué vendí?" sino "¿a quién le tengo que ir
 * a entregar y en qué orden manejo?".
 */

const FILTROS: { valor: EstadoPedido | 'todos'; etiqueta: string }[] = [
  { valor: 'pagado', etiqueta: 'Por entregar' },
  { valor: 'entregado', etiqueta: 'Entregados' },
  { valor: 'pendiente', etiqueta: 'Pendientes de pago' },
  { valor: 'todos', etiqueta: 'Todos' },
]

/** Estados que exigen que Felipe haga algo ahora. */
const ESTADOS_DE_ALERTA: EstadoPedido[] = ['pagado_sin_stock', 'revisar']

function leerCsrf(): string {
  if (typeof document === 'undefined') return ''
  const encontrada = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_CSRF}=`))
  return encontrada ? decodeURIComponent(encontrada.slice(COOKIE_CSRF.length + 1)) : ''
}

function fechaCorta(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PanelPedidos({
  pedidos,
  filtroActivo,
}: {
  pedidos: PedidoConItems[]
  filtroActivo: EstadoPedido | 'todos'
}) {
  const router = useRouter()
  const [, iniciarTransicion] = useTransition()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const porComuna = useMemo(() => {
    const mapa = new Map<string, PedidoConItems[]>()
    for (const pedido of pedidos) {
      const lista = mapa.get(pedido.comuna) ?? []
      lista.push(pedido)
      mapa.set(pedido.comuna, lista)
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'))
  }, [pedidos])

  const alertas = pedidos.filter((p) => ESTADOS_DE_ALERTA.includes(p.estado))

  const totalAcobrar = pedidos
    .filter((p) => p.estado === 'pagado')
    .reduce((suma, p) => suma + p.total, 0)

  async function cambiarEntrega(pedidoId: string, entregado: boolean) {
    setOcupado(pedidoId)
    setError(null)

    try {
      const respuesta = await fetch('/api/admin/acciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'entregado',
          pedidoId,
          entregado,
          csrf: leerCsrf(),
        }),
      })

      if (!respuesta.ok) {
        const cuerpo = (await respuesta.json().catch(() => null)) as {
          mensaje?: string
        } | null
        setError(cuerpo?.mensaje ?? 'No se pudo guardar el cambio.')
        return
      }

      iniciarTransicion(() => router.refresh())
    } catch {
      setError('Se cortó la conexión.')
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg border-2 border-[var(--color-error)] bg-[var(--color-error)]/8 p-3 text-sm font-medium text-[var(--color-error)]"
        >
          {error}
        </p>
      )}

      {alertas.length > 0 && (
        <div className="rounded-xl border-2 border-[var(--color-error)] bg-[var(--color-error)]/8 p-4">
          <h2 className="text-base text-[var(--color-error)]">
            {alertas.length}{' '}
            {alertas.length === 1 ? 'pedido necesita' : 'pedidos necesitan'} tu atención
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {alertas.map((pedido) => (
              <li key={pedido.id}>
                <strong>#{pedido.numero}</strong> — {ETIQUETA_ESTADO[pedido.estado]} —{' '}
                {pedido.nombre} ({pedido.comuna}).{' '}
                {pedido.estado === 'pagado_sin_stock'
                  ? 'Pagó y no había stock: contáctalo y devuelve o coordina.'
                  : 'El monto pagado no coincide con el pedido: revísalo antes de entregar.'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filtros y exportación */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTROS.map((filtro) => (
            <a
              key={filtro.valor}
              href={`/admin/pedidos?estado=${filtro.valor}`}
              aria-current={filtroActivo === filtro.valor ? 'page' : undefined}
              className={`inline-flex min-h-[40px] items-center rounded-lg border px-3 text-sm font-semibold ${
                filtroActivo === filtro.valor
                  ? 'border-[var(--color-carbon)] bg-[var(--color-carbon)] text-[var(--color-crema)]'
                  : 'border-[var(--color-beige-borde)] bg-white hover:bg-[var(--color-beige)]'
              }`}
            >
              {filtro.etiqueta}
            </a>
          ))}
        </div>

        <a
          href={`/api/admin/csv?estado=${filtroActivo}`}
          className="ml-auto inline-flex min-h-[40px] items-center rounded-lg border border-[var(--color-beige-borde)] bg-white px-3 text-sm font-semibold hover:bg-[var(--color-beige)]"
          download
        >
          Descargar CSV
        </a>
      </div>

      {/* Resumen */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Dato etiqueta="Pedidos en esta vista" valor={String(pedidos.length)} />
        <Dato etiqueta="Comunas con entregas" valor={String(porComuna.length)} />
        <Dato etiqueta="Total pagado por entregar" valor={formatearPrecio(totalAcobrar)} />
      </div>

      {pedidos.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-beige-borde)] bg-white p-8 text-center text-[var(--color-gris)]">
          No hay pedidos en esta vista todavía.
        </p>
      ) : (
        porComuna.map(([comuna, deLaComuna]) => (
          <section key={comuna} className="flex flex-col gap-3">
            <h2 className="flex items-baseline gap-3 border-b-2 border-[var(--color-carbon)] pb-2 text-lg">
              {comuna}
              <span className="numeros text-sm font-normal text-[var(--color-gris)]">
                {deLaComuna.length}{' '}
                {deLaComuna.length === 1 ? 'entrega' : 'entregas'}
              </span>
            </h2>

            <ul className="flex flex-col gap-3">
              {deLaComuna.map((pedido) => (
                <li key={pedido.id}>
                  <TarjetaPedido
                    pedido={pedido}
                    ocupado={ocupado === pedido.id}
                    onCambiarEntrega={cambiarEntrega}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-beige-borde)] bg-white p-4">
      <p className="text-xs tracking-wide text-[var(--color-gris)] uppercase">{etiqueta}</p>
      <p className="numeros mt-1 text-xl font-bold text-[var(--color-carbon)]">{valor}</p>
    </div>
  )
}

function TarjetaPedido({
  pedido,
  ocupado,
  onCambiarEntrega,
}: {
  pedido: PedidoConItems
  ocupado: boolean
  onCambiarEntrega: (id: string, entregado: boolean) => void
}) {
  const entregado = pedido.estado === 'entregado'
  const alerta = ESTADOS_DE_ALERTA.includes(pedido.estado)
  const wa = `https://wa.me/${pedido.telefono.replace(/\D/g, '')}`

  return (
    <article
      className={`rounded-xl border bg-white p-4 ${
        alerta
          ? 'border-2 border-[var(--color-error)]'
          : entregado
            ? 'border-[var(--color-beige-borde)] opacity-70'
            : 'border-[var(--color-beige-borde)]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="numeros font-[family-name:var(--font-display)] text-lg text-[var(--color-carbon)]">
              #{pedido.numero}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                alerta
                  ? 'bg-[var(--color-error)] text-white'
                  : entregado
                    ? 'bg-[var(--color-exito)] text-white'
                    : pedido.estado === 'pagado'
                      ? 'bg-[var(--color-terracota)] text-[var(--color-crema)]'
                      : 'bg-[var(--color-beige)] text-[var(--color-marron)]'
              }`}
            >
              {ETIQUETA_ESTADO[pedido.estado]}
            </span>
            {pedido.es_regalo && (
              <span className="rounded-md bg-[var(--color-dorado)] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[var(--color-carbon)] uppercase">
                Regalo
              </span>
            )}
          </p>
          <p className="mt-1 font-semibold text-[var(--color-carbon)]">{pedido.nombre}</p>
        </div>

        <p className="precio text-lg font-bold text-[var(--color-carbon)]">
          {formatearPrecio(pedido.total)}
        </p>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="shrink-0 text-[var(--color-gris)]">Dirección</dt>
          <dd className="font-medium">
            {pedido.direccion}
            {pedido.depto ? `, ${pedido.depto}` : ''}
          </dd>
        </div>

        <div className="flex gap-2">
          <dt className="shrink-0 text-[var(--color-gris)]">Teléfono</dt>
          <dd>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="numeros font-semibold text-[var(--color-terracota)] underline underline-offset-2"
            >
              {formatearTelefono(pedido.telefono)}
            </a>
          </dd>
        </div>

        {pedido.referencia && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-[var(--color-gris)]">Referencia</dt>
            <dd>{pedido.referencia}</dd>
          </div>
        )}

        {pedido.horario_preferido && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-[var(--color-gris)]">Horario</dt>
            <dd>
              {ETIQUETA_HORARIO[pedido.horario_preferido as HorarioPreferido] ??
                pedido.horario_preferido}
            </dd>
          </div>
        )}

        <div className="flex gap-2">
          <dt className="shrink-0 text-[var(--color-gris)]">Correo</dt>
          <dd className="truncate">{pedido.email}</dd>
        </div>

        <div className="flex gap-2">
          <dt className="shrink-0 text-[var(--color-gris)]">
            {entregado ? 'Entregado' : 'Pagado'}
          </dt>
          <dd className="numeros">
            {fechaCorta(entregado ? pedido.entregado_en : pedido.pagado_en)}
          </dd>
        </div>
      </dl>

      <ul className="mt-3 flex flex-wrap gap-2">
        {pedido.items.map((item) => (
          <li
            key={item.id}
            className="rounded-md bg-[var(--color-beige)] px-2.5 py-1 text-sm"
          >
            {item.nombre} <span className="numeros font-semibold">×{item.cantidad}</span>
          </li>
        ))}
      </ul>

      {pedido.es_regalo && pedido.mensaje_regalo && (
        <p className="mt-3 rounded-lg bg-[var(--color-dorado)]/12 p-3 text-sm italic">
          Tarjeta: “{pedido.mensaje_regalo}”
        </p>
      )}

      {pedido.notas_internas && (
        <p className="mt-3 rounded-lg bg-[var(--color-error)]/8 p-3 text-sm whitespace-pre-line">
          {pedido.notas_internas}
        </p>
      )}

      {(pedido.estado === 'pagado' || entregado) && (
        <div className="mt-4 flex gap-2 border-t border-[var(--color-beige-borde)] pt-3">
          <button
            type="button"
            onClick={() => onCambiarEntrega(pedido.id, !entregado)}
            disabled={ocupado}
            className={`btn min-h-[44px] px-4 text-sm ${
              entregado ? 'btn-secundario' : 'btn-primario'
            }`}
          >
            {ocupado
              ? 'Guardando…'
              : entregado
                ? 'Marcar como no entregado'
                : 'Marcar como entregado'}
          </button>
        </div>
      )}
    </article>
  )
}
