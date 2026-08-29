# 03 — Marca, paleta y dirección visual

## Identidad

Escudo con yelmo de caballero medieval. Naming de packs por títulos de ajedrez.
Registro visual: **cálido, terroso, artesanal, con peso**. Nada de gradientes morados de SaaS,
nada de neón, nada de "startup". Piensa en cuero, madera, papel grueso, tinta.

## Paleta (usar estos valores exactos como tokens CSS)

```css
:root {
  /* Base */
  --lcde-crema:        #FAF3E8; /* fondo principal */
  --lcde-beige:        #F0E1CB; /* fondo de secciones alternas, cards */
  --lcde-beige-borde:  #DFC9AC; /* bordes suaves */

  /* Marca */
  --lcde-terracota:       #A8452C; /* color principal: botones, acentos, links */
  --lcde-terracota-osc:   #7C2F1D; /* hover / pressed */
  --lcde-rojo:            #C1121F; /* acento de urgencia: badges, "últimas unidades" */
  --lcde-dorado:          #C08A2E; /* premium: Pack GM, detalles, líneas divisorias */

  /* Tinta */
  --lcde-carbon:       #1E1A17; /* texto principal y fondos oscuros */
  --lcde-marron:       #3D2F26; /* texto secundario sobre claro */
  --lcde-gris:         #7A6A5C; /* texto terciario, captions */

  /* Estado */
  --lcde-exito:        #2F6B4F;
  --lcde-error:        #B02A1F;
}
```

### Cómo usarla

- Fondo general: `--lcde-crema`. Secciones alternas en `--lcde-beige` para dar ritmo.
- **Una sección oscura** (fondo `--lcde-carbon`, texto crema) para la zona de beneficios del
  ajedrez o para la franja de despacho. El contraste es lo que hace que la página no se vea plana.
- Botones primarios: fondo `--lcde-terracota`, texto crema, radio 8px, sin sombra difusa;
  sombra dura tipo offset (`box-shadow: 3px 3px 0 var(--lcde-carbon)`) para el look "block".
- El dorado se reserva para el Pack GM y detalles. Si el dorado está en todas partes, deja de
  significar algo.
- El rojo solo para urgencia real (stock bajo). Nunca para decorar.

### Modo oscuro

No implementar toggle. La página es una landing de venta con una identidad cálida definida;
un modo oscuro a medias la empeora. Fija `color-scheme: light` y pinta explícitamente los
fondos para que ningún navegador la invierta.

## Tipografía (Google Fonts)

- **Títulos / display**: `Archivo Black` — bold, condensada, "block letter", pega con el
  escudo. Alternativa si algo falla: `Anton`.
- **Cuerpo**: `Inter` — legible, neutra, no compite.
- **Precios y números**: `Inter` con `font-variant-numeric: tabular-nums` y peso 700.

Escala tipográfica sugerida (mobile → desktop):
`h1 2.5rem → 4.5rem`, `h2 1.875rem → 3rem`, `h3 1.25rem → 1.75rem`, `body 1rem → 1.0625rem`.
Interlineado del cuerpo 1.65. Ancho máximo de párrafo 68 caracteres.

Cargar las fuentes con `next/font/google` (autohospedadas, sin request a Google en runtime:
mejor performance y mejor para la CSP).

## Textura y detalle

- Un **grano/ruido sutil** de fondo (SVG feTurbulence inline, opacidad ~3%) le da la calidez
  de papel. Sutil de verdad.
- Motivo de **patrón de tablero** (cuadros) usable como separador de secciones o como marca de
  agua muy tenue. No como fondo completo.
- Iconografía: piezas de ajedrez en SVG inline, trazo grueso, mismo peso visual que la
  tipografía. Nada de sets de iconos genéricos de librería.
- Bordes: 1px `--lcde-beige-borde` en cards claras; en la sección oscura, borde `#3A322B`.

## Movimiento

Discreto y funcional:
- Fade-up de secciones al entrar en viewport (`IntersectionObserver`, 400ms, ease-out, una vez).
- Hover de cards: elevación mínima (translateY -2px) + intensificación de la sombra dura.
- **Respetar `prefers-reduced-motion: reduce`** y desactivar todo lo anterior.
- Nada de parallax, nada de carruseles automáticos, nada de contadores animados.

## Accesibilidad (obligatorio)

- Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande). Verificar terracota sobre crema
  y crema sobre carbón.
- Foco visible en todo elemento interactivo (`outline: 3px solid var(--lcde-dorado); outline-offset: 2px`).
- Todo `img` con `alt` descriptivo real.
- Formularios con `<label>` asociado, `autocomplete` correcto, errores anunciados con `aria-live`.
- Navegable completa con teclado, incluido el carrito/checkout.
- Targets táctiles mínimo 44×44px.

## Mobile first

La campaña es de Instagram: **la mayoría del tráfico va a llegar desde el celular**.
Diseña primero para 390px de ancho. El botón de compra debe estar siempre a un gesto de
distancia (barra sticky inferior en mobile con precio + "Comprar").
