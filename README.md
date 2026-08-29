# La Casa del Estratega — landing de venta

Landing de una sola página con checkout real de Mercado Pago para una tienda chilena de
ajedrez. Cinco productos, despacho propio a nueve comunas de Santiago, y un panel para que el
dueño vea a quién le tiene que ir a entregar.

> **¿No programas?** Este archivo no es para ti. Anda directo a
> **[`PUESTA-EN-MARCHA.md`](PUESTA-EN-MARCHA.md)**, que está escrito paso a paso.

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript estricto |
| Estilos | Tailwind CSS v4, tokens de marca en `@theme` |
| Pagos | Mercado Pago Checkout Pro (API REST directa, sin SDK) |
| Base de datos | Supabase (Postgres) con RLS |
| Correo | Resend |
| Hosting | Vercel |
| Validación | Zod en el 100 % de los endpoints |

Siete dependencias directas en total. Cero librerías de estado, de animación o de componentes.

## Instalación local

Necesitas Node.js 20 o superior.

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev                  # http://localhost:3000
```

Para conseguir cada valor de `.env.local`, sigue `PUESTA-EN-MARCHA.md`.

Para revisar el diseño sin cuentas reales, basta con inventar valores: la landing se ve
completa, aunque el checkout y el panel no funcionen.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | TypeScript sin emitir nada |
| `npm run fotos` | Regenera el índice de fotos de `public/productos/` |
| `node scripts/verificar-seguridad.mjs` | Corre el checklist de seguridad contra el servidor local |

## Estructura

```
src/
  app/
    page.tsx                      La landing completa
    terminos/ privacidad/         Legales
    pago/exito|pendiente|error/   Retorno de Mercado Pago
    admin/                        Login y panel de pedidos
    api/
      checkout/                   Crea pedido + preferencia de pago
      webhooks/mercadopago/       Confirma el pago
      pedido/[id]/                Estado de un pedido (para la página de retorno)
      admin/                      Login, acciones y exportación CSV
    og/                           Imagen para compartir, generada
  components/
    secciones/                    Las secciones de la landing
    admin/                        Panel
    Piezas.tsx                    Piezas de ajedrez en SVG
  lib/
    catalogo.ts                   FUENTE DE VERDAD de los precios
    precios.ts                    Cálculo de totales y despacho
    logistica.ts                  Las 9 comunas y las reglas de envío
    validacion.ts                 Esquemas de Zod
    mercadopago.ts                Preferencias y validación de la firma del webhook
    datos.ts                      Acceso a Supabase
    correo.ts                     Correos transaccionales
    sesion.ts                     Cookie firmada del panel
    env.ts                        Contrato del entorno, validado con Zod
  proxy.ts                        Protección del panel + CSP con nonce
supabase/migrations/              SQL para pegar en el editor de Supabase
scripts/                          Escaneo de fotos y verificación de seguridad
docs/                             Contexto del proyecto (fuente de verdad)
```

## Las cuatro reglas que no se rompen

1. **Los precios se calculan en el servidor.** El cliente manda `id` y `cantidad`, nunca un
   precio. `calcularTotales()` solo acepta esos dos campos, y el esquema de Zod es `.strict()`,
   así que un `precio` en el cuerpo hace fallar la petición en vez de ignorarse.
2. **Ningún secreto llega al navegador.** `env.ts`, `supabase.ts`, `mercadopago.ts` y
   `correo.ts` importan `server-only`: importarlos desde un componente cliente rompe el build.
3. **El webhook valida la firma y es idempotente.** HMAC-SHA256 sobre el manifiesto oficial de
   Mercado Pago; después consulta la API por el estado real, nunca confía en el cuerpo de la
   notificación. La confirmación ocurre dentro de una transacción de Postgres con `for update`
   y un índice único sobre `mp_payment_id`.
4. **El stock se descuenta solo cuando el pago está confirmado**, de forma atómica, dentro de
   `confirmar_pago()`. Al crear la preferencia se valida disponibilidad pero no se descuenta.

El detalle completo y el resultado de las pruebas está en
[`docs/09-verificacion.md`](docs/09-verificacion.md).

## Cambios que se hacen sin tocar lógica

| Qué quieres cambiar | Dónde |
|---|---|
| Precios, nombres, edades de los productos | `src/lib/catalogo.ts` |
| Stock | El panel en `/admin/pedidos` (no el código) |
| Comunas, costo de envío, umbral de envío gratis | `src/lib/logistica.ts` |
| WhatsApp, correo, Instagram | `src/lib/negocio.ts` |
| Textos de beneficios, FAQ, datos curiosos | `src/lib/contenido.ts` |
| Colores y tipografía | `@theme` en `src/app/globals.css` |
| Fotos de producto | Dejarlas en `public/productos/` y hacer push |

> Si cambias un precio en `catalogo.ts`, cambia también el de `supabase/migrations/003_seed.sql`
> para que la base quede coherente. El que se cobra es el del código.

## Documentación

| Archivo | Para quién |
|---|---|
| [`PUESTA-EN-MARCHA.md`](PUESTA-EN-MARCHA.md) | Felipe. Cómo dejar todo funcionando. |
| [`DECISIONES.md`](DECISIONES.md) | Quien retome el código. Qué se decidió y por qué. |
| [`docs/09-verificacion.md`](docs/09-verificacion.md) | Resultado del checklist de seguridad. |
| `docs/01` a `docs/08` | Contexto original del proyecto. Fuente de verdad. |
