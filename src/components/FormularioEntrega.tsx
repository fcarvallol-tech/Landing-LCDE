'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { COMUNAS, ETIQUETA_HORARIO, HORARIOS_PREFERIDOS } from '@/lib/logistica'
import { WA_FUERA_DE_COBERTURA } from '@/lib/negocio'
import { normalizarTelefono } from '@/lib/validacion'
import { formatearPrecio } from '@/lib/catalogo'
import { campanaRecordada } from '@/lib/campanas'
import type { Totales } from '@/lib/precios'
import type { Lineas } from '@/components/CarritoProvider'
import { iniciarCheckout } from '@/lib/eventos'

/**
 * Formulario de entrega (docs/04-logistica.md).
 *
 * Detalles que importan:
 *  - La comuna es un <select> cerrado con las 9 comunas. No hay texto libre:
 *    es imposible comprar hacia otra comuna desde acá, y el servidor lo
 *    revalida igual.
 *  - Honeypot invisible + marca de tiempo del montaje (docs/06 §5).
 *  - Cada campo con su <label>, su autocomplete y sus errores anunciados.
 *  - Se valida al salir de cada campo, nunca mientras se escribe (docs/10).
 *  - No sabe de dónde vienen los productos: lo usan el panel del carrito y la
 *    pantalla de compra directa (docs/12 §4), cada uno con sus propias líneas.
 */

type Errores = Record<string, string>

const CAMPOS_EN_ORDEN = [
  'nombre',
  'telefono',
  'email',
  'comuna',
  'direccion',
  'terminos',
] as const

export function FormularioEntrega({
  lineas,
  totales,
  onVolver,
  alIniciarPago,
  mostrarTotal = false,
}: {
  /** Qué se compra. Solo `id` y `cantidad` viajan al servidor. */
  lineas: Lineas
  /** Solo para mostrar. El total que se cobra lo recalcula el servidor. */
  totales: Totales
  /** Si existe, se muestra "← Volver al carrito". */
  onVolver?: () => void
  /** Se llama justo antes de salir hacia Mercado Pago. */
  alIniciarPago?: () => void
  /** Muestra el total a pagar sobre el botón (en el carrito ya está al pie). */
  mostrarTotal?: boolean
}) {
  const idBase = useId()

  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [esRegalo, setEsRegalo] = useState(false)

  const montadoEn = useRef<number>(Date.now())

  useEffect(() => {
    montadoEn.current = Date.now()
  }, [])

  const campoId = (nombre: string) => `${idBase}-${nombre}`
  const errorId = (nombre: string) => `${idBase}-${nombre}-error`

  function validarEnCliente(datos: FormData): Errores {
    const problemas: Errores = {}

    const nombre = String(datos.get('nombre') ?? '').trim()
    if (nombre.length < 3) problemas.nombre = 'Escribe tu nombre y apellido'

    const email = String(datos.get('email') ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      problemas.email = 'Revisa tu correo, parece que le falta algo'
    }

    const telefono = String(datos.get('telefono') ?? '')
    if (!normalizarTelefono(telefono)) {
      problemas.telefono = 'Necesitamos un celular chileno, por ejemplo +56 9 1234 5678'
    }

    const comuna = String(datos.get('comuna') ?? '')
    if (!(COMUNAS as readonly string[]).includes(comuna)) {
      problemas.comuna = 'Elige una de las comunas donde entregamos'
    }

    const direccion = String(datos.get('direccion') ?? '').trim()
    if (direccion.length < 5) problemas.direccion = 'Escribe la calle y el número'

    if (datos.get('terminos') !== 'on') {
      problemas.terminos = 'Para comprar necesitas aceptar los términos y la privacidad'
    }

    return problemas
  }

  /**
   * Validación al salir de un campo: si quedó con algo escrito y está mal, se
   * avisa; si estaba marcado y ya está bien, se limpia. Un campo vacío no se
   * marca al pasar por él con el tabulador: eso se revisa al enviar.
   */
  function alSalirDeCampo(evento: React.FocusEvent<HTMLFormElement>) {
    const campo = evento.target
    if (!(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement)) return
    const nombre = campo.name
    if (!nombre || !(CAMPOS_EN_ORDEN as readonly string[]).includes(nombre)) return
    if (nombre === 'terminos') return

    const problema = validarEnCliente(new FormData(evento.currentTarget))[nombre]
    const vacio = campo.value.trim() === ''

    setErrores((previos) => {
      if (problema && !vacio) return { ...previos, [nombre]: problema }
      if (!problema && previos[nombre]) {
        const siguientes = { ...previos }
        delete siguientes[nombre]
        return siguientes
      }
      return previos
    })
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return

    const datos = new FormData(evento.currentTarget)

    const problemas = validarEnCliente(datos)
    if (Object.keys(problemas).length > 0) {
      setErrores(problemas)
      setErrorGeneral(null)
      // Llevar el foco al primer campo con problema.
      const primero = CAMPOS_EN_ORDEN.find((c) => problemas[c])
      if (primero) {
        document.getElementById(campoId(primero))?.focus()
      }
      return
    }

    setErrores({})
    setErrorGeneral(null)
    setEnviando(true)

    const items = (Object.entries(lineas) as [string, number][])
      .filter(([, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({ id, cantidad }))

    // Fíjate en lo que NO va en este cuerpo: ni precios, ni total, ni envío.
    // El servidor los calcula desde su propio catálogo.
    // El ángulo del anuncio con que llegó la persona, si llegó desde uno
    // (docs/12 §6). Se guarda en el pedido para saber qué ángulo vende.
    const campana = campanaRecordada()

    const cuerpo = {
      items,
      cliente: {
        nombre: String(datos.get('nombre') ?? ''),
        email: String(datos.get('email') ?? ''),
        telefono: String(datos.get('telefono') ?? ''),
        comuna: String(datos.get('comuna') ?? ''),
        direccion: String(datos.get('direccion') ?? ''),
        depto: String(datos.get('depto') ?? ''),
        referencia: String(datos.get('referencia') ?? ''),
        horarioPreferido: (String(datos.get('horarioPreferido') ?? '') ||
          null) as string | null,
        esRegalo,
        mensajeRegalo: esRegalo ? String(datos.get('mensajeRegalo') ?? '') : '',
      },
      consentimientos: {
        terminos: datos.get('terminos') === 'on',
        marketing: datos.get('marketing') === 'on',
      },
      apellidoSegundo: String(datos.get('apellidoSegundo') ?? ''),
      tiempoFormulario: Date.now() - montadoEn.current,
      ...(campana ? { campana } : {}),
    }

    try {
      iniciarCheckout(totales.total, totales.unidades)

      const respuesta = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })

      const resultado: unknown = await respuesta.json().catch(() => null)

      if (!respuesta.ok || !resultado || typeof resultado !== 'object') {
        const mensaje =
          resultado && typeof resultado === 'object' && 'mensaje' in resultado
            ? String((resultado as { mensaje: unknown }).mensaje)
            : 'No pudimos iniciar el pago. Inténtalo de nuevo en un momento.'

        const camposConError =
          resultado && typeof resultado === 'object' && 'campos' in resultado
            ? ((resultado as { campos: unknown }).campos as Errores)
            : null

        if (camposConError && typeof camposConError === 'object') {
          setErrores(camposConError)
        }
        setErrorGeneral(mensaje)
        setEnviando(false)
        return
      }

      const url = (resultado as { url?: unknown }).url
      if (typeof url !== 'string' || !url.startsWith('https://')) {
        setErrorGeneral('No pudimos iniciar el pago. Inténtalo de nuevo en un momento.')
        setEnviando(false)
        return
      }

      // El pedido ya está guardado en el servidor. Quien llama decide qué
      // limpiar (el carrito se vacía para no comprar dos veces al volver).
      alIniciarPago?.()
      window.location.href = url
    } catch {
      setErrorGeneral(
        'Se cortó la conexión. Revisa tu internet e inténtalo de nuevo.',
      )
      setEnviando(false)
    }
  }

  const error = (nombre: string) =>
    errores[nombre] ? (
      <p id={errorId(nombre)} className="error-campo" role="alert">
        {errores[nombre]}
      </p>
    ) : null

  const props = (nombre: string) => ({
    id: campoId(nombre),
    name: nombre,
    'aria-invalid': errores[nombre] ? true : undefined,
    'aria-describedby': errores[nombre] ? errorId(nombre) : undefined,
  })

  return (
    <form onSubmit={enviar} onBlur={alSalirDeCampo} noValidate className="flex flex-col gap-4">
      {onVolver && (
        <button
          type="button"
          onClick={onVolver}
          className="self-start text-sm font-semibold text-[var(--color-terracota)] underline underline-offset-2"
        >
          ← Volver al carrito
        </button>
      )}

      {errorGeneral && (
        <div
          role="alert"
          className="rounded-lg border-2 border-[var(--color-error)] bg-[var(--color-error)]/8 p-3 text-sm font-medium text-[var(--color-error)]"
        >
          {errorGeneral}
        </div>
      )}

      {/*
        Honeypot: fuera de pantalla, sin tabulación e invisible para lectores
        de pantalla. Un bot que rellena todo lo que encuentra lo delata.

        La etiqueta dice explícitamente que no se complete y el campo no se
        llama como ningún dato real: así el autocompletado del navegador o un
        gestor de contraseñas no lo rellenan por su cuenta y dejan fuera a una
        persona de verdad.
      */}
      <div className="trampa" aria-hidden="true">
        <label htmlFor={campoId('apellidoSegundo')}>
          No completes este campo
        </label>
        <input
          id={campoId('apellidoSegundo')}
          name="apellidoSegundo"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div>
        <label className="etiqueta" htmlFor={campoId('nombre')}>
          Nombre y apellido
        </label>
        <input
          {...props('nombre')}
          type="text"
          className="campo"
          autoComplete="name"
          maxLength={80}
          required
          placeholder="María González"
        />
        {error('nombre')}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor={campoId('telefono')}>
            Celular
          </label>
          <input
            {...props('telefono')}
            type="tel"
            inputMode="tel"
            className="campo numeros"
            autoComplete="tel"
            maxLength={24}
            required
            placeholder="+56 9 1234 5678"
          />
          {error('telefono') ?? (
            <p className="mt-1 text-xs text-[var(--color-gris)]">
              Te escribimos por WhatsApp a este número.
            </p>
          )}
        </div>

        <div>
          <label className="etiqueta" htmlFor={campoId('email')}>
            Correo
          </label>
          <input
            {...props('email')}
            type="email"
            inputMode="email"
            className="campo"
            autoComplete="email"
            maxLength={254}
            required
            placeholder="maria@correo.cl"
          />
          {error('email')}
        </div>
      </div>

      <div>
        <label className="etiqueta" htmlFor={campoId('comuna')}>
          Comuna
        </label>
        <select {...props('comuna')} className="campo" autoComplete="address-level3" required defaultValue="">
          <option value="" disabled>
            Elige tu comuna
          </option>
          {COMUNAS.map((comuna) => (
            <option key={comuna} value={comuna}>
              {comuna}
            </option>
          ))}
        </select>
        {error('comuna')}
        <p className="mt-1.5 text-xs text-[var(--color-gris)]">
          <a
            href={WA_FUERA_DE_COBERTURA}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--color-terracota)]"
          >
            ¿No estás en estas comunas? Escríbenos por WhatsApp y vemos qué podemos hacer.
          </a>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="etiqueta" htmlFor={campoId('direccion')}>
            Dirección
          </label>
          <input
            {...props('direccion')}
            type="text"
            className="campo"
            autoComplete="address-line1"
            maxLength={140}
            required
            placeholder="Av. Ossa 1234"
          />
          {error('direccion')}
        </div>

        <div className="sm:w-40">
          <label className="etiqueta" htmlFor={campoId('depto')}>
            Depto / casa <span className="font-normal text-[var(--color-gris)]">(opcional)</span>
          </label>
          <input
            {...props('depto')}
            type="text"
            className="campo"
            autoComplete="address-line2"
            maxLength={40}
            placeholder="Depto 402"
          />
        </div>
      </div>

      <div>
        <label className="etiqueta" htmlFor={campoId('referencia')}>
          Referencia para la entrega{' '}
          <span className="font-normal text-[var(--color-gris)]">(opcional)</span>
        </label>
        <input
          {...props('referencia')}
          type="text"
          className="campo"
          maxLength={200}
          placeholder="Portón café, tocar el timbre de la izquierda"
        />
      </div>

      <fieldset>
        <legend className="etiqueta">
          Horario que te acomoda{' '}
          <span className="font-normal text-[var(--color-gris)]">(opcional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {HORARIOS_PREFERIDOS.map((horario) => (
            <label
              key={horario}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-beige-borde)] bg-white px-3 text-sm has-[:checked]:border-[var(--color-terracota)] has-[:checked]:bg-[var(--color-terracota)]/8"
            >
              <input
                type="radio"
                name="horarioPreferido"
                value={horario}
                className="accent-[var(--color-terracota)]"
              />
              {ETIQUETA_HORARIO[horario]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-xl border border-[var(--color-beige-borde)] bg-[var(--color-beige)] p-3">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            name="esRegalo"
            checked={esRegalo}
            onChange={(e) => setEsRegalo(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-terracota)]"
          />
          <span>Es un regalo</span>
        </label>

        {esRegalo && (
          <div className="mt-3">
            <label className="etiqueta" htmlFor={campoId('mensajeRegalo')}>
              Mensaje para la tarjeta{' '}
              <span className="font-normal text-[var(--color-gris)]">(opcional)</span>
            </label>
            <textarea
              id={campoId('mensajeRegalo')}
              name="mensajeRegalo"
              className="campo min-h-[80px] resize-y"
              maxLength={200}
              placeholder="Para Matías, que aprenda a ganarle a su papá. Feliz cumpleaños."
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-beige-borde)] pt-4">
        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              id={campoId('terminos')}
              type="checkbox"
              name="terminos"
              className="mt-0.5 size-5 shrink-0 accent-[var(--color-terracota)]"
              aria-invalid={errores.terminos ? true : undefined}
              aria-describedby={errores.terminos ? errorId('terminos') : undefined}
            />
            <span>
              Acepto los{' '}
              <Link
                href="/terminos"
                target="_blank"
                className="underline underline-offset-2 hover:text-[var(--color-terracota)]"
              >
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link
                href="/privacidad"
                target="_blank"
                className="underline underline-offset-2 hover:text-[var(--color-terracota)]"
              >
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
          {error('terminos')}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="marketing"
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-terracota)]"
          />
          <span>Quiero recibir novedades y ofertas de La Casa del Estratega.</span>
        </label>
      </div>

      {mostrarTotal && (
        <p className="flex items-baseline justify-between gap-4 rounded-lg bg-[var(--color-beige)] px-4 py-3">
          <span className="text-sm">
            Total a pagar
            <span className="block text-xs text-[var(--color-gris)]">
              {totales.envioEsGratis
                ? 'Con despacho gratis'
                : `Incluye ${formatearPrecio(totales.costoEnvio)} de despacho`}
            </span>
          </span>
          <span className="precio text-xl font-extrabold text-[var(--color-carbon)]">
            {formatearPrecio(totales.total)}
          </span>
        </p>
      )}

      <button type="submit" className="btn btn-primario w-full text-base" disabled={enviando}>
        {enviando ? 'Llevándote al pago…' : 'Pagar con Mercado Pago'}
      </button>

      <p className="text-center text-xs leading-relaxed text-[var(--color-gris)]">
        El pago ocurre en el entorno seguro de Mercado Pago.
        <br />
        Nunca vemos ni guardamos los datos de tu tarjeta.
      </p>
    </form>
  )
}
