# 06 — Seguridad (requisitos obligatorios)

Esta página maneja dinero y datos personales de familias, incluidas direcciones donde viven
niños. El estándar es alto. Todo lo de esta lista es obligatorio, no opcional.

## 1. Secretos

- Ninguna clave privada en el bundle del cliente. Solo `NEXT_PUBLIC_*` cruza al navegador,
  y ahí solo van la public key de Mercado Pago, la URL de Supabase y los IDs de píxeles.
- `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `RESEND_API_KEY`,
  `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` son **exclusivamente server-side**.
- `.env*` en `.gitignore` salvo `.env.example`. Verifica que no quede ningún secreto en el
  historial de git antes de cerrar.
- Valida el entorno al arranque con Zod. Falla ruidosamente si falta algo crítico.

## 2. Integridad de precios y stock

- El servidor recalcula **siempre** subtotal, envío y total desde el catálogo y desde Supabase.
- Cualquier campo `precio`, `total` o `envio` que venga del cliente se **ignora**, no se valida.
- Cantidades: entero, mínimo 1, máximo 10 por SKU. Máximo 20 ítems por pedido.
- El monto que se envía a Mercado Pago es el calculado por el servidor y queda guardado en el
  pedido; al confirmar el pago se **compara** el monto pagado con el monto del pedido. Si no
  coinciden, no se marca como pagado: se marca `revisar` y se avisa a Felipe.

## 3. Webhook de Mercado Pago

- Validar la firma `x-signature` / `x-request-id` con `MP_WEBHOOK_SECRET` (HMAC SHA-256,
  según el manifiesto que documenta Mercado Pago). Firma inválida → **401, sin procesar**.
- Después de validar la firma, **consultar la API de MP** por el `payment_id`. El estado real
  viene de esa consulta, nunca del cuerpo de la notificación.
- **Idempotencia**: `mp_payment_id` con constraint `unique`. Si ya existe, responder 200 y salir.
- Responder en menos de 22 segundos. El trabajo lento (correos) no debe bloquear el 200.
- El endpoint del webhook queda fuera de cualquier middleware de autenticación, pero **con**
  rate limiting.

## 4. Validación de entrada

- **Zod en el 100% de los endpoints**, sobre el body ya parseado, con `.strict()` para
  rechazar campos desconocidos.
- Comuna: `z.enum([...las 9 comunas])`. No hay texto libre.
- Email: validación de formato + longitud máxima 254.
- Teléfono: normalizar y validar formato chileno móvil.
- Campos de texto libre (dirección, referencia, mensaje de regalo): longitud máxima estricta
  y sanitización. Nunca renderizar con `dangerouslySetInnerHTML`.
- En los correos HTML, **escapar** todo dato del usuario. Un nombre con `<script>` no puede
  llegar vivo al inbox de Felipe.

## 5. Anti-abuso

- **Rate limiting** en `/api/checkout` (p. ej. 5 intentos / 10 min por IP), en el webhook y en
  el login de admin (5 intentos / 15 min, con backoff). Usa Upstash Redis si hay credenciales;
  si no, un limitador en memoria con `Map` documentado como suficiente para este volumen.
- **Honeypot**: un campo oculto (`aria-hidden`, fuera de pantalla, `tabindex=-1`,
  `autocomplete=off`) que los bots llenan. Si viene con contenido → 200 falso, sin crear pedido.
- **Time trap**: si el formulario se envía en menos de 3 segundos desde que se montó, rechazar.
- No uses CAPTCHA en esta versión: mata la conversión y no hace falta a este volumen.

## 6. Cabeceras de seguridad

En `next.config.js`, para todas las rutas:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: (ver abajo)
```

CSP: partir en `Content-Security-Policy-Report-Only`, verificar en consola que no rompe nada
(Mercado Pago, Meta Pixel, GA), y **recién ahí** pasar a modo bloqueante. Usar nonce para los
scripts inline en vez de `unsafe-inline`. Como mínimo:
`default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://*.mercadopago.com https://*.mercadolibre.com; object-src 'none'; upgrade-insecure-requests`

Autohospedar las fuentes con `next/font` evita tener que abrir la CSP a Google Fonts.

## 7. Panel de administración

- No es público. Login con `ADMIN_PASSWORD` comparada en **tiempo constante**
  (`crypto.timingSafeEqual`), nunca con `===`.
- Sesión en **cookie firmada** (`httpOnly`, `secure`, `sameSite=lax`, expiración 8 horas).
  Nada de guardar la contraseña ni un token en `localStorage`.
- Middleware que protege `/admin/*` y `/api/admin/*`.
- Todas las mutaciones del panel (marcar entregado, editar stock) requieren **POST** con
  protección CSRF (token por sesión o verificación de `Origin`/`Sec-Fetch-Site`).
- `noindex, nofollow` en `/admin`.
- El panel no muestra ni almacena datos de tarjeta. No existen en nuestra base.

## 8. Datos personales (Chile)

- No almacenamos datos de tarjeta, jamás. Mercado Pago los procesa en su dominio.
  Decirlo explícitamente en la página: refuerza la confianza y es cierto.
- Política de privacidad real: qué se recoge, para qué, cuánto tiempo se guarda, con quién se
  comparte (Mercado Pago como procesador de pago), y cómo ejercer derechos de acceso,
  rectificación y eliminación escribiendo a `fcarvallo@lacasadelestratega.cl`.
- El opt-in de marketing es un checkbox **separado y no premarcado**. Aceptar los términos y
  aceptar publicidad son dos cosas distintas.
- Banner de cookies simple: los píxeles de Meta y GA **no se cargan hasta que se acepta**.
  La preferencia se guarda en `localStorage` y se puede cambiar después.
- Minimiza logs: nunca loguear direcciones, teléfonos ni emails completos en producción.
  Si necesitas trazabilidad, loguea el `numero` del pedido.

## 9. Dependencias

- `npm audit` sin vulnerabilidades altas o críticas al cerrar.
- Sin dependencias innecesarias. Cada paquete es superficie de ataque.
- Versiones fijadas en `package-lock.json`, commiteado.

## 10. Verificación antes de dar por terminado

Ejecuta y deja constancia en `docs/09-verificacion.md`:

1. `npm run build` y `npx tsc --noEmit` sin errores.
2. Intento de checkout con un precio manipulado desde el cliente → el servidor lo ignora.
3. Intento de comprar una comuna fuera de la lista → 400.
4. Webhook con firma inválida → 401.
5. Webhook duplicado con el mismo `payment_id` → un solo descuento de stock.
6. Compra de un producto con `stock = 0` → bloqueada.
7. `/admin/pedidos` sin sesión → redirige al login.
8. `grep` del bundle cliente buscando `service_role`, `ACCESS_TOKEN`, `SECRET` → sin resultados.
9. Lighthouse mobile ≥ 90 en las cuatro categorías.
10. Navegación completa del flujo de compra solo con teclado.
