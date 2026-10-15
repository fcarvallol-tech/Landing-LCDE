# 09 — Resultado de la verificación

Checklist de `docs/06-seguridad.md §10`, ejecutado el **29 de agosto de 2026**.

## Cómo leer este documento

Cada punto está marcado con uno de estos tres estados:

- **VERIFICADO** — se ejecutó de verdad y se muestra el resultado.
- **VERIFICADO PARCIALMENTE** — se comprobó lo que se puede comprobar sin credenciales reales;
  queda una parte que solo se puede confirmar en producción.
- **PENDIENTE PARA FELIPE** — requiere Supabase real y credenciales de Mercado Pago. Está en
  `PUESTA-EN-MARCHA.md` paso 7.

**Las pruebas se pueden repetir.** Están en `scripts/verificar-seguridad.mjs`:

```bash
npm run dev                             # en una terminal
node scripts/verificar-seguridad.mjs    # en otra
```

---

## 1. `npm run build` y `npx tsc --noEmit` sin errores

**VERIFICADO.**

```
✓ Compiled successfully
  Running TypeScript ...
  Finished TypeScript in 3.8s
✓ Generating static pages (10/10)
```

`npx tsc --noEmit` termina sin salida (sin errores). TypeScript corre en modo estricto y además
con `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters` y
`noFallthroughCasesInSwitch`.

Las 18 rutas se construyen: la landing (estática, revalidada cada 60 s), los dos legales, las
tres de retorno de pago, el 404, la imagen OG, `robots.txt`, `sitemap.xml`, las dos del panel y
los cinco endpoints de API.

---

## 2. Checkout con un precio manipulado desde el cliente → el servidor lo ignora

**VERIFICADO.** Dos ataques distintos, los dos rechazados:

| Ataque | Resultado |
|---|---|
| `items: [{ id: 'gm', cantidad: 1, precio: 1 }]` | **HTTP 400** |
| `total: 100, costoEnvio: 0` en la raíz del cuerpo | **HTTP 400** |

El esquema de Zod es `.strict()`, así que un campo `precio` o `total` **hace fallar la petición
entera** en vez de ignorarse en silencio. Esto es más fuerte de lo que pide el checklist: no es
que el servidor descarte el precio, es que la petición ni siquiera se considera válida.

Aunque el esquema fuera permisivo, el total se calcula en `calcularTotales()`
(`src/lib/precios.ts`), que **solo recibe `id` y `cantidad`**. No existe una ruta de código por
la que un precio del cliente pueda llegar al monto que se cobra.

---

## 3. Compra hacia una comuna fuera de la lista → 400

**VERIFICADO.** `comuna: 'Puente Alto'` → **HTTP 400**, con el mensaje
*"Elige una de las comunas donde entregamos"*.

Tres capas independientes:

1. En el formulario la comuna es un `<select>` cerrado con solo las 9 comunas.
2. El servidor valida con `z.enum(COMUNAS)`.
3. Las 9 comunas se definen una sola vez, en `src/lib/logistica.ts`.

**Comprobaciones adicionales del mismo endpoint, todas VERIFICADAS:**

| Prueba | Resultado |
|---|---|
| Comprar sin aceptar los términos | HTTP 400 |
| Pedir 999 unidades de un SKU (el tope es 10) | HTTP 400 |
| Honeypot relleno (comportamiento de bot) | HTTP 200 falso, sin crear pedido ni preferencia |
| Formulario enviado en 400 ms (el mínimo es 3 s) | HTTP 400 |
| 7 intentos seguidos desde la misma IP (el tope es 5 / 10 min) | HTTP 429 en el séptimo |

---

## 4. Webhook con firma inválida → 401

**VERIFICADO.** Cuatro escenarios:

| Escenario | Resultado |
|---|---|
| Firma `v1` inventada | **HTTP 401** |
| Sin ninguna cabecera `x-signature` | **HTTP 401** |
| Firma **válida**, calculada con el manifiesto oficial | **No 401** — se acepta y sigue |
| Firma calculada con el manifiesto en otro orden | **HTTP 401** |

La cuarta prueba es la que confirma que la implementación es la correcta y no una que "acepta
cualquier cosa": una firma criptográficamente bien calculada pero sobre un manifiesto mal
armado se rechaza.

El manifiesto usa la plantilla exacta que publica Mercado Pago:

```
id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
```

con `data.id` tomado del *query param* de la URL (no del cuerpo), pasado a minúsculas si viene
en mayúsculas, y omitiendo por completo los trozos ausentes. HMAC-SHA256 en hexadecimal,
comparado con `timingSafeEqual`.

> Fuente consultada durante la implementación:
> <https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/notifications/webhooks>

Extra sobre lo que pide el checklist: se rechazan también las notificaciones con más de 15
minutos de antigüedad, para cortar el reenvío de una notificación legítima capturada.

---

## 5. Webhook duplicado con el mismo `payment_id` → un solo descuento de stock

**VERIFICADO PARCIALMENTE.** La parte que no necesita base de datos está comprobada; la que sí,
queda para la compra de prueba.

Lo que sí está verificado: el webhook con firma válida llega hasta la llamada a
`confirmar_pago()` sin errores de código.

Lo que garantiza la idempotencia, por diseño (`supabase/migrations/002_funciones.sql`):

1. **Un índice único** sobre `pedidos.mp_payment_id`. La base de datos hace imposible que dos
   filas compartan el mismo pago, aunque el código tuviera un error.
2. **`select ... for update`** al principio de `confirmar_pago()`. Dos webhooks simultáneos se
   ponen en fila; el segundo no empieza hasta que el primero termina.
3. **Salida temprana**: si el pedido ya tiene ese `mp_payment_id`, o ya está en estado `pagado`
   / `pagado_sin_stock` / `entregado`, devuelve `ya_procesado` y no toca el stock.
4. **Todo en una sola transacción**: comprobar, comparar el monto y descontar ocurren
   atómicamente. No hay ventana entre leer y escribir.

**PENDIENTE PARA FELIPE**: en `PUESTA-EN-MARCHA.md` paso 7.3 se comprueba que el stock baja
exactamente una unidad tras una compra. Mercado Pago reintenta el webhook si no recibe un 200,
así que el caso duplicado se da solo en producción.

---

## 6. Compra de un producto con `stock = 0` → bloqueada

**VERIFICADO PARCIALMENTE.** Hay cuatro barreras; las dos primeras están verificadas por código
y las dos últimas necesitan la base real.

1. **En la página**: con stock 0 la card sale en gris y el botón está `disabled` con el texto
   "Agotado".
2. **En el carrito**: `agregar()` corta de inmediato si el producto está agotado, y
   `fijarCantidad()` topea la cantidad al stock disponible.
3. **Al crear la preferencia**: `verificarDisponibilidad()` consulta Supabase antes de generar
   el cobro. Si no alcanza, responde **HTTP 409** con el detalle de qué falta, y no se crea
   ninguna preferencia de pago.
4. **Al confirmar el pago**: `descontar_stock()` actualiza con la condición
   `where id = $1 and stock >= cantidad`. Si no alcanza, no actualiza ninguna fila y toda la
   transacción se revierte.

Y si el stock se acaba entre que la persona empieza a pagar y el pago se confirma —que es la
única ventana real—, el pedido queda en estado **`pagado_sin_stock`**, se le manda un correo de
alerta a Felipe y aparece con un aviso rojo arriba del panel. **Nunca se pierde en silencio**,
como exige `docs/02-catalogo.md §6`.

**PENDIENTE PARA FELIPE**: poner un producto en 0 desde el panel y confirmar que no se puede
comprar.

---

## 7. `/admin/pedidos` sin sesión → redirige al login

**VERIFICADO.** Cuatro pruebas:

| Prueba | Resultado |
|---|---|
| `GET /admin/pedidos` sin cookie | **HTTP 307** → `/admin?error=sesion` |
| `GET /api/admin/csv` sin cookie | **HTTP 401** |
| `POST /api/admin/acciones` cambiando stock, sin cookie | **HTTP 401** |
| `POST /api/admin/entrar` con contraseña incorrecta | **HTTP 401** |

Las páginas redirigen y las APIs devuelven 401: es la distinción correcta.

Sobre el resto de los requisitos de `docs/06-seguridad.md §7`:

- La contraseña se compara con **`crypto.timingSafeEqual`** sobre los hashes SHA-256, nunca con
  `===`. Comparar hashes en vez de textos evita que la duración filtre siquiera el largo de la
  contraseña real.
- La sesión va en **cookie firmada con HMAC-SHA256**, `httpOnly` + `secure` + `sameSite=lax`,
  con expiración de 8 horas incluida dentro de la firma (no se puede extender editando la
  cookie).
- Las mutaciones exigen **token CSRF de doble envío** *más* verificación de
  `Origin`/`Sec-Fetch-Site`.
- Login limitado a **5 intentos cada 15 minutos** por IP.
- `/admin` responde con la cabecera `X-Robots-Tag: noindex, nofollow, noarchive` y está en el
  `disallow` de `robots.txt`.

---

## 8. `grep` del bundle cliente buscando secretos → sin resultados

**VERIFICADO.** Se escanearon los 18 archivos JS y CSS que se sirven al navegador
(`.next/static`), buscando tanto los nombres de las variables como los **valores literales** que
había cargados en `.env.local` durante el build:

```
LIMPIO   service_role
LIMPIO   SUPABASE_SERVICE_ROLE_KEY
LIMPIO   MP_ACCESS_TOKEN
LIMPIO   MP_WEBHOOK_SECRET
LIMPIO   ADMIN_PASSWORD
LIMPIO   ADMIN_SESSION_SECRET
LIMPIO   RESEND_API_KEY
LIMPIO   (los cinco valores literales de prueba)
```

Buscar los valores además de los nombres es lo que hace la prueba útil: un secreto filtrado
aparecería como su valor, no como el nombre de su variable.

La garantía estructural es que `src/lib/env.ts`, `src/lib/supabase.ts`, `src/lib/mercadopago.ts`
y `src/lib/correo.ts` importan **`server-only`**: si alguien intenta importarlos desde un
componente cliente, **el build falla**. No depende de que nadie se equivoque.

**Historial de git**: también revisado. Nunca se versionó un `.env` con valores. `.env.example`
sí está versionado, pero todas sus claves están vacías; las únicas coincidencias con palabras
como `service_role` o `APP_USR-` son **texto explicativo de los comentarios**, no valores.

---

## 9. Lighthouse mobile ≥ 90 en las cuatro categorías

**PENDIENTE PARA FELIPE.** No se pudo ejecutar: no hay navegador disponible en el entorno donde
se construyó el proyecto. Hay que correrlo sobre el sitio ya publicado.

Cómo hacerlo: abre `https://lacasadelestratega.cl` en Chrome → clic derecho → **Inspeccionar**
→ pestaña **Lighthouse** → modo **Mobile** → **Analyze page load**.

Lo que sí está hecho para llegar a esos números:

- **Cero JavaScript de terceros por defecto.** Meta y GA solo se cargan si hay ID configurado
  *y* la persona aceptó cookies.
- **Fuentes autohospedadas** con `next/font`: ninguna petición a Google en tiempo de ejecución.
- **Sin librerías de animación.** Todo es CSS + un `IntersectionObserver`.
- **Sin imágenes pesadas** mientras no haya fotos: las ilustraciones son SVG inline de menos de
  1 KB cada una. Cuando lleguen las fotos, `next/image` las sirve en AVIF/WebP.
- **La landing es estática** (revalidada cada 60 s), así que llega desde el CDN.
- Accesibilidad: `lang="es-CL"`, jerarquía de encabezados correcta (un `h1`, luego `h2`), foco
  visible en todo, targets táctiles de 44 px, `alt` real en las imágenes, formularios con
  `<label>` asociado y errores con `role="alert"`.
- SEO: metadatos completos, OpenGraph con imagen generada, JSON-LD de `Organization`,
  `LocalBusiness` (con las 9 comunas como `areaServed`), `FAQPage` y un `Product` con su
  `offer` por cada SKU, `robots.txt` y `sitemap.xml`.

---

## 10. Navegación completa del flujo de compra solo con teclado

**VERIFICADO POR CONSTRUCCIÓN**, sin navegador para confirmarlo visualmente.

Lo que está implementado:

- **Enlace "Saltar al contenido"** como primer elemento enfocable de la página.
- **Foco visible siempre**: `outline: 3px solid var(--color-dorado)` con `offset: 2px` en todo
  elemento interactivo. En ningún lugar se quita el outline sin reemplazarlo.
- **El carrito es un diálogo modal de verdad**: `role="dialog"`, `aria-modal="true"`, el foco
  entra al panel al abrirse, el tabulador queda **atrapado dentro** (adelante y atrás con
  Shift+Tab), cierra con **Escape** y **devuelve el foco a donde estaba** al cerrarse.
- **Todos los controles son elementos nativos**: `<button>`, `<input>`, `<select>`,
  `<details>`. No hay ni un `div` haciendo de botón.
- **Al enviar el formulario con errores, el foco salta al primer campo con problema.**
- **La FAQ usa `<details>`/`<summary>` nativos**: accesible de fábrica.
- **Los cambios dinámicos se anuncian**: la barra de despacho gratis, los avisos del carrito y
  los errores usan `aria-live` / `role="alert"` / `role="status"`.
- **Targets táctiles de 44×44 px mínimo** en todos los botones y campos.

**PENDIENTE PARA FELIPE**: recorrer la compra completa usando solo Tab, Shift+Tab, Enter,
Espacio y Escape, sin tocar el mouse. Es una prueba de dos minutos y vale la pena hacerla.

---

## Extra: cabeceras de seguridad

**VERIFICADO.** Todas presentes en la respuesta:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()
Content-Security-Policy-Report-Only: ... (con nonce por petición)
```

La CSP incluye `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`,
`form-action 'self' https://*.mercadopago.com https://*.mercadolibre.com` y
`upgrade-insecure-requests`, y usa un **nonce distinto en cada petición**, generado en
`src/proxy.ts`.

Arranca en `Report-Only` tal como pide `docs/06-seguridad.md §6`. Se pasa a bloqueante con
`CSP_MODO=bloqueante`, sin tocar código (instrucciones en `PUESTA-EN-MARCHA.md` paso 8).

---

## Extra: dependencias

**VERIFICADO.** `npm audit`:

```
found 0 vulnerabilities
```

El proyecto tiene **7 dependencias directas**: `next`, `react`, `react-dom`,
`@supabase/supabase-js`, `resend`, `zod` y `server-only`. Nada más. `package-lock.json` está
versionado con las versiones fijadas.

---

## Resumen

| # | Punto del checklist | Estado |
|---|---|---|
| 1 | Build y typecheck sin errores | **VERIFICADO** |
| 2 | Precio manipulado desde el cliente | **VERIFICADO** |
| 3 | Comuna fuera de la lista | **VERIFICADO** |
| 4 | Webhook con firma inválida | **VERIFICADO** |
| 5 | Webhook duplicado | **PARCIAL** — falta la compra de prueba |
| 6 | Compra con stock 0 | **PARCIAL** — falta la compra de prueba |
| 7 | Panel sin sesión | **VERIFICADO** |
| 8 | Secretos en el bundle cliente | **VERIFICADO** |
| 9 | Lighthouse mobile ≥ 90 | **PENDIENTE** — requiere el sitio publicado |
| 10 | Navegación con teclado | **VERIFICADO POR CONSTRUCCIÓN** |
| + | Cabeceras de seguridad y CSP | **VERIFICADO** |
| + | `npm audit` | **VERIFICADO** — 0 vulnerabilidades |

**17 de 17 comprobaciones ejecutables pasaron.**

Las tres pendientes (5, 6 y 9) no se pueden resolver sin credenciales reales ni un navegador, y
están todas cubiertas por el paso 7 de `PUESTA-EN-MARCHA.md`. **La compra de prueba con
credenciales `TEST-` de Mercado Pago no es opcional**: es lo que cierra este checklist.

---

## Rediseño — verificación del 6 de octubre de 2026

Después de aplicar `docs/12-rediseno.md`:

- **`npm run build` y `npx tsc --noEmit`**: sin errores. 21 páginas generadas, entre ellas
  `/jugadores`, las cinco `/comprar/[id]` y las dos variantes `/campana/juntos` y
  `/campana/pensar`.
- **`scripts/verificar-seguridad.mjs`**: **17 de 17** comprobaciones pasan, igual que antes.
  Precio inyectado → 400, comuna fuera de cobertura → 400, webhook con firma inválida → 401,
  panel sin sesión → redirige / 401, cabeceras y CSP presentes.
- **Campaña en el checkout**: `"campana": "juntos"` pasa la validación; `"campana": "hackeo"`
  → **HTTP 400**. El cuerpo que manda el navegador sigue sin llevar ni un precio: solo ids,
  cantidades, datos de entrega y la campaña.
- **Prueba del hero** (navegador headless, sin hacer scroll), borde superior de la primera
  tarjeta respecto del alto de la ventana:

  | Ventana | `/` | `/?c=juntos` | `/?c=pensar` |
  |---|---|---|---|
  | 375 × 667 | 606 / 667 ✓ | 606 / 667 ✓ | 606 / 667 ✓ |
  | 390 × 664 | 608 / 664 ✓ | 608 / 664 ✓ | 608 / 664 ✓ |
  | 1280 × 720 | 583 / 720 ✓ | 583 / 720 ✓ | 583 / 720 ✓ |
  | 1440 × 900 | 584 / 900 ✓ | 584 / 900 ✓ | 584 / 900 ✓ |

- **Compra directa recorrida de punta a punta**: "Lo quiero" del Pack CM → `/comprar/cm` →
  "Súmale el reloj y te llevas el despacho gratis" → Agregar → la barra marca "Despacho gratis
  conseguido" y el total queda en $54.980 → formulario → envío. Con la base de datos falsa de
  local, el servidor responde 503 al verificar stock, que es lo esperado.
- Sin desborde horizontal en ninguna de las medidas probadas.

**PENDIENTE PARA FELIPE**: correr `supabase/migrations/004_campana.sql` y hacer una compra de
prueba entrando por `/?c=juntos`; el pedido debe quedar con `campana = 'juntos'`.

---

## Franja del hero según la altura — 15 de octubre de 2026

Con `public/hero.jpg` publicada, la franja de la foto empujaba las tarjetas fuera de la primera
pantalla en los celulares bajos. Ahora la franja (por debajo de 1024 px de ancho) se muestra solo
con `@media (min-height: 830px)`, y tiene un alto tope (`clamp(7.5rem, 40vw, 11rem)`) para que lo
que ocupa dependa de la altura y no del ancho. Cuando está oculta, un `<source>` del `<picture>`
entrega un pixel vacío y el celular no descarga la foto.

**Cómo se calibró el 830.** En cada ventana se midió el borde superior de la primera tarjeta con la
franja forzada a mostrarse: el peor caso es 784 px (390 de ancho). 830 deja al menos 46 px de
tarjeta a la vista cada vez que la franja aparece.

| Ventana | Con la franja forzada | Regla real: franja | Tarjeta | ¿Descarga la foto? |
|---|---|---|---|---|
| 375 × 667 | 776 (no asoma) | oculta | 606 ✓ | no |
| 390 × 664 | 784 (no asoma) | oculta | 608 ✓ | no |
| 360 × 800 | 768 | oculta | 604 ✓ | no |
| 390 × 800 | 784 | oculta | 608 ✓ | no |
| 375 × 812 | 776 | oculta | 606 ✓ | no |
| 390 × 844 | 784 | visible | 784 ✓ | sí |
| 414 × 896 | 771 | visible | 771 ✓ | sí |
| 430 × 932 | 780 | visible | 780 ✓ | sí |
| 768 × 1024 | 754 | visible | 754 ✓ | sí |
| 820 × 1180 | 736 | visible | 736 ✓ | sí |
| 1024 × 768 (desktop) | 667 | visible (columna derecha) | 667 ✓ | sí |
| 1280 × 720 (desktop) | 583 | visible (columna derecha) | 583 ✓ | sí |
| 1440 × 900 (desktop) | 584 | visible (columna derecha) | 584 ✓ | sí |

En ninguna ventana fallan las dos cosas a la vez: o se ve la foto y asoman las tarjetas, o no se
ve la foto y asoman las tarjetas.

**No verificado:** `prefers-reduced-data` (el navegador de pruebas no lo puede simular y casi
ningún navegador lo soporta hoy). Tampoco se probó en un iPhone real: Safari muestra y esconde
sus barras, y conviene confirmar en el teléfono que la franja aparece cuando hay espacio.
