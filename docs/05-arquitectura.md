# 05 — Arquitectura técnica

## Stack decidido (no lo cambies sin una razón fuerte y anotada en DECISIONES.md)

| Capa | Elección |
|---|---|
| Framework | **Next.js (App Router)** + TypeScript, modo estricto |
| Estilos | **Tailwind CSS** con los tokens de `03-marca-y-estilo.md` en `tailwind.config` |
| Pagos | **Mercado Pago — Checkout Pro** (redirección al checkout de MP) |
| Base de datos | **Supabase** (Postgres) |
| Correo | **Resend** (dominio `lacasadelestratega.cl`) |
| Hosting | **Vercel** |
| Validación | **Zod** en todos los endpoints |

Sin CMS, sin Prisma, sin librería de estado global, sin librería de componentes pesada.
Es una landing de 5 productos: mantenla liviana.

> Antes de escribir la integración de Mercado Pago y de Supabase, **consulta la documentación
> oficial vigente** (WebFetch a developers.mercadopago.cl y supabase.com/docs). Las APIs
> cambian y este documento describe la intención, no la firma exacta de cada método.

## Estructura de rutas

```
/                          Landing completa (una sola página, secciones ancladas)
/carrito                   (opcional) o carrito como panel lateral en la misma página
/pago/exito                Retorno OK de Mercado Pago
/pago/pendiente            Retorno pendiente
/pago/error                Retorno rechazado
/terminos                  Términos y condiciones
/privacidad                Política de privacidad
/admin                     Login del panel
/admin/pedidos             Panel de pedidos y stock (protegido)

/api/checkout              POST — crea la preferencia de Mercado Pago
/api/webhooks/mercadopago  POST — recibe la notificación de pago
/api/admin/*               Endpoints del panel (protegidos)
```

## Flujo de compra (implementar exactamente así)

1. El usuario arma su carrito en el cliente (estado local, sin persistir datos sensibles).
2. Llena el formulario de entrega (datos de `04-logistica.md`).
3. `POST /api/checkout` con `{ items: [{id, cantidad}], cliente: {...}, consentimientos: {...} }`.
   **Nunca precios.**
4. El servidor:
   a. Valida el payload con Zod (incluida la comuna contra la lista blanca).
   b. Aplica rate limiting y revisa el honeypot.
   c. Recalcula precios desde el catálogo server-side y el costo de envío.
   d. Verifica stock disponible en Supabase (sin descontar todavía).
   e. Crea el pedido en Supabase con estado `pendiente` y un `id` UUID propio.
   f. Crea la preferencia en Mercado Pago con `external_reference = id del pedido`,
      `notification_url` apuntando al webhook, y las `back_urls` de éxito/pendiente/error.
   g. Devuelve al cliente **solo** el `init_point` de Mercado Pago.
5. El cliente redirige a Mercado Pago. **Los datos de tarjeta jamás pasan por nuestro dominio.**
6. Mercado Pago llama a `POST /api/webhooks/mercadopago`. El servidor:
   a. **Valida la firma `x-signature`** (HMAC con el secreto del webhook). Si no valida → 401.
   b. Consulta la API de Mercado Pago por el `payment_id` para conocer el estado real.
      **Nunca confía en el body de la notificación como fuente de verdad.**
   c. Si `status === 'approved'`: en una transacción atómica marca el pedido como `pagado`,
      guarda el `payment_id`, y descuenta el stock. Idempotente: si el pedido ya estaba
      `pagado`, responde 200 y no hace nada más (MP reintenta).
   d. Si el stock ya no alcanza → estado `pagado_sin_stock` + correo de alerta a Felipe.
   e. Envía el correo de confirmación al comprador y el correo de aviso a
      `fcarvallo@lacasadelestratega.cl`.
   f. Responde 200 rápido. Nada que tarde debe bloquear la respuesta.
7. El usuario vuelve a `/pago/exito`. Esa página **no** confirma el pago por sí sola: consulta
   el estado del pedido en el servidor. Si aún está pendiente, muestra "estamos confirmando
   tu pago" y hace polling suave.

## Esquema de base de datos (Supabase)

```sql
-- productos
id            text primary key          -- 'tradicional' | 'cm' | 'im' | 'gm' | 'reloj'
nombre        text not null
precio        integer not null          -- CLP, entero
stock         integer not null default 0
activo        boolean not null default true
orden         integer not null default 0
actualizado_en timestamptz default now()

-- pedidos
id                uuid primary key default gen_random_uuid()
numero            bigserial                -- número corto legible para Felipe
estado            text not null default 'pendiente'
                  -- pendiente | pagado | pagado_sin_stock | entregado | cancelado | rechazado
nombre            text not null
email             text not null
telefono          text not null
comuna            text not null
direccion         text not null
depto             text
referencia        text
horario_preferido text
es_regalo         boolean default false
mensaje_regalo    text
subtotal          integer not null
costo_envio       integer not null
total             integer not null
mp_preference_id  text
mp_payment_id     text unique              -- unique: garantiza idempotencia
acepta_terminos   boolean not null
acepta_marketing  boolean not null default false
creado_en         timestamptz default now()
pagado_en         timestamptz
entregado_en      timestamptz
notas_internas    text

-- pedido_items
id           uuid primary key default gen_random_uuid()
pedido_id    uuid references pedidos(id) on delete cascade
producto_id  text not null
nombre       text not null       -- snapshot del nombre al momento de la compra
precio_unit  integer not null    -- snapshot del precio: el histórico no debe cambiar
cantidad     integer not null
```

Índices: `pedidos(estado)`, `pedidos(comuna)`, `pedidos(creado_en desc)`, `pedido_items(pedido_id)`.

**RLS activado en las tres tablas, sin ninguna política que permita acceso anónimo.**
Todo el acceso ocurre server-side con la `service_role key`. Los productos se leen desde el
servidor (Server Components), no desde el navegador.

Descuento de stock atómico: hazlo con una función Postgres (`rpc`) que actualice
`stock = stock - cantidad where id = $1 and stock >= cantidad`, y verifica filas afectadas.
No leas-y-luego-escribas desde Node.

## Variables de entorno

Crea `.env.example` versionado (sin valores) y `.env.local` ignorado por git.

```
# Mercado Pago
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
NEXT_PUBLIC_MP_PUBLIC_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Correo
RESEND_API_KEY=
MAIL_FROM="La Casa del Estratega <pedidos@lacasadelestratega.cl>"
MAIL_ADMIN=fcarvallo@lacasadelestratega.cl

# Admin
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

# Analítica (opcional, la página funciona sin ellos)
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Sitio
NEXT_PUBLIC_SITE_URL=https://lacasadelestratega.cl
```

Regla: si una variable opcional falta, la página **no debe romperse**; simplemente no se
carga esa funcionalidad. Si falta una obligatoria, falla al arrancar con un mensaje claro
(valida el entorno con Zod en un módulo `src/lib/env.ts`).

## Analítica y píxeles

- Meta Pixel y GA4 se cargan **solo si existe el ID** en el entorno, y solo después de que
  el usuario acepte cookies (banner simple; ver `06-seguridad.md`).
- Eventos a disparar: `ViewContent` (ver producto), `AddToCart`, `InitiateCheckout`,
  `Purchase` (en `/pago/exito`, con el valor real del pedido leído del servidor).
- Usa `next/script` con `strategy="afterInteractive"`.

## Rendimiento (objetivo)

- Lighthouse mobile ≥ 90 en Performance, Accessibility, Best Practices y SEO.
- LCP < 2.5s en 4G simulado. Imágenes con `next/image`, formato AVIF/WebP, `priority` solo
  en la imagen del hero.
- Sin librerías de animación pesadas. CSS + IntersectionObserver bastan.

## SEO y metadatos

- `metadata` de Next con título, descripción, `openGraph` e imagen OG 1200×630 generada
  (puede ser con `next/og`).
- `lang="es-CL"`.
- JSON-LD: `Organization`, `LocalBusiness` (con `areaServed` = las 9 comunas) y `Product`
  con `offers` por cada SKU.
- `robots.txt` y `sitemap.xml`. `/admin` con `noindex`.
- `favicon` y `apple-touch-icon` a partir del escudo (si no hay logo disponible, genera un
  placeholder con la inicial y la paleta, y déjalo anotado como pendiente).
