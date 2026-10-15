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

- ~~Las secciones siguen exactamente el orden de `docs/07 §C`: beneficios antes que packs.~~
  Reemplazada en el rediseño: ver abajo.
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
- ~~`apple-touch-icon.png` no existe todavía.~~ Resuelto en el rediseño: ver abajo.

## Rediseño (octubre de 2026, `docs/12-rediseno.md`)

### Estructura

- **Los packs van inmediatamente después del hero**, antes que los beneficios. Es la única
  forma de pasar la prueba de `docs/12 §3` (que las tarjetas asomen en la primera pantalla).
  El resto de las secciones mantiene el orden de `docs/07 §C`.
- **La franja de cobertura con las 9 comunas pasó del hero a justo debajo de las tarjetas.**
  `docs/04` la pedía "cerca del hero", pero dentro de un hero bajo empujaba los productos fuera
  de la pantalla. La barra de anuncio dice "Santiago oriente" desde la primera línea, y las 9
  comunas siguen en la franja, en Cobertura, en la FAQ y en el pie.
- **La barra de anuncio no es sticky.** `docs/10` dice "el encabezado es sticky; nada más es
  sticky en desktop". "Fija" en `docs/12` se leyó como mensaje fijo (sin rotar), no como posición.
- **En celulares angostos la barra de anuncio ocupa dos líneas**, partida justo en el "·" (que
  se esconde). La frase completa no cabe en 390 px a un tamaño legible, y achicarla hasta que
  quepa la volvía ilegible.
- **El logo oscuro no va dentro de la barra de anuncio**, aunque `docs/12 §2` la nombre como
  fondo oscuro: el logo claro está justo debajo, al centro, y repetirlo a 16 px no suma. Sí
  está en la sección de beneficios y en el pie, que ahora es oscuro.
- **Los enlaces del encabezado son "Los packs" y "Por qué ajedrez"** (`docs/12`), no "Para
  regalo" (`docs/10`): manda `docs/12`. En `/jugadores` son "Las medidas" y "Los packs", para no
  mandar a ese público a la sección de beneficios cognitivos.
- **En el celular, la franja de la foto del hero depende de la altura de la pantalla, no del
  ancho** (pedido de Felipe). Se muestra solo con `min-height: 830px`, calibrado midiendo
  (`docs/09`), y tiene un alto tope para que el cálculo valga en cualquier ancho. Cuando no se
  muestra, el `<picture>` entrega un pixel vacío para no gastar datos en una foto invisible.
  Lo mismo si el navegador pide ahorrar datos (`prefers-reduced-data`). El número vive en dos
  lugares (CSS y `ALTO_MINIMO_FRANJA` en `Hero.tsx`), porque una media query no puede leer una
  variable; los dos están comentados apuntando al otro.
- **En el celular, sin foto, el hero no muestra ilustración.** La ilustración del tablero
  empujaba los productos fuera de la pantalla, y las tarjetas que vienen justo debajo ya traen
  la suya. Con `hero.jpg`, la foto aparece como una franja baja arriba del titular.

### Tarjetas y compra directa

- **La compra directa es una página (`/comprar/[id]`), no un panel encima de la portada.** Así
  el botón "atrás" del celular funciona como la gente espera, y el formulario se ve sin scroll
  en desktop. Se pre-genera en el build y se revalida cada 60 s, igual que la portada.
- **La compra directa no toca el carrito.** Lo que se elige ahí no se mezcla con lo que la
  persona haya ido juntando, ni lo borra al pagar.
- **El upsell sigue una regla única** (`src/lib/sugerencia.ts`): si a la compra le falta un
  reloj, se sugiere el reloj; si ya trae uno (Pack IM, Pack GM o el reloj suelto), se sugiere el
  Pack Tradicional. Sugerir un segundo reloj a quien compra el Pack IM no tiene sentido.
- **El umbral de despacho gratis bajó de $40.000 a $39.990** (pedido de Felipe), para que el
  Pack IM califique solo y no reciba un upsell por diez pesos de diferencia. Los textos de la
  página salen de `ENVIO_GRATIS_DESDE` (`src/lib/logistica.ts`) salvo la FAQ y la descripción
  para buscadores, que se actualizaron a mano.
- **Sin selector de cantidad en la compra directa.** Casi nadie compra dos de lo mismo; quien
  quiera, usa el carrito, que sí lo tiene.
- **El carrito sigue accesible desde cada tarjeta** con un enlace discreto bajo el botón ("o
  agrégalo al carrito"), además del ícono del encabezado.
- **Una sola etiqueta por tarjeta**, en este orden de prioridad: Agotado → Últimas N unidades
  → Más elegido. Se quitó "Tope de gama" del Pack GM (`docs/12 §5` solo nombra las otras dos);
  el GM conserva su borde dorado.
- **"Despacho gratis incluido" va junto al precio, no en la fila de etiquetas de arriba.** Se
  calcula con `calcularEnvio()` (la misma función con que cobra el servidor), así que sigue
  sola a `ENVIO_GRATIS_DESDE`: hoy la llevan el Pack IM y el Pack GM. Es un dato del precio, no
  urgencia ni marketing, por eso va con contorno verde y no relleno, y no entra en la regla de
  "una sola etiqueta". Arriba, junto a "Últimas N unidades", se partía en dos líneas en las
  cards angostas y descuadraba los nombres; al lado del precio, en dos líneas cortas, cabe
  incluso en tablet, y la fila del precio tiene el mismo alto en todas las cards para que los
  botones queden alineados. En un producto agotado no se muestra.
- **La edad recomendada va en la misma línea de "qué trae"** ("Tablero y piezas · desde 5
  años"), porque `docs/01` pide mostrarla y `docs/12` no deja espacio para otra línea. En
  `/jugadores` no se muestra.
- **Se quitó el rótulo "Foto real muy pronto"** de las ilustraciones: hacía ver la página a
  medio terminar, y `docs/12` pide que se vea bien hoy.
- **El formulario valida al salir de cada campo** (`docs/10`), pero no marca un campo vacío
  solo porque la persona pasó por él con el tabulador: eso se revisa al enviar.

### Campañas (`?c=`)

- **Las variantes de titular se sirven reescribiendo la URL en el proxy** (`/?c=juntos` →
  `/campana/juntos`), no leyendo `searchParams` en la página. Leer `searchParams` volvía la
  portada dinámica (una consulta a Supabase por visita, sin CDN); así sigue estática, y el
  titular correcto viene en el HTML, sin parpadeo. Las rutas `/campana/*` no se indexan y su
  canónica es `/`.
- **La campaña se recuerda en `sessionStorage`** durante la visita, para que llegue al pedido
  aunque la persona navegue a `/jugadores` o a `/comprar` (donde el `?c=` ya no está). Si llega
  con otro `?c=` válido, gana el último.
- **Sin `?c=` no se guarda nada** (la columna queda `null`), aunque el titular sea el de
  `pantalla`. Así se distingue tráfico de anuncios de tráfico orgánico. Tampoco se asume
  `practico` por entrar a `/jugadores`: se guarda solo si el link lo dice.
- **El servidor acepta solo los cuatro valores conocidos** (Zod, y un `check` en la base).
  Cualquier otro valor hace fallar la petición, igual que cualquier campo desconocido.
- **Si falta la migración 004, el checkout reintenta sin la columna `campana`** y deja un aviso
  en el log. Perder el dato de la campaña es aceptable; perder una venta porque alguien olvidó
  correr un SQL, no.

### `/jugadores`

- **Titular: "Medidas de verdad. Caben en una mochila."** — la idea que pide `docs/12 §7`.
- **Las medidas son exactamente las de `docs/12 §7`.** La frase que las enmarca dice que son
  "el tamaño con que se juega en serio", sin mencionar torneos ni FIDE.
- **El Pack IM lleva la etiqueta "El que más llevan los jugadores"** y va primero, seguido del
  reloj; el Pack CM pierde "Más elegido" en esta página (ese dato es del público de regalo).
  Los otros tres packs se muestran igual, más abajo, para que nadie tenga que volver a la
  portada a buscarlos.
- **Sin las fotos de prueba, la sección de medidas muestra un plano acotado** dibujado en
  CSS, con el rey a escala real respecto del tablero (9,6 / 50).
- **La FAQ de `/jugadores` es un subconjunto de la de `docs/07 §E`** (sin las preguntas sobre
  niños o sobre aprender) más una sobre las medidas, con los números de `docs/12`.

### Logo, íconos y estilos

- **El favicon, el apple-touch-icon y la imagen OG se generan en el build desde
  `public/logo.png`** (convención `icon.tsx` / `apple-icon.tsx` de Next 16). Si se cambia el
  logo, se actualizan solos. Si el archivo faltara, caen al escudo de `public/icono.svg`. El
  apple-touch-icon va sobre fondo crema porque iOS pinta de negro lo transparente.
- **La imagen OG pasó de runtime edge a Node**, porque tiene que leer el logo desde el disco.
- **Se corrigió un error que ya existía:** la regla base de `h1`–`h4` estaba fuera de una capa
  de CSS y le ganaba a las clases de Tailwind v4, así que los títulos de las secciones oscuras
  (beneficios) se pintaban carbón sobre carbón: eran invisibles. Ahora está en `@layer base`.
- **`priority` de `next/image` está obsoleto en Next 16**; las imágenes del hero usan
  `loading="eager"` y `fetchPriority="high"`. Hay una sola imagen de hero para móvil y desktop,
  para que no se descargue dos veces.
- **Los íconos de carrito y WhatsApp están dibujados a mano** con el trazo de las piezas
  (`docs/03`: nada de sets de íconos). El de WhatsApp es un globo con auricular, no el logo
  oficial.
- **`public/Logo_opcion_1.PNG` y `Logo_opcion_2.PNG` no se versionaron.** Son copias idénticas
  de `logo.png` y `logo-oscuro.png`, y todo lo que está en `public/` se publica.
