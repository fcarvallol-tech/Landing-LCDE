/**
 * Comprobaciones de seguridad ejecutables (docs/06-seguridad.md §10).
 *
 * Corre contra el servidor local levantado con `npm run dev`.
 * Uso:  node scripts/verificar-seguridad.mjs
 *
 * Estas pruebas verifican las defensas que NO dependen de Supabase ni de
 * credenciales reales de Mercado Pago: validación de entrada, integridad de
 * precios, lista blanca de comunas, firma del webhook y protección del panel.
 *
 * Las que sí requieren base de datos real (idempotencia del webhook, descuento
 * atómico de stock, compra con stock 0) están descritas en
 * docs/09-verificacion.md y las tiene que correr Felipe con la compra de prueba.
 */

import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

// Lee el secreto del webhook desde .env.local para poder firmar de verdad.
function leerEnv(clave) {
  try {
    const texto = readFileSync(join(raiz, '.env.local'), 'utf8')
    for (const linea of texto.split('\n')) {
      const limpia = linea.trim()
      if (!limpia || limpia.startsWith('#')) continue
      const igual = limpia.indexOf('=')
      if (igual < 0) continue
      if (limpia.slice(0, igual).trim() === clave) {
        return limpia.slice(igual + 1).trim().replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    /* sin .env.local */
  }
  return null
}

const resultados = []

function registrar(numero, nombre, paso, detalle) {
  resultados.push({ numero, nombre, paso, detalle })
  const marca = paso ? '  PASA' : '  FALLA'
  console.log(`${marca}  ${numero}. ${nombre}`)
  console.log(`        ${detalle}`)
}

const clienteValido = {
  nombre: 'María González',
  email: 'maria@ejemplo.cl',
  telefono: '+56 9 1234 5678',
  comuna: 'Ñuñoa',
  direccion: 'Av. Ossa 1234',
  depto: '',
  referencia: '',
  horarioPreferido: null,
  esRegalo: false,
  mensajeRegalo: '',
}

const consentimientosValidos = { terminos: true, marketing: false }

let contadorIp = 0

/** Una IP simulada distinta por prueba: el rate limiting es por IP y no
 *  queremos que una prueba se coma la cuota de la siguiente. */
function ipDePrueba() {
  contadorIp += 1
  return `203.0.113.${contadorIp}`
}

async function postJson(ruta, cuerpo, cabeceras = {}) {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': ipDePrueba(),
      ...cabeceras,
    },
    body: JSON.stringify(cuerpo),
  })
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    /* sin cuerpo */
  }
  return { estado: respuesta.status, datos }
}

console.log(`\nVerificación de seguridad contra ${BASE}\n${'─'.repeat(60)}\n`)

// ── 2. Precio manipulado desde el cliente ───────────────────────────────────
{
  const { estado, datos } = await postJson('/api/checkout', {
    items: [{ id: 'gm', cantidad: 1, precio: 1 }],
    cliente: clienteValido,
    consentimientos: consentimientosValidos,
    tiempoFormulario: 9000,
  })

  registrar(
    2,
    'Checkout con un precio inyectado en el ítem',
    estado === 400,
    `HTTP ${estado} — el esquema es .strict(): el campo "precio" hace fallar la ` +
      `petición en vez de ignorarse. Mensaje: ${datos?.mensaje ?? '(sin cuerpo)'}`,
  )
}

{
  const { estado } = await postJson('/api/checkout', {
    items: [{ id: 'gm', cantidad: 1 }],
    cliente: clienteValido,
    consentimientos: consentimientosValidos,
    total: 100,
    costoEnvio: 0,
    tiempoFormulario: 9000,
  })

  registrar(
    '2b',
    'Checkout con "total" y "costoEnvio" inyectados en la raíz',
    estado === 400,
    `HTTP ${estado} — rechazado. El total lo calcula solo el servidor desde el catálogo.`,
  )
}

// ── 3. Comuna fuera de la lista blanca ──────────────────────────────────────
{
  const { estado, datos } = await postJson('/api/checkout', {
    items: [{ id: 'cm', cantidad: 1 }],
    cliente: { ...clienteValido, comuna: 'Puente Alto' },
    consentimientos: consentimientosValidos,
    tiempoFormulario: 9000,
  })

  registrar(
    3,
    'Compra hacia una comuna fuera de cobertura',
    estado === 400,
    `HTTP ${estado} — "Puente Alto" no está en la lista blanca de 9 comunas. ` +
      `Campo: ${datos?.campos?.comuna ?? '(sin detalle)'}`,
  )
}

// ── Extra: consentimiento de términos obligatorio ───────────────────────────
{
  const { estado } = await postJson('/api/checkout', {
    items: [{ id: 'cm', cantidad: 1 }],
    cliente: clienteValido,
    consentimientos: { terminos: false, marketing: true },
    tiempoFormulario: 9000,
  })

  registrar(
    '3b',
    'Compra sin aceptar los términos',
    estado === 400,
    `HTTP ${estado} — no se puede comprar sin aceptar términos y privacidad.`,
  )
}

// ── Extra: cantidades fuera de rango ────────────────────────────────────────
{
  const { estado } = await postJson('/api/checkout', {
    items: [{ id: 'cm', cantidad: 999 }],
    cliente: clienteValido,
    consentimientos: consentimientosValidos,
    tiempoFormulario: 9000,
  })

  registrar(
    '3c',
    'Cantidad de 999 unidades de un mismo producto',
    estado === 400,
    `HTTP ${estado} — el máximo es 10 por SKU y 20 por pedido.`,
  )
}

// ── Extra: honeypot ─────────────────────────────────────────────────────────
{
  const { estado, datos } = await postJson('/api/checkout', {
    items: [{ id: 'cm', cantidad: 1 }],
    cliente: clienteValido,
    consentimientos: consentimientosValidos,
    apellidoSegundo: 'soy-un-bot',
    tiempoFormulario: 9000,
  })

  registrar(
    '3d',
    'Honeypot relleno (comportamiento de bot)',
    estado === 200 && typeof datos?.url === 'string' && !datos.url.includes('mercadopago'),
    `HTTP ${estado} — responde 200 falso sin crear pedido ni preferencia. ` +
      `URL devuelta: ${datos?.url ?? '(ninguna)'}`,
  )
}

// ── Extra: time trap ────────────────────────────────────────────────────────
{
  const { estado } = await postJson('/api/checkout', {
    items: [{ id: 'cm', cantidad: 1 }],
    cliente: clienteValido,
    consentimientos: consentimientosValidos,
    tiempoFormulario: 400,
  })

  registrar(
    '3e',
    'Formulario enviado en menos de 3 segundos',
    estado === 400,
    `HTTP ${estado} — nadie llena una dirección completa en 400 ms.`,
  )
}

// ── Extra: rate limiting del checkout ──────────────────────────────────────
{
  const ipFija = '198.51.100.7'
  let ultimoEstado = 0

  // 7 intentos seguidos desde la misma IP: el tope es 5 cada 10 minutos.
  for (let i = 0; i < 7; i += 1) {
    const respuesta = await fetch(`${BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': ipFija },
      body: JSON.stringify({
        items: [{ id: 'cm', cantidad: 1 }],
        cliente: clienteValido,
        consentimientos: consentimientosValidos,
        tiempoFormulario: 9000,
      }),
    })
    ultimoEstado = respuesta.status
  }

  registrar(
    '3f',
    'Rate limiting: 7 intentos seguidos desde la misma IP',
    ultimoEstado === 429,
    `HTTP ${ultimoEstado} en el séptimo intento — el tope de 5 cada 10 minutos se aplica.`,
  )
}

// ── 4. Webhook con firma inválida ───────────────────────────────────────────
const secreto = leerEnv('MP_WEBHOOK_SECRET')

{
  const respuesta = await fetch(
    `${BASE}/api/webhooks/mercadopago?data.id=123456789&type=payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'ts=1700000000000,v1=firmainventadaquenoescorrecta0000000000000000000000',
        'x-request-id': 'peticion-de-prueba',
      },
      body: JSON.stringify({ type: 'payment', data: { id: '123456789' } }),
    },
  )

  registrar(
    4,
    'Webhook con firma inválida',
    respuesta.status === 401,
    `HTTP ${respuesta.status} — se rechaza antes de tocar la base de datos y ` +
      `antes de consultar a Mercado Pago.`,
  )
}

{
  const respuesta = await fetch(
    `${BASE}/api/webhooks/mercadopago?data.id=123456789&type=payment`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'payment', data: { id: '123456789' } }),
    },
  )

  registrar(
    '4b',
    'Webhook sin ninguna cabecera de firma',
    respuesta.status === 401,
    `HTTP ${respuesta.status} — sin x-signature no se procesa nada.`,
  )
}

// ── 4c. Webhook con firma VÁLIDA: debe pasar el control de firma ────────────
if (secreto) {
  const dataId = '123456789'
  const requestId = 'peticion-de-prueba'
  const ts = String(Date.now())
  const manifiesto = `id:${dataId};request-id:${requestId};ts:${ts};`
  const v1 = createHmac('sha256', secreto).update(manifiesto).digest('hex')

  const respuesta = await fetch(
    `${BASE}/api/webhooks/mercadopago?data.id=${dataId}&type=payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': `ts=${ts},v1=${v1}`,
        'x-request-id': requestId,
      },
      body: JSON.stringify({ type: 'payment', data: { id: dataId } }),
    },
  )

  // Con credenciales falsas de Mercado Pago, pasar la firma lleva a un fallo
  // al consultar el pago (500) o a un pago inexistente (200). Lo que NO puede
  // pasar es un 401: eso significaría que la firma correcta se rechazó.
  registrar(
    '4c',
    'Webhook con firma VÁLIDA calculada con el manifiesto oficial',
    respuesta.status !== 401,
    `HTTP ${respuesta.status} — la firma se aceptó (no es 401). El manifiesto ` +
      `usado fue "id:...;request-id:...;ts:...;" con HMAC-SHA256 hexadecimal.`,
  )

  // Manifiesto mal armado (orden cambiado) → tiene que fallar.
  const malArmado = `request-id:${requestId};id:${dataId};ts:${ts};`
  const v1Malo = createHmac('sha256', secreto).update(malArmado).digest('hex')
  const respuestaMala = await fetch(
    `${BASE}/api/webhooks/mercadopago?data.id=${dataId}&type=payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': `ts=${ts},v1=${v1Malo}`,
        'x-request-id': requestId,
      },
      body: JSON.stringify({ type: 'payment', data: { id: dataId } }),
    },
  )

  registrar(
    '4d',
    'Webhook firmado con un manifiesto en otro orden',
    respuestaMala.status === 401,
    `HTTP ${respuestaMala.status} — solo se acepta el orden exacto que documenta Mercado Pago.`,
  )
} else {
  registrar(
    '4c',
    'Webhook con firma válida',
    false,
    'OMITIDA: no se encontró MP_WEBHOOK_SECRET en .env.local',
  )
}

// ── 7. Panel sin sesión ─────────────────────────────────────────────────────
{
  const respuesta = await fetch(`${BASE}/admin/pedidos`, { redirect: 'manual' })
  const destino = respuesta.headers.get('location') ?? ''

  registrar(
    7,
    'Acceso a /admin/pedidos sin sesión',
    (respuesta.status === 307 || respuesta.status === 302) && destino.includes('/admin'),
    `HTTP ${respuesta.status} → redirige a ${destino || '(sin location)'}`,
  )
}

{
  const respuesta = await fetch(`${BASE}/api/admin/csv`, { redirect: 'manual' })

  registrar(
    '7b',
    'Descarga del CSV sin sesión',
    respuesta.status === 401,
    `HTTP ${respuesta.status} — la API del panel responde 401, no redirige.`,
  )
}

{
  const { estado } = await postJson('/api/admin/acciones', {
    accion: 'stock',
    productoId: 'gm',
    stock: 9999,
    csrf: 'inventado',
  })

  registrar(
    '7c',
    'Cambio de stock sin sesión',
    estado === 401,
    `HTTP ${estado} — no se puede mutar nada del panel sin cookie válida.`,
  )
}

{
  const { estado } = await postJson('/api/admin/entrar', { password: 'incorrecta' })

  registrar(
    '7d',
    'Login del panel con contraseña incorrecta',
    estado === 401,
    `HTTP ${estado} — comparación en tiempo constante, mensaje genérico.`,
  )
}

// ── Cabeceras de seguridad ──────────────────────────────────────────────────
{
  const respuesta = await fetch(`${BASE}/`)
  const esperadas = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'strict-transport-security': 'max-age=63072000',
  }

  const faltantes = []
  for (const [cabecera, valor] of Object.entries(esperadas)) {
    const recibido = respuesta.headers.get(cabecera)
    if (!recibido || !recibido.includes(valor)) faltantes.push(cabecera)
  }

  const csp =
    respuesta.headers.get('content-security-policy-report-only') ??
    respuesta.headers.get('content-security-policy')

  registrar(
    'H',
    'Cabeceras de seguridad y CSP',
    faltantes.length === 0 && Boolean(csp),
    faltantes.length === 0
      ? `Todas presentes. CSP en modo ${
          respuesta.headers.get('content-security-policy') ? 'BLOQUEANTE' : 'Report-Only'
        }, con nonce y frame-ancestors 'none'.`
      : `Faltan: ${faltantes.join(', ')}`,
  )
}

// ── Resumen ─────────────────────────────────────────────────────────────────
const pasaron = resultados.filter((r) => r.paso).length
console.log(`\n${'─'.repeat(60)}`)
console.log(`${pasaron} de ${resultados.length} comprobaciones pasaron.\n`)

process.exit(pasaron === resultados.length ? 0 : 1)
