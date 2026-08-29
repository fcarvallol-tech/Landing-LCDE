# DECISIONES.md

Decisiones que tomé por mi cuenta al construir la landing, con el motivo.
Ninguna contradice `docs/`; donde hubo ambigüedad, elegí la opción razonable y la anoté acá.

## Stack y versiones

- **Next.js 16 con Tailwind CSS v4** — son las versiones vigentes hoy. Tailwind v4 ya no usa
  `tailwind.config.js`: los tokens de marca van en `@theme` dentro de `src/app/globals.css`.
  Los valores de color son exactamente los de `docs/03-marca-y-estilo.md`; solo cambió dónde
  viven.
- **`src/proxy.ts` en vez de `src/middleware.ts`** — Next.js 16 renombró la convención y avisa
  que `middleware` está obsoleto. Hace exactamente lo mismo.
- **Sin SDK de Mercado Pago** — se habla con la API REST directamente. Son dos llamadas
  (crear preferencia y consultar un pago) y así hay una dependencia menos que auditar, como
  pide `docs/06-seguridad.md §9`.
- **Sin librería de estado ni de animación** — el carrito es un Context de React y las
  animaciones son CSS + IntersectionObserver, como pide `docs/05-arquitectura.md`.

## Precios y catálogo

- **El catálogo del código manda sobre el de la base de datos.** `src/lib/catalogo.ts` es la
  fuente de verdad de los precios; la tabla `productos` de Supabase existe sobre todo para el
  **stock**, que Felipe edita desde el panel. Motivo: un precio en la base es un precio que se
  puede cambiar por accidente desde un panel, y `docs/02-catalogo.md` pide explícitamente que
  el catálogo viva en un solo archivo server-side.
- **El despacho viaja a Mercado Pago como un ítem más**, no como `shipments.cost`. Así la
  persona ve el desglose completo en la pantalla de pago y el total que cobra Mercado Pago
  calza exactamente con el total guardado en el pedido, que es lo que después se compara.

## Base de datos

- **Toda la lógica delicada vive en una función de Postgres** (`confirmar_pago`), no en Node.
  Idempotencia, comparación de montos y descuento de stock ocurren dentro de una sola
  transacción. Es la única forma de garantizar que dos compras simultáneas no vendan la misma
  última unidad.
- **Se agregó el estado `revisar`**, además de los que lista `docs/05-arquitectura.md`. Lo pide
  indirectamente `docs/06-seguridad.md §2`: si el monto pagado no coincide con el del pedido,
  el pedido no se marca como pagado, queda en `revisar` y se le avisa a Felipe.
- **El seed no pisa el stock.** Se puede volver a correr `003_seed.sql` cuantas veces se
  quiera: actualiza nombres y precios, pero nunca el stock que Felipe ya ajustó.

## Seguridad

- **Rate limiting en memoria, no Upstash.** `docs/06-seguridad.md §5` lo permite explícitamente
  para este volumen. Su límite honesto está anotado en `src/lib/limite.ts`: en Vercel cada
  instancia tiene su propio contador. Si algún día hace falta exactitud, se cambia por Redis
  sin tocar a quien lo llama.
- **La IP se lee de `x-vercel-forwarded-for` antes que de `x-forwarded-for`**, porque la
  primera la escribe la plataforma y el cliente no la puede falsificar.
- **CSP arranca en `Report-Only`**, como pide `docs/06-seguridad.md §6`. Se cambia a bloqueante
  con la variable `CSP_MODO=bloqueante`, sin tocar código. El paso a paso está en
  `PUESTA-EN-MARCHA.md`.
- **La contraseña del panel se compara por hash SHA-256 con `timingSafeEqual`**, no en texto
  plano. Comparar los hashes evita que la duración de la comparación filtre siquiera el largo
  de la contraseña real.
- **El honeypot se llama "No completes este campo"** y no "Segundo apellido". Un campo con
  nombre de dato real corre el riesgo de que lo rellene el autocompletado del navegador y deje
  fuera a una persona de verdad.
- **CSRF con doble red**: token de doble envío por sesión *más* verificación de
  `Origin`/`Sec-Fetch-Site`.
- **El CSV escapa las celdas que empiezan con `=`, `+`, `-` o `@`**, para que un nombre
  malicioso no se convierta en una fórmula al abrir el archivo en Excel.

## Diseño

- **Las secciones siguen exactamente el orden de `docs/07-copy-y-contenido.md §C`**: beneficios
  antes que packs. Comercialmente uno pondría los packs primero, pero el documento manda.
- **El titular es "Una hora de ajedrez es una hora que no fue de pantalla"**, elegido de la
  lista autorizada de `docs/07 §D`. No inventé uno nuevo.
- **Las piezas de ajedrez suben de rango junto con el pack**: peón para el Tradicional, alfil
  para el CM, caballo para el IM, rey para el GM. Es la promesa del naming CM→IM→GM dicha sin
  texto, y sirve como ilustración mientras no haya fotos.
- **Las fotos se detectan en el build**, no en cada visita. `scripts/escanear-fotos.mjs` corre
  antes de `next build` y genera `src/lib/fotos-generadas.ts`. Motivo: leer el disco en cada
  render no es fiable en Vercel. Consecuencia práctica para Felipe: subir una foto y hacer push
  la publica sola, que es exactamente lo que pide `docs/08-entrega.md §7`.
- **La landing se revalida cada 60 segundos.** Un cambio de stock desde el panel se ve en la
  página pública dentro del minuto, sin volver a publicar.

## Contenido

- **Los cinco bloques de beneficios y las FAQ están copiados literalmente** de
  `docs/07-copy-y-contenido.md`, con su fuente. No hay ni una cifra que no venga de ahí.
- **Los textos legales están redactados de verdad**, cubriendo la Ley 19.496 y el derecho a
  retracto de 10 días, y ambos terminan con el aviso visible de que los revise un abogado.
- **La fecha de "última actualización" de los legales es la de hoy** (29 de agosto de 2026).
  Hay que cambiarla cuando el abogado los revise.

## Lo que quedó fuera a propósito

- **No hay CAPTCHA.** `docs/06-seguridad.md §5` lo descarta explícitamente.
- **No hay modo oscuro.** `docs/03-marca-y-estilo.md` lo descarta explícitamente.
- **`apple-touch-icon.png` no existe todavía.** El `favicon.svg` sí está, generado con el
  escudo y la paleta. El PNG hay que exportarlo desde el logo real cuando exista
  (`public/logo.png`); mientras tanto los navegadores usan el SVG sin problema.
