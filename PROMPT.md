# Prompt para Claude Code

Abre una terminal en esta carpeta (`Landing-LCDE`), escribe `claude` y pega todo lo que está
entre las líneas.

---

Vas a construir, de principio a fin y en una sola sesión de trabajo, la landing page de venta
de **La Casa del Estratega**, una tienda chilena de ajedrez.

Todo el contexto que necesitas ya está en este repositorio. Antes de escribir una sola línea
de código, lee en este orden y completos:

1. `CLAUDE.md`
2. `docs/01-negocio.md`
3. `docs/02-catalogo.md`
4. `docs/03-marca-y-estilo.md`
5. `docs/04-logistica.md`
6. `docs/05-arquitectura.md`
7. `docs/06-seguridad.md`
8. `docs/07-copy-y-contenido.md`
9. `docs/08-entrega.md`
10. `public/productos/README.md`

Esos documentos son la fuente de verdad. No los contradigas y no reemplaces sus datos por
supuestos tuyos.

**Qué tienes que construir**, en resumen: una landing de una sola página, en español de Chile,
mobile-first, visualmente atractiva y cálida (paleta terracota/beige, tipografía block),
que venda 5 productos de ajedrez con checkout real de **Mercado Pago Checkout Pro**, guarde
cada pedido en **Supabase**, le mande un correo a la dueña del negocio y al comprador, y
tenga un panel de administración simple donde el dueño vea a quién le tiene que ir a entregar,
agrupado por comuna. Stack: Next.js App Router + TypeScript + Tailwind, desplegable en Vercel
sobre el dominio `lacasadelestratega.cl`.

**Cómo quiero que trabajes:**

- Toma todo el tiempo y todos los recursos que necesites. No optimices por rapidez ni por
  ahorrar pasos. Prefiero que trabajes tres horas y quede bien.
- Trabaja de corrido, sin pedirme confirmaciones intermedias. Cuando una decisión menor sea
  ambigua, elige la opción razonable, anótala en una línea en `DECISIONES.md` y sigue.
- Detente a preguntarme **solo** si falta una credencial o un dato del negocio que no puedes
  generar ni deducir. No me preguntes por decisiones de diseño ni de implementación.
- Empieza haciendo un plan de trabajo con tu lista de tareas y ve marcándolas. Quiero poder
  ver el avance.
- Antes de implementar Mercado Pago y Supabase, **consulta la documentación oficial vigente**
  con WebFetch (developers.mercadopago.cl y supabase.com/docs). No te fíes de tu memoria para
  la firma exacta de las APIs, especialmente para la validación de la firma del webhook.
- La seguridad de `docs/06-seguridad.md` no es opcional. Los precios se calculan siempre en el
  servidor, los secretos nunca llegan al navegador, el webhook valida firma y es idempotente,
  y el panel está protegido. Al final corre el checklist de verificación completo y escribe el
  resultado en `docs/09-verificacion.md`.
- No inventes estadísticas sobre los beneficios del ajedrez. Usa exclusivamente los datos
  verificados de `docs/07-copy-y-contenido.md`, con su fuente citada.
- Todavía no hay fotos de los productos. La página tiene que verse bien igual, con
  placeholders elegantes en la paleta de la marca, y tomar las fotos automáticamente desde
  `public/productos/` cuando aparezcan con los nombres definidos en el README de esa carpeta.
- Cuando termines, verifica que `npm run build` y `npx tsc --noEmit` pasen sin errores, y
  levanta el sitio localmente para revisar tú mismo que se ve bien en mobile y en desktop.
- Haz commits en español a medida que avanzas. Ningún secreto en el historial.

**Lo más importante que tienes que dejar escrito para mí:** `PUESTA-EN-MARCHA.md`, la guía
paso a paso para que yo —que no programo— pueda crear las cuentas, pegar las credenciales,
publicar en Vercel y conectar el dominio. Escríbela para alguien que no sabe qué es una
variable de entorno. Su contenido obligatorio está en `docs/08-entrega.md`.

Cuando hayas terminado todo, entrégame un resumen corto de tres cosas: qué quedó funcionando,
qué tengo que hacer yo con mis manos, y qué debería revisar un humano antes de cobrarle
dinero real a alguien.

Empieza ahora.

---

## Después de que Claude Code termine

1. Lee `PUESTA-EN-MARCHA.md` y sigue los pasos en orden.
2. Cuenta el stock real y actualízalo desde el panel (no hace falta tocar código).
3. Saca las fotos de los 5 productos y déjalas en `public/productos/` con los nombres del
   README de esa carpeta.
4. Haz una **compra de prueba con credenciales de test de Mercado Pago** antes de poner las
   credenciales de producción. Confirma que el pedido llegó a Supabase y que te llegó el correo.
5. Haz que un abogado revise los términos y la política de privacidad antes de vender en serio.
