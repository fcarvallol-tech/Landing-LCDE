# CLAUDE.md — La Casa del Estratega · Landing de venta

Este archivo es el contexto maestro del proyecto. Léelo completo antes de escribir código.
Los documentos de `docs/` son la fuente de verdad para negocio, marca, catálogo, logística,
arquitectura, seguridad y copy. **No inventes datos que contradigan estos documentos.**

## Qué se está construyendo

Una **landing page de una sola página con checkout real** para *La Casa del Estratega*, una
tienda chilena de productos de ajedrez. Objetivo del negocio: **liquidar el stock actual**.

No es un e-commerce genérico ni un catálogo infinito. Son 5 SKUs, una sola página que
convence y vende, y un panel simple para que el dueño vea a quién le tiene que ir a entregar.

## Índice de documentación

| Documento | Contenido |
|---|---|
| `docs/01-negocio.md` | Negocio, ICP, propuesta de valor, objeciones |
| `docs/02-catalogo.md` | Los 5 productos, precios, stock, reglas de precio |
| `docs/03-marca-y-estilo.md` | Paleta, tipografía, tono, dirección visual |
| `docs/04-logistica.md` | Comunas de cobertura, despacho, reglas de envío |
| `docs/05-arquitectura.md` | Stack, Mercado Pago, Supabase, Vercel, estructura |
| `docs/06-seguridad.md` | Requisitos de ciberseguridad (obligatorios) |
| `docs/07-copy-y-contenido.md` | Textos, beneficios del ajedrez, FAQ, legales |
| `docs/08-entrega.md` | Qué debes entregar y checklist de cierre |

## Reglas no negociables

1. **Precios y stock viven en el servidor.** El cliente nunca envía un precio. El servidor
   calcula el total desde el catálogo server-side. Cualquier otra cosa es un agujero.
2. **Nada de secretos en el bundle del cliente.** Solo `NEXT_PUBLIC_*` es público.
3. **No inventes estadísticas.** Los datos sobre beneficios del ajedrez están en
   `docs/07-copy-y-contenido.md` con su fuente y su redacción exacta. Úsalos tal cual.
   Si necesitas un dato que no está ahí, no lo pongas.
4. **No inventes fotos de producto.** Usa los placeholders descritos en `public/productos/README.md`.
   La página debe verse bien igual cuando la foto todavía no existe.
5. **Solo se despacha a las 9 comunas listadas** en `docs/04-logistica.md`. Esto debe ser
   explícito y visible en la página, no letra chica.
6. **Español de Chile.** Todos los textos visibles, en español neutro-chileno, tuteando.
7. **Trabaja de corrido.** El dueño quiere que hagas lo máximo posible sin preguntar.
   Si hay una decisión menor ambigua, toma la opción razonable, déjala anotada en
   `DECISIONES.md` y sigue. Solo detente si falta una credencial que no puedes generar.

## Contacto y datos reales del negocio

- Dominio: `lacasadelestratega.cl`
- Email institucional: `fcarvallo@lacasadelestratega.cl`
- WhatsApp: `+56 9 6292 3073`
- Instagram: `https://www.instagram.com/lacasadelestratega/`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
