# 12 — Rediseño: lista de cambios a aplicar

Este documento manda sobre los demás donde haya contradicción. Describe los cambios
concretos que hay que hacerle a la página que ya existe. No es un rediseño desde cero:
el checkout, el webhook, Supabase, el panel y los legales **se mantienen tal cual**.

Contexto de las decisiones: `docs/10-referencias-ux.md`.

---

## 1. Encabezado

**Hoy:** logo a la izquierda, cuatro enlaces al centro, botón "Carrito" con marco a la
derecha — el elemento más prominente de toda la página.

**Cambios:**

- **Barra de anuncio** arriba de todo, fondo carbón, texto crema, una línea:
  `Despacho gratis sobre $40.000 · Entrega personal en Santiago oriente`
  Fija, sin rotación, sin cuenta regresiva, sin botón de cerrar.
- **Logo al centro.** Es el patrón de deathwishcoffee.com que pidió Felipe por nombre.
  A la izquierda: `Los packs` y `Por qué ajedrez` (solo dos; eliminar `Despacho` y
  `Preguntas` del encabezado, siguen alcanzables por scroll).
  A la derecha: ícono de carrito y ícono de WhatsApp.
- **El carrito deja de ser un botón con marco.** Pasa a ser un ícono discreto con un
  contador que solo aparece cuando hay algo dentro. Para una visita nueva el carrito
  siempre está vacío: no puede ser el elemento más llamativo de la pantalla.
- En móvil: logo centrado, y a la derecha los dos íconos. Nada más.

## 2. Logo real

- Los dos archivos de logo **ya existen** en `public/`, 2250x2250 PNG con fondo
  transparente (solo el circulo es solido):
  - `public/logo.png` — yelmo cafe sobre circulo beige. Para fondos CLAROS:
    encabezado, favicon, apple-touch-icon, imagen OG.
  - `public/logo-oscuro.png` — yelmo crema sobre circulo cafe. Para fondos OSCUROS:
    la seccion de beneficios, el pie de pagina y la barra de anuncio.
- Elegir el archivo segun el fondo donde se pinta. Nunca poner el claro sobre oscuro.
- Si algun archivo faltara, caer al escudo dibujado actual **sin romper nada**.
- Mismo tratamiento para `favicon` y `apple-touch-icon`.
- El logo del encabezado, a unos 40px de alto en desktop y 32px en móvil.

## 3. Hero

**Hoy:** ocupa la pantalla completa. Hay que hacer scroll a ciegas para descubrir que la
página vende algo.

**Cambios:**

- Reducir la altura para que **el borde superior de las tarjetas de producto asome** en
  la primera pantalla, tanto en móvil como en desktop. Esa es la prueba: si al cargar no
  se intuye que hay productos abajo, el hero sigue siendo muy alto.
- Bajar el tamaño del titular un escalón.
- **Un solo botón primario**: `Ver los packs`. El secundario (`Por qué el ajedrez`) pasa
  a ser un enlace de texto, no un botón con marco.
- Cuando exista `public/hero.jpg`, usarla en lugar del tablero ilustrado. Mientras no
  exista, mantener la ilustración.
- Bajo el botón, un **enlace discreto de texto**:
  `¿Compras para ti? Mira el tablero por dentro →` hacia `/jugadores`.
  Enlace, no botón: no compite con el CTA principal.

## 4. Compra directa (el cambio más importante)

**Hoy:** ver pack → agregar al carrito → abrir panel → llenar formulario → pagar.
Cuatro puntos donde la gente se cae, para una tienda donde casi nadie compra dos cosas.

**Cambios:**

- El botón de cada tarjeta dice **`Lo quiero`** y lleva **directo a la pantalla de
  compra** con ese pack ya seleccionado y el formulario de entrega a la vista.
- En esa misma pantalla, el upsell: la barra de progreso hacia los $40.000 y un bloque
  `Súmale el reloj y te llevas el despacho gratis` con un botón para agregarlo sin salir.
- El carrito **sigue existiendo** para quien quiera sumar varias cosas, pero deja de ser
  el camino obligatorio.
- Al llegar desde el botón de una tarjeta, el formulario debe estar visible sin scroll
  adicional en desktop, y a un scroll corto en móvil.

## 5. Tarjetas de producto

Orden exacto, de arriba abajo: foto cuadrada → etiqueta (`Más elegido` / `Últimas N
unidades`) → nombre → qué trae en una línea → precio grande → botón `Lo quiero`.

- Las cinco fotos con el mismo tratamiento. Mientras no existan, la ilustración actual.
- Precio con `font-variant-numeric: tabular-nums`, peso alto, bien legible.
- Nada de párrafos de venta dentro de la tarjeta.

## 6. Variantes de titular por campaña

- Leer el parámetro `?c=` de la URL y elegir el titular del hero según su valor:
  - `pantalla` → *Una hora de ajedrez es una hora que no fue de pantalla.* **(por defecto)**
  - `juntos` → *El mejor regalo para tu hijo eres tú, sentado al frente.*
  - `pensar` → *Que aprenda a pensar dos jugadas más adelante.*
  - `practico` → se usa solo en `/jugadores`
- Valor desconocido o ausente → `pantalla`.
- Guardar el valor en el pedido, en una columna nueva `campana` de la tabla `pedidos`,
  con su migración correspondiente. Sirve para saber después qué ángulo trajo compras.
- Esto **no es un test A/B**: es coherencia entre el anuncio y la página.

## 7. Página `/jugadores`

Página nueva, mismo sistema visual, mismo checkout, mismo stock.

- **Público:** gente que ya sabe jugar y compra por practicidad. **No** son competidores
  de club. Nada de contenido infantil ni de beneficios cognitivos: eso los espanta.
- **Titular** en torno a la idea de medidas de verdad que caben en una mochila.
- **Las medidas, como argumento central y con números:**
  - Tablero de 50 × 50 cm, casillas de 5,8 cm
  - Rey de 9,6 cm
  - Superficie de goma tipo mousepad, piezas de plástico
  - Se enrolla
  Enmarcarlas como **prueba de que no es un juguete**, no como requisito de torneo.
- Destacar el **Pack IM** (juego + reloj), que es el que más compra este público, y el
  reloj suelto.
- Usar `public/jugando-adulto.jpg` y `public/medidas.jpg` cuando existan.
- `noindex` no: esta página sí se indexa, con sus propios metadatos.

## 8. Fotos

Tomar automáticamente desde `public/productos/` y `public/` los archivos descritos en
`docs/11-fotografia.md`. Cada imagen que no exista cae a la ilustración actual, sin
romper la página y sin dejar huecos.

## 9. Lo que NO se toca

- Cálculo de precios en el servidor
- Webhook de Mercado Pago, firma e idempotencia
- Esquema de Supabase (salvo agregar la columna `campana`)
- Panel de administración
- Páginas legales
- Todos los requisitos de `docs/06-seguridad.md` siguen vigentes
