import 'server-only'
import { Resend } from 'resend'
import { correoActivo, env } from '@/lib/env'
import { formatearPrecio } from '@/lib/catalogo'
import { formatearTelefono } from '@/lib/validacion'
import { NEGOCIO } from '@/lib/negocio'
import { ETIQUETA_HORARIO, TEXTO_PLAZO, type HorarioPreferido } from '@/lib/logistica'
import { SITIO_URL } from '@/lib/sitio'
import type { PedidoConItems } from '@/lib/tipos'

/**
 * Correos transaccionales (docs/07-copy-y-contenido.md §F).
 *
 * Regla de oro de este archivo: TODO dato que escribió una persona pasa por
 * `esc()` antes de entrar al HTML (docs/06-seguridad.md §4). Un nombre con
 * `<script>` no puede llegar vivo al inbox de Felipe.
 *
 * Si no hay RESEND_API_KEY, las funciones no hacen nada y devuelven false.
 * Nunca lanzan: un correo que falla no puede tumbar el webhook de un pago.
 */

/** Escape de HTML. Es la única puerta por la que entra texto del usuario. */
function esc(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) return ''
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

let clienteResend: Resend | null = null

function resend(): Resend | null {
  if (!correoActivo()) return null
  if (!clienteResend) {
    clienteResend = new Resend(process.env.RESEND_API_KEY)
  }
  return clienteResend
}

async function enviar(opciones: {
  para: string
  asunto: string
  html: string
  texto: string
  responderA?: string
}): Promise<boolean> {
  const cliente = resend()
  if (!cliente) {
    console.info('[correo] RESEND_API_KEY no configurada: no se envía nada.')
    return false
  }

  try {
    const { MAIL_FROM } = env()
    const { error } = await cliente.emails.send({
      from: MAIL_FROM,
      to: [opciones.para],
      subject: opciones.asunto,
      html: opciones.html,
      text: opciones.texto,
      ...(opciones.responderA ? { replyTo: opciones.responderA } : {}),
    })

    if (error) {
      console.error('[correo] Resend devolvió un error:', error.message)
      return false
    }
    return true
  } catch (fallo) {
    console.error(
      '[correo] no se pudo enviar:',
      fallo instanceof Error ? fallo.message : String(fallo),
    )
    return false
  }
}

// ── Plantilla base ──────────────────────────────────────────────────────────

const C = {
  crema: '#FAF3E8',
  beige: '#F0E1CB',
  borde: '#DFC9AC',
  terracota: '#A8452C',
  carbon: '#1E1A17',
  marron: '#3D2F26',
  gris: '#7A6A5C',
}

function plantilla(opciones: {
  titulo: string
  preencabezado: string
  contenido: string
}): string {
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opciones.titulo)}</title>
</head>
<body style="margin:0;padding:0;background:${C.crema};color:${C.marron};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opciones.preencabezado)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.crema};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${C.borde};border-radius:12px;overflow:hidden;">
<tr><td style="background:${C.carbon};padding:20px 24px;">
<p style="margin:0;color:${C.crema};font-size:15px;font-weight:700;letter-spacing:0.02em;">La Casa del Estratega</p>
</td></tr>
<tr><td style="padding:24px;">
${opciones.contenido}
</td></tr>
<tr><td style="background:${C.beige};padding:18px 24px;border-top:1px solid ${C.borde};">
<p style="margin:0 0 6px;font-size:13px;color:${C.gris};">
${NEGOCIO.nombre} · <a href="mailto:${NEGOCIO.email}" style="color:${C.terracota};">${NEGOCIO.email}</a> · WhatsApp ${NEGOCIO.whatsappVisible}
</p>
<p style="margin:0;font-size:13px;color:${C.gris};">
<a href="${NEGOCIO.instagram}" style="color:${C.terracota};">${NEGOCIO.instagramUsuario}</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function filaItems(pedido: PedidoConItems): string {
  return pedido.items
    .map(
      (item) => `<tr>
<td style="padding:8px 0;border-bottom:1px solid ${C.borde};font-size:15px;">
${esc(item.nombre)} <span style="color:${C.gris};">× ${item.cantidad}</span>
</td>
<td style="padding:8px 0;border-bottom:1px solid ${C.borde};text-align:right;font-size:15px;font-weight:600;white-space:nowrap;">
${formatearPrecio(item.precio_unit * item.cantidad)}
</td>
</tr>`,
    )
    .join('')
}

function bloqueTotales(pedido: PedidoConItems): string {
  return `<tr>
<td style="padding:8px 0;font-size:15px;">Productos</td>
<td style="padding:8px 0;text-align:right;font-size:15px;">${formatearPrecio(pedido.subtotal)}</td>
</tr>
<tr>
<td style="padding:0 0 8px;font-size:15px;">Despacho</td>
<td style="padding:0 0 8px;text-align:right;font-size:15px;">${
    pedido.costo_envio === 0
      ? '<span style="color:#2F6B4F;font-weight:600;">Gratis</span>'
      : formatearPrecio(pedido.costo_envio)
  }</td>
</tr>
<tr>
<td style="padding:10px 0 0;border-top:2px solid ${C.carbon};font-size:17px;font-weight:700;color:${C.carbon};">Total</td>
<td style="padding:10px 0 0;border-top:2px solid ${C.carbon};text-align:right;font-size:17px;font-weight:700;color:${C.carbon};">${formatearPrecio(pedido.total)}</td>
</tr>`
}

function direccionCompleta(pedido: PedidoConItems): string {
  const partes = [pedido.direccion]
  if (pedido.depto) partes.push(pedido.depto)
  partes.push(pedido.comuna)
  return partes.join(', ')
}

// ── Correo al comprador ─────────────────────────────────────────────────────

export async function correoAlComprador(pedido: PedidoConItems): Promise<boolean> {
  const nombrePila = pedido.nombre.split(' ')[0] ?? pedido.nombre

  const contenido = `
<h1 style="margin:0 0 6px;font-size:22px;line-height:1.25;color:${C.carbon};">Listo, ${esc(nombrePila)}. Tu pedido está confirmado.</h1>
<p style="margin:0 0 20px;font-size:15px;color:${C.gris};">Pedido #${pedido.numero}</p>

<p style="margin:0 0 20px;font-size:16px;">
<strong style="color:${C.carbon};">${esc(TEXTO_PLAZO)}</strong>
</p>

<h2 style="margin:24px 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:${C.gris};">Lo que compraste</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${filaItems(pedido)}
${bloqueTotales(pedido)}
</table>

<h2 style="margin:24px 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:${C.gris};">Dónde te lo llevamos</h2>
<p style="margin:0 0 4px;font-size:15px;">${esc(direccionCompleta(pedido))}</p>
${pedido.referencia ? `<p style="margin:0 0 4px;font-size:14px;color:${C.gris};">Referencia: ${esc(pedido.referencia)}</p>` : ''}
${
  pedido.horario_preferido
    ? `<p style="margin:0;font-size:14px;color:${C.gris};">Horario que prefieres: ${esc(
        ETIQUETA_HORARIO[pedido.horario_preferido as HorarioPreferido] ??
          pedido.horario_preferido,
      )}</p>`
    : ''
}

${
  pedido.es_regalo
    ? `<div style="margin:20px 0 0;padding:14px;background:${C.beige};border-radius:8px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${C.carbon};">Va como regalo</p>
${pedido.mensaje_regalo ? `<p style="margin:0;font-size:14px;font-style:italic;">"${esc(pedido.mensaje_regalo)}"</p>` : `<p style="margin:0;font-size:14px;color:${C.gris};">Sin mensaje para la tarjeta.</p>`}
</div>`
    : ''
}

<div style="margin:26px 0 0;padding-top:18px;border-top:1px solid ${C.borde};">
<p style="margin:0 0 10px;font-size:15px;">¿Alguna duda? Respóndele a este correo o escríbenos por WhatsApp.</p>
<a href="https://wa.me/${NEGOCIO.whatsappNumero}" style="display:inline-block;background:${C.terracota};color:${C.crema};text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:700;font-size:15px;">Escribirnos por WhatsApp</a>
</div>

<p style="margin:22px 0 0;font-size:13px;color:${C.gris};">Te enviamos la boleta junto con esta confirmación.</p>
`

  const texto = [
    `Listo, ${nombrePila}. Tu pedido #${pedido.numero} está confirmado.`,
    '',
    TEXTO_PLAZO,
    '',
    'Lo que compraste:',
    ...pedido.items.map(
      (i) => `- ${i.nombre} x${i.cantidad}: ${formatearPrecio(i.precio_unit * i.cantidad)}`,
    ),
    `Productos: ${formatearPrecio(pedido.subtotal)}`,
    `Despacho: ${pedido.costo_envio === 0 ? 'Gratis' : formatearPrecio(pedido.costo_envio)}`,
    `Total: ${formatearPrecio(pedido.total)}`,
    '',
    `Dirección de entrega: ${direccionCompleta(pedido)}`,
    '',
    `${NEGOCIO.nombre} · ${NEGOCIO.email} · WhatsApp ${NEGOCIO.whatsappVisible}`,
  ].join('\n')

  return enviar({
    para: pedido.email,
    asunto: `Tu pedido #${pedido.numero} está confirmado — ${NEGOCIO.nombre}`,
    html: plantilla({
      titulo: `Pedido #${pedido.numero} confirmado`,
      preencabezado: `Te escribimos por WhatsApp dentro de 24 horas para coordinar la entrega.`,
      contenido,
    }),
    texto,
    responderA: NEGOCIO.email,
  })
}

// ── Correo a Felipe ─────────────────────────────────────────────────────────

export async function correoAlAdmin(
  pedido: PedidoConItems,
  aviso?: string,
): Promise<boolean> {
  const { MAIL_ADMIN } = env()
  const wa = `https://wa.me/${pedido.telefono.replace(/\D/g, '')}`

  const contenido = `
${
  aviso
    ? `<div style="margin:0 0 20px;padding:14px;background:#FDECEA;border-left:4px solid #B02A1F;border-radius:6px;">
<p style="margin:0;font-size:15px;font-weight:700;color:#B02A1F;">${esc(aviso)}</p>
</div>`
    : ''
}

<h1 style="margin:0 0 6px;font-size:22px;line-height:1.25;color:${C.carbon};">Pedido #${pedido.numero} — ${esc(pedido.comuna)}</h1>
<p style="margin:0 0 20px;font-size:20px;font-weight:700;color:${C.terracota};">${formatearPrecio(pedido.total)}</p>

<h2 style="margin:0 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:${C.gris};">A quién le entregas</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
<tr><td style="padding:4px 0;color:${C.gris};width:110px;">Nombre</td><td style="padding:4px 0;font-weight:600;">${esc(pedido.nombre)}</td></tr>
<tr><td style="padding:4px 0;color:${C.gris};">Teléfono</td><td style="padding:4px 0;"><a href="${esc(wa)}" style="color:${C.terracota};font-weight:600;">${esc(formatearTelefono(pedido.telefono))}</a></td></tr>
<tr><td style="padding:4px 0;color:${C.gris};">Correo</td><td style="padding:4px 0;">${esc(pedido.email)}</td></tr>
<tr><td style="padding:4px 0;color:${C.gris};">Comuna</td><td style="padding:4px 0;font-weight:600;">${esc(pedido.comuna)}</td></tr>
<tr><td style="padding:4px 0;color:${C.gris};">Dirección</td><td style="padding:4px 0;">${esc(pedido.direccion)}${pedido.depto ? `, ${esc(pedido.depto)}` : ''}</td></tr>
${pedido.referencia ? `<tr><td style="padding:4px 0;color:${C.gris};">Referencia</td><td style="padding:4px 0;">${esc(pedido.referencia)}</td></tr>` : ''}
${
  pedido.horario_preferido
    ? `<tr><td style="padding:4px 0;color:${C.gris};">Horario</td><td style="padding:4px 0;">${esc(
        ETIQUETA_HORARIO[pedido.horario_preferido as HorarioPreferido] ??
          pedido.horario_preferido,
      )}</td></tr>`
    : ''
}
</table>

<h2 style="margin:24px 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:${C.gris};">Qué llevas</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${filaItems(pedido)}
${bloqueTotales(pedido)}
</table>

${
  pedido.es_regalo
    ? `<div style="margin:20px 0 0;padding:14px;background:${C.beige};border-radius:8px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${C.carbon};">ES UN REGALO — hay que llevar tarjeta</p>
${pedido.mensaje_regalo ? `<p style="margin:0;font-size:15px;font-style:italic;">"${esc(pedido.mensaje_regalo)}"</p>` : `<p style="margin:0;font-size:14px;color:${C.gris};">Sin mensaje.</p>`}
</div>`
    : ''
}

<div style="margin:26px 0 0;">
<a href="${SITIO_URL}/admin/pedidos" style="display:inline-block;background:${C.carbon};color:${C.crema};text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:700;font-size:15px;">Abrir el panel</a>
<a href="${esc(wa)}" style="display:inline-block;margin-left:8px;background:${C.terracota};color:${C.crema};text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:700;font-size:15px;">Escribirle por WhatsApp</a>
</div>

${
  pedido.acepta_marketing
    ? `<p style="margin:20px 0 0;font-size:13px;color:${C.gris};">Aceptó recibir novedades y ofertas.</p>`
    : ''
}
`

  const texto = [
    aviso ? `${aviso}\n` : '',
    `Pedido #${pedido.numero} — ${pedido.comuna} — ${formatearPrecio(pedido.total)}`,
    '',
    `${pedido.nombre}`,
    `${formatearTelefono(pedido.telefono)} — ${wa}`,
    `${pedido.email}`,
    `${direccionCompleta(pedido)}`,
    pedido.referencia ? `Referencia: ${pedido.referencia}` : '',
    '',
    ...pedido.items.map((i) => `- ${i.nombre} x${i.cantidad}`),
    `Total: ${formatearPrecio(pedido.total)}`,
    '',
    `Panel: ${SITIO_URL}/admin/pedidos`,
  ]
    .filter(Boolean)
    .join('\n')

  const prefijo = aviso ? '⚠ ' : ''

  return enviar({
    para: MAIL_ADMIN,
    asunto: `${prefijo}Nuevo pedido #${pedido.numero} — ${pedido.comuna} — ${formatearPrecio(pedido.total)}`,
    html: plantilla({
      titulo: `Pedido #${pedido.numero}`,
      preencabezado: `${pedido.comuna} · ${formatearPrecio(pedido.total)} · ${pedido.nombre}`,
      contenido,
    }),
    texto,
    responderA: pedido.email,
  })
}
