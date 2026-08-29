# Puesta en marcha

Guía para dejar la página funcionando y cobrando de verdad.

**Está escrita para ti, que no programas.** No hace falta que entiendas el código. Vas a crear
cuatro cuentas, copiar unos textos largos de un lado a otro, y publicar. Nada más.

Tómate una tarde. No es difícil, pero sí hay que hacerlo en orden.

---

## Antes de empezar: dos palabras que vas a leer mucho

**Variable de entorno.** Es un dato secreto que la página necesita para funcionar —como la
llave de tu casa— pero que no puede estar escrito dentro del código, porque el código lo puede
leer cualquiera. En vez de eso, se guarda aparte, en un panel privado. Tú vas a copiar esas
llaves de un sitio y pegarlas en otro. Eso es todo lo que vas a hacer en los pasos 1 a 5.

**Cada variable tiene un nombre y un valor.** El nombre es fijo, siempre igual, en MAYÚSCULAS
(por ejemplo `MP_ACCESS_TOKEN`). El valor es el texto largo que copias. Cuando esta guía diga
"pega esto en `MP_ACCESS_TOKEN`", significa: busca la casilla que se llama así y pega ahí.

> ### ⚠ La regla más importante de todo este documento
>
> Los valores que vas a copiar son **contraseñas de tu negocio**. Con algunos de ellos, alguien
> podría vaciarte la cuenta o leer las direcciones de todos tus clientes.
>
> - **Nunca** los mandes por WhatsApp, correo, ni se los pegues a nadie en un chat.
> - **Nunca** los pegues en un archivo dentro de la carpeta del proyecto que no sea
>   `.env.local`.
> - Si alguna vez crees que uno se filtró, entra al sitio donde lo sacaste y genera uno nuevo.
>   Todos se pueden regenerar.

Ten a mano un **gestor de contraseñas** (el de tu navegador sirve) o un documento privado para
ir guardando los valores mientras los juntas.

---

## Índice

1. [Crear el proyecto en Supabase](#paso-1-crear-el-proyecto-en-supabase) — la base de datos
2. [Correr las migraciones](#paso-2-correr-las-migraciones) — crear las tablas
3. [Cuenta de Mercado Pago](#paso-3-cuenta-de-mercado-pago) — para poder cobrar
4. [Resend](#paso-4-resend) — para que salgan los correos
5. [Publicar en Vercel](#paso-5-publicar-en-vercel) — poner la página en internet
6. [Conectar el dominio](#paso-6-conectar-tu-dominio)
7. [La compra de prueba](#paso-7-la-compra-de-prueba-no-te-la-saltes) — **no te la saltes**
8. [Pasar a producción](#paso-8-pasar-a-producción-cobrar-de-verdad)
9. [Usar el panel día a día](#paso-9-usar-el-panel-día-a-día)
10. [Subir las fotos de los productos](#paso-10-subir-las-fotos-de-los-productos)
11. [Meta Pixel y Google Analytics](#paso-11-meta-pixel-y-google-analytics-opcional) (opcional)
12. [Qué falta y qué revisar con un humano](#paso-12-qué-falta-y-qué-tiene-que-revisar-un-humano)

---

## Paso 1: Crear el proyecto en Supabase

Supabase es donde se van a guardar tus pedidos. Es gratis para el volumen que vas a tener.

1. Entra a **<https://supabase.com>** y haz clic en **Start your project**.
2. Crea una cuenta (lo más simple es entrar con tu cuenta de GitHub o de Google).
3. Haz clic en **New project**.
4. Rellena:
   - **Name**: `lacasadelestratega`
   - **Database Password**: haz clic en **Generate a password** y **guárdala** en tu gestor de
     contraseñas. No la vas a necesitar para esta guía, pero si algún día la pierdes es un
     problema.
   - **Region**: elige **South America (São Paulo)**. Es la más cercana a Chile y por eso la
     página va a ir más rápida.
5. Haz clic en **Create new project** y espera unos dos minutos mientras se crea.

### Ahora saca los dos datos que necesitas

En el menú de la izquierda, abajo del todo, haz clic en el engranaje **Project Settings**, y
después en **API** (o **API Keys**, según la versión que te toque).

Vas a ver algo así:

- **Project URL** — algo como `https://abcdefghijklm.supabase.co`
  → este es el valor de **`NEXT_PUBLIC_SUPABASE_URL`**. Cópialo.

- **Project API keys** → busca la que dice **`service_role`** y **`secret`**.
  Está tapada; haz clic en **Reveal** para verla. Es un texto larguísimo que empieza con `eyJ`.
  → este es el valor de **`SUPABASE_SERVICE_ROLE_KEY`**. Cópialo.

> ### 🔴 Sobre la `service_role key`
>
> **Esta es la llave maestra de tu base de datos.** Quien la tenga puede leer, cambiar y borrar
> absolutamente todos tus pedidos, con los nombres, teléfonos y direcciones de tus clientes.
>
> No se la des a nadie. Nunca. Ni a un amigo que te está ayudando, ni pegada en un chat.
> Solo se pega en dos lugares: tu archivo `.env.local` en tu computador, y el panel de Vercel.
>
> Justo al lado vas a ver otra clave, la **`anon` / publishable**. Esa sí es pública y no pasa
> nada si se ve. **Esta página no la usa**: todo el acceso a la base pasa por el servidor.

---

## Paso 2: Correr las migraciones

"Correr las migraciones" suena técnico pero es literalmente: copiar tres textos y apretar un
botón. Estos textos crean las tablas donde se van a guardar tus productos y tus pedidos.

En Supabase, en el menú de la izquierda, busca el ícono **SQL Editor**.

Vas a hacer lo mismo tres veces, **en este orden exacto**:

### 2.1 — Crear las tablas

1. Haz clic en **New query**.
2. En tu computador, abre el archivo `supabase/migrations/001_esquema.sql` de esta carpeta
   (ábrelo con cualquier editor de texto, o con TextEdit).
3. Selecciona **todo** el contenido (Cmd+A) y cópialo (Cmd+C).
4. Pégalo en el recuadro grande de Supabase.
5. Haz clic en **Run** (o Cmd+Enter).
6. Abajo tiene que aparecer **Success. No rows returned**. Eso está bien: significa que
   funcionó.

### 2.2 — Crear las funciones de stock

Lo mismo, pero con el archivo `supabase/migrations/002_funciones.sql`.
Otra vez: **New query** → pegar → **Run** → *Success*.

### 2.3 — Cargar los cinco productos

Lo mismo con `supabase/migrations/003_seed.sql`.

Esta vez, para comprobar que quedó todo bien, abre una **New query** más y pega esto:

```sql
select id, nombre, precio, stock from productos order by orden;
```

Tienes que ver tus cinco productos:

| id | nombre | precio | stock |
|---|---|---|---|
| tradicional | Pack Tradicional | 15990 | 20 |
| cm | Pack CM · Candidato a Maestro | 29990 | 15 |
| im | Pack IM · Maestro Internacional | 39990 | 10 |
| gm | Pack GM · Gran Maestro | 49990 | 6 |
| reloj | Reloj de ajedrez | 24990 | 12 |

> ⚠ **Ese stock es inventado.** Son números de partida para que la página funcione desde el
> primer minuto. Cuenta tus cajas de verdad y corrígelo desde el panel (paso 9). No hace falta
> volver a tocar Supabase nunca más.

---

## Paso 3: Cuenta de Mercado Pago

Acá hay algo que tienes que entender antes de tocar nada, porque es donde más gente se
equivoca.

> ### Credenciales de prueba vs. credenciales de producción
>
> Mercado Pago te da **dos juegos de llaves**:
>
> - **Prueba** (empiezan con `TEST-`): sirven para simular compras con tarjetas falsas. **No
>   mueven dinero real.** Son para probar que todo funciona.
> - **Producción** (empiezan con `APP_USR-`): son las de verdad. Cobran plata de verdad a
>   personas de verdad.
>
> **Vas a empezar con las de prueba.** Primero verificas que todo funcione, y recién entonces
> cambias a las de producción. Es un solo cambio en Vercel, toma dos minutos.

### 3.1 — Crear la aplicación

1. Entra a **<https://www.mercadopago.cl/developers/panel>** con tu cuenta de Mercado Pago
   (la misma con la que recibes plata hoy).
2. Haz clic en **Tus integraciones** → **Crear aplicación**.
3. Rellena:
   - **Nombre**: `La Casa del Estratega`
   - **¿Qué producto estás integrando?**: elige **Pagos online**.
   - **¿Estás usando una plataforma de e-commerce?**: **No**.
   - **¿Qué tipo de solución?**: **Checkout Pro**.
4. Créala.

### 3.2 — Copiar las credenciales de PRUEBA

Dentro de tu aplicación, en el menú de la izquierda, haz clic en **Credenciales de prueba**.

- **Public Key** → valor de **`NEXT_PUBLIC_MP_PUBLIC_KEY`**
- **Access Token** → valor de **`MP_ACCESS_TOKEN`**

Cópialos. Fíjate que empiecen con `TEST-`.

> El **Access Token** es secreto: con él se pueden crear cobros a tu nombre. La **Public Key**
> no lo es, está hecha para ir en el navegador.

### 3.3 — Configurar el webhook

El webhook es cómo Mercado Pago le avisa a tu página que alguien pagó. Sin esto, los pedidos
se quedan para siempre en "pendiente" aunque la persona haya pagado.

1. En tu aplicación, menú de la izquierda: **Webhooks** → **Configurar notificación**.
2. En **Modo productivo**, en el campo de la URL, pega exactamente esto:

   ```
   https://lacasadelestratega.cl/api/webhooks/mercadopago
   ```

3. Más abajo, en la lista de eventos, marca **Pagos** (`payment`).
   Puedes dejar el resto sin marcar.
4. Haz clic en **Guardar configuración**.
5. Ahora aparece una **clave secreta**. Haz clic en **Revelar clave secreta** y cópiala.
   → este es el valor de **`MP_WEBHOOK_SECRET`**.

> **Para qué sirve esa clave secreta:** cualquiera en internet podría enviarle un mensaje a tu
> página diciendo "hola, el pedido 5 ya está pagado" e intentar llevarse un pack gratis. Con
> esta clave, tu página comprueba matemáticamente que el mensaje viene de Mercado Pago de
> verdad. Los que no cuadran se rechazan sin siquiera mirarlos.

**Todavía no vas a poder guardar la URL si el dominio no existe.** Si te da error, sáltate este
sub-paso, vuelve después del paso 6 (cuando la página ya esté publicada) y hazlo entonces.

---

## Paso 4: Resend

Resend es lo que hace que salgan los correos: la confirmación al comprador y el aviso a ti.

La página **funciona igual sin esto** —los pedidos se guardan y los ves en el panel—, pero sin
correos el comprador se queda sin confirmación y tú tienes que acordarte de mirar el panel. Vale
la pena hacerlo.

1. Entra a **<https://resend.com>** y crea una cuenta.
2. Ve a **Domains** → **Add Domain**.
3. Escribe `lacasadelestratega.cl` y confirma.
4. Resend te va a mostrar una lista de **registros DNS**: unas filas con `Type`, `Name` y
   `Value`. Se ven raras, pero solo hay que copiarlas.

### Dónde pegar esos registros DNS

Los registros DNS se ponen donde **compraste el dominio** (NIC Chile, GoDaddy, Hostinger,
Namecheap… el sitio donde pagaste `lacasadelestratega.cl`).

1. Entra a ese sitio y busca la sección **DNS**, **Zona DNS** o **Administrar DNS**.
2. Por cada fila que te mostró Resend, crea un registro nuevo copiando **exactamente** el tipo,
   el nombre y el valor.
3. Guarda.
4. Vuelve a Resend y haz clic en **Verify DNS Records**.

> Puede tardar entre 10 minutos y unas horas en verificarse. Es normal. Anda a hacer otra cosa
> y vuelve más tarde. Si después de 24 horas sigue sin verificarse, revisa que no hayas dejado
> un espacio de más al copiar y pegar.

### Sacar la API key

5. Cuando el dominio aparezca como **Verified**, ve a **API Keys** → **Create API Key**.
   - **Name**: `landing-lcde`
   - **Permission**: **Sending access**
   - **Domain**: `lacasadelestratega.cl`
6. Copia la clave que aparece. Empieza con `re_`.
   → este es el valor de **`RESEND_API_KEY`**.

> **Solo se muestra una vez.** Si la cierras sin copiarla, tienes que crear otra. No pasa nada
> si eso ocurre.

---

## Paso 5: Publicar en Vercel

Vercel es donde va a vivir la página. Gratis para este tamaño.

### 5.1 — Subir el código a GitHub

Si el proyecto todavía no está en GitHub:

1. Crea una cuenta en **<https://github.com>**.
2. Crea un repositorio nuevo: botón **New**, nombre `landing-lcde`, y márcalo como
   **Private**.
3. GitHub te va a mostrar unos comandos. Ábrelos en la terminal, dentro de esta carpeta, y
   pégalos.

> Si esto te supera, es el único punto de toda la guía donde conviene que te ayude alguien que
> haya usado GitHub antes. Son cinco minutos.

### 5.2 — Importar el proyecto en Vercel

1. Entra a **<https://vercel.com>** y crea una cuenta **con GitHub** (importante: con GitHub, no
   con correo, así ve tus repositorios).
2. **Add New** → **Project**.
3. Busca `landing-lcde` en la lista y haz clic en **Import**.
4. **NO le des a Deploy todavía.** Primero las variables.

### 5.3 — Pegar las variables de entorno

En la misma pantalla, despliega la sección **Environment Variables**. Vas a agregar las de esta
lista, una por una: escribes el nombre en la casilla izquierda (**Key**), pegas el valor en la
derecha (**Value**), y le das a **Add**.

**Estas son obligatorias. Sin ellas la página no funciona:**

| Nombre (Key) | Valor (Value) | De dónde salió |
|---|---|---|
| `MP_ACCESS_TOKEN` | el que empieza con `TEST-` | Paso 3.2 |
| `MP_WEBHOOK_SECRET` | la clave secreta del webhook | Paso 3.3 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://....supabase.co` | Paso 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | el texto largo que empieza con `eyJ` | Paso 1 |
| `ADMIN_PASSWORD` | **invéntala tú** — ver abajo | — |
| `ADMIN_SESSION_SECRET` | **invéntala tú** — ver abajo | — |
| `NEXT_PUBLIC_SITE_URL` | `https://lacasadelestratega.cl` | — |

**Estas son opcionales. Si las dejas fuera, la página funciona igual:**

| Nombre (Key) | Valor (Value) | Qué pasa si falta |
|---|---|---|
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | la Public Key de prueba | Nada, es informativa |
| `RESEND_API_KEY` | la que empieza con `re_` | No se envían correos |
| `MAIL_FROM` | `La Casa del Estratega <pedidos@lacasadelestratega.cl>` | Se usa este mismo por defecto |
| `MAIL_ADMIN` | `fcarvallo@lacasadelestratega.cl` | Se usa este mismo por defecto |
| `NEXT_PUBLIC_META_PIXEL_ID` | tu ID de Meta | No se carga el píxel |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | tu ID de Google Analytics | No se carga GA |
| `CSP_MODO` | `report-only` | Se usa `report-only` por defecto |

#### Las dos contraseñas que tienes que inventar

**`ADMIN_PASSWORD`** — es la contraseña con la que TÚ vas a entrar al panel de pedidos.
Invéntala, mínimo 12 caracteres, y guárdala en tu gestor de contraseñas. Ejemplo del estilo que
sirve: `Caballo-Rey-2026-Ñuñoa`. No uses una que ya uses en otro sitio.

**`ADMIN_SESSION_SECRET`** — es un texto largo y aleatorio que usa el sistema para firmar tu
sesión. **No la vas a escribir nunca.** Solo tiene que ser larga (mínimo 32 caracteres) y al
azar.

Para generarla, abre la app **Terminal** de tu Mac y pega esto:

```
openssl rand -base64 48
```

Te va a escupir un texto raro tipo `k3Jd8...==`. Ese es el valor. Cópialo tal cual, con los
signos `=` del final incluidos.

*(Si prefieres no abrir la terminal: aporrea el teclado hasta pasar los 40 caracteres mezclando
mayúsculas, minúsculas y números. Funciona igual.)*

### 5.4 — Publicar

Haz clic en **Deploy** y espera uno o dos minutos.

Cuando termine, Vercel te da una dirección tipo `landing-lcde-xxxx.vercel.app`. Ábrela: ahí está
tu página. Todavía no en tu dominio, pero ya está viva en internet.

---

## Paso 6: Conectar tu dominio

1. En Vercel, dentro de tu proyecto: **Settings** → **Domains**.
2. Escribe `lacasadelestratega.cl` y haz clic en **Add**.
3. Agrega también `www.lacasadelestratega.cl` (Vercel lo redirige solo al principal).
4. Vercel te muestra unos registros DNS. Son parecidos a los de Resend: unas filas con tipo,
   nombre y valor.
5. Ve al sitio donde compraste el dominio, a la misma sección DNS del paso 4, y crea esos
   registros.

Normalmente son dos:

| Tipo | Nombre | Valor |
|---|---|---|
| `A` | `@` | la dirección IP que te dé Vercel |
| `CNAME` | `www` | `cname.vercel-dns.com` |

> Copia siempre lo que te muestre Vercel, no lo que dice esta tabla: pueden cambiar.

6. Guarda y espera. Puede tardar entre 10 minutos y unas horas. Vercel te va a mostrar un
   check verde cuando esté listo, y se encarga solo del certificado de seguridad (el candado
   del navegador).

7. **Ahora vuelve al paso 3.3** y termina de configurar el webhook de Mercado Pago, ahora que
   la URL ya existe.

---

## Paso 7: La compra de prueba (no te la saltes)

Esto es lo que separa "la página se ve bonita" de "la página cobra bien". Hazlo completo.

Estás todavía con las credenciales `TEST-`, así que **no se mueve plata real**.

### 7.1 — Haz la compra

1. Abre `https://lacasadelestratega.cl` desde el **celular** (es como va a llegar la mayoría de
   tu tráfico).
2. Agrega un pack al carrito. Comprueba que la barra de "te faltan $X para el despacho gratis"
   se mueve al agregar cosas.
3. Continúa, llena tus datos reales (usa tu correo de verdad, así ves si llega el mail).
4. Dale a **Pagar con Mercado Pago**.
5. En la pantalla de Mercado Pago, paga con una **tarjeta de prueba**:

   | Tarjeta | Número | Código | Vencimiento |
   |---|---|---|---|
   | Mastercard | `5416 7526 0258 2580` | `123` | `11/30` |
   | Visa | `4168 8188 4444 7115` | `123` | `11/30` |

   Y en los datos del titular, para que el pago salga **aprobado**:
   - **Nombre**: `APRO`
   - **Documento**: tipo "Otro", número `123456789`

   *(Si quieres probar un pago rechazado, usa `OTHE` en vez de `APRO`.)*

### 7.2 — Comprueba las cuatro cosas

Después de pagar tienes que verificar **todas** estas:

- [ ] **Vuelves a la página** y dice "Listo. Tu pedido está confirmado" con un número de pedido.
      Si se queda pegado en "estamos confirmando tu pago", el webhook no está funcionando: revisa
      el paso 3.3.
- [ ] **Te llegó el correo** de confirmación al comprador (revisa spam la primera vez).
- [ ] **Te llegó el correo** de aviso a `fcarvallo@lacasadelestratega.cl`, con la comuna en el
      asunto.
- [ ] **El pedido está en el panel**: entra a `https://lacasadelestratega.cl/admin`, pon tu
      `ADMIN_PASSWORD`, y comprueba que aparece agrupado por su comuna.

### 7.3 — Comprueba que el stock bajó

En Supabase → **SQL Editor**, corre otra vez:

```sql
select id, nombre, stock from productos order by orden;
```

El producto que compraste tiene que tener **una unidad menos**. Si bajó, significa que toda la
cadena funciona.

### 7.4 — Limpia el pedido de prueba

Cuando termines de probar, borra los pedidos falsos y devuelve el stock. En el SQL Editor:

```sql
-- Primero mira lo que vas a borrar:
select numero, nombre, comuna, total, estado from pedidos order by creado_en;

-- Cuando estés seguro, borra TODOS los pedidos de prueba:
delete from pedidos;

-- Y deja el stock en el número real que contaste:
update productos set stock = 20 where id = 'tradicional';
update productos set stock = 15 where id = 'cm';
update productos set stock = 10 where id = 'im';
update productos set stock = 6  where id = 'gm';
update productos set stock = 12 where id = 'reloj';
```

> El `delete from pedidos` borra **todos** los pedidos. Hazlo solo ahora, antes de tener
> clientes de verdad. Después de esto, nunca más.

---

## Paso 8: Pasar a producción (cobrar de verdad)

Ya probaste que todo funciona. Ahora las llaves reales.

1. Vuelve a **<https://www.mercadopago.cl/developers/panel>** → tu aplicación →
   **Credenciales de producción**.
2. Puede que te pida completar unos datos de tu negocio antes de dártelas. Complétalos.
3. Copia el **Access Token** de producción (empieza con `APP_USR-`) y la **Public Key** de
   producción.
4. Ve a **Vercel** → tu proyecto → **Settings** → **Environment Variables**.
5. Busca `MP_ACCESS_TOKEN`, haz clic en los tres puntitos → **Edit**, y reemplaza el valor
   `TEST-...` por el `APP_USR-...`. Guarda.
6. Haz lo mismo con `NEXT_PUBLIC_MP_PUBLIC_KEY`.
7. **Importante**: ve a la pestaña **Deployments**, busca el de más arriba, tres puntitos →
   **Redeploy**. Las variables nuevas solo se aplican al volver a publicar.

### Activar la protección extra del navegador

La página trae una protección llamada CSP que arranca en modo "solo avisar", para no romper
nada mientras configuras. Cuando lleves unos días funcionando bien:

1. Abre tu página en Chrome, haz clic derecho → **Inspeccionar** → pestaña **Console**.
2. Navega por la página completa: agrega al carrito, entra al checkout, vuelve.
3. Si **no** ves mensajes rojos que digan "Content Security Policy", ya puedes activarla:
   en Vercel, cambia `CSP_MODO` de `report-only` a `bloqueante` y vuelve a publicar.

> Si aparecen avisos y no sabes qué hacer, **déjala en `report-only`**. La página funciona
> perfecto así; simplemente esa capa extra no está bloqueando.

---

## Paso 9: Usar el panel día a día

Entra a **<https://lacasadelestratega.cl/admin>** y pon tu `ADMIN_PASSWORD`.

La sesión dura 8 horas. Después te vuelve a pedir la contraseña.

### Ver a quién le tienes que entregar

Al entrar ves la vista **Por entregar**: los pedidos pagados, **agrupados por comuna**, para que
armes la ruta del día. De cada uno ves el nombre, la dirección completa, la referencia, qué
lleva y cuánto pagó.

El teléfono es un enlace: haz clic y se abre WhatsApp con esa persona directamente.

### Marcar un pedido como entregado

Cuando entregues, abre el pedido y haz clic en **Marcar como entregado**. Queda con la fecha y
sale de la lista de pendientes. Si te equivocaste, en la vista **Entregados** puedes revertirlo.

### Cambiar el stock

Abajo del todo está la sección **Stock**. Cuenta tus cajas, escribe el número y dale
**Guardar**. La página pública se actualiza sola dentro del minuto.

Qué pasa según el número:

- **0** → el producto sale en gris, con el botón "Agotado". Nadie lo puede comprar.
- **1 a 5** → sale la etiqueta roja "Últimas N unidades".
- **más de 5** → no se muestra ningún número.

### Descargar el CSV

El botón **Descargar CSV** te baja un archivo que abres con Excel o Google Sheets, ya ordenado
por comuna. Sirve para llevar la lista impresa o para hacer cuentas.

### Si aparece un aviso rojo

Arriba de todo puede salir un recuadro rojo. Significa una de dos cosas:

- **"Pagado SIN STOCK"** — alguien pagó justo cuando se acabó el producto. Su plata está
  cobrada. **Contáctalo hoy**: ofrécele otro pack o devuélvele el dinero desde Mercado Pago.
- **"Revisar"** — el monto que se pagó no coincide con el del pedido. No entregues hasta
  entender qué pasó. Revisa ese pago en tu panel de Mercado Pago.

En los dos casos el pedido quedó guardado con todos los datos. Nunca se pierde una venta en
silencio.

---

## Paso 10: Subir las fotos de los productos

Mientras no haya fotos, la página muestra ilustraciones de piezas de ajedrez en los colores de
la marca. Se ve bien, pero **las fotos reales venden mucho más**. Es lo primero que deberías
hacer después de publicar.

### Cómo sacarlas

Lee `public/productos/README.md`, pero en resumen:

- De día, junto a una ventana, **sin flash**.
- **Todas con el mismo fondo** (una pared blanca, un mantel beige). Esto importa más que la
  calidad de la cámara: cinco fotos mediocres con el mismo fondo se ven mucho más profesionales
  que cinco fotos buenas con fondos distintos.
- Encuadre **cuadrado**, con aire alrededor.
- **Muestra todo lo que trae el pack.** Si el Pack CM incluye bolso, el bolso tiene que salir en
  la foto.

### Cómo subirlas

1. Ponlas en la carpeta `public/productos/` con **estos nombres exactos**:

   | Archivo | Producto |
   |---|---|
   | `tradicional.jpg` | Pack Tradicional |
   | `cm.jpg` | Pack CM |
   | `im.jpg` | Pack IM |
   | `gm.jpg` | Pack GM |
   | `reloj.jpg` | Reloj de ajedrez |

2. Si tienes más de una foto de algo, agrégalas como `cm-2.jpg`, `cm-3.jpg`, etc.
3. Haz **commit** y **push** a GitHub.
4. Vercel republica solo. En dos minutos las fotos están en la página, reemplazando las
   ilustraciones. **No hay que tocar nada de código.**

También puedes dejar, en la carpeta `public/`:

- `hero.jpg` — la foto grande del inicio (horizontal, 1600×1000 o más)
- `logo.png` — tu escudo con fondo transparente
- `og.jpg` — la imagen que se ve al compartir el link (1200×630). Si no la pones, se genera una
  sola con la tipografía y los colores de la marca; ya se ve bien.

---

## Paso 11: Meta Pixel y Google Analytics (opcional)

Solo si vas a hacer publicidad. Sin esto la página funciona perfecto.

### Meta Pixel (para anuncios de Instagram y Facebook)

1. Entra a **<https://business.facebook.com/events_manager>**.
2. **Conectar orígenes de datos** → **Web** → dale un nombre.
3. Copia el **ID del píxel**: son unos 15 números.
4. En Vercel, agrégalo como `NEXT_PUBLIC_META_PIXEL_ID` y vuelve a publicar.

### Google Analytics

1. Entra a **<https://analytics.google.com>**, crea una propiedad y un flujo de datos web.
2. Copia el **ID de medición**: tiene la forma `G-XXXXXXXXXX`.
3. En Vercel, agrégalo como `NEXT_PUBLIC_GA_MEASUREMENT_ID` y vuelve a publicar.

> **Importante:** ninguno de los dos se carga hasta que el visitante acepta el banner de
> cookies. Es un requisito legal y está bien implementado. Si nadie acepta, no vas a ver datos
> —eso es lo correcto, no un error.

---

## Paso 12: Qué falta y qué tiene que revisar un humano

### 🔴 Antes de cobrarle a la primera persona de verdad

- [ ] **Un abogado tiene que leer los textos legales.** Las páginas `/terminos` y `/privacidad`
      están redactadas de verdad y cubren la Ley 19.496 y el derecho a retracto de 10 días, pero
      las escribió una máquina. Los dos documentos llevan un aviso visible que lo dice. Cuando
      tu abogado los apruebe, quita ese aviso (está en
      `src/components/AvisoLegal.tsx`) y actualiza la fecha.
- [ ] **Cuenta el stock real.** Los números de partida son inventados.
- [ ] **Haz la compra de prueba completa** del paso 7. Entera, sin saltarte pasos.
- [ ] **Comprueba que el webhook está bien configurado.** Es la pieza más importante: si falla,
      la gente paga y sus pedidos se quedan en "pendiente" para siempre.
- [ ] **Confirma que sabes emitir la boleta.** La página promete al comprador que le enviarás la
      boleta con la confirmación. Ese trámite no lo hace la página: lo haces tú desde el SII o
      desde tu sistema de facturación.

### 🟡 Lo primero que deberías hacer después

- [ ] **Las fotos de los cinco productos.** Es lo que más va a mover tus ventas.
- [ ] Tu **logo real** en `public/logo.png`. Mientras tanto se usa un escudo dibujado que se ve
      bien pero no es el tuyo.
- [ ] Guarda todas las llaves en un **gestor de contraseñas**, no en un papel ni en un chat.

### 🟢 Cuando tengas tiempo

- [ ] Activar la CSP en modo bloqueante (paso 8).
- [ ] Exportar un `apple-touch-icon.png` desde tu logo, para que se vea bonito cuando alguien
      guarde la página en la pantalla de inicio del celular.
- [ ] Configurar Meta Pixel si vas a hacer publicidad.

---

## Si algo se rompe

| Lo que ves | Qué revisar |
|---|---|
| La página no carga y dice "Falta configuración del entorno" | Falta una variable obligatoria en Vercel. El mensaje dice cuál. |
| El pago se queda en "estamos confirmando tu pago" | El webhook. Revisa el paso 3.3: la URL exacta y que `MP_WEBHOOK_SECRET` sea la misma que muestra Mercado Pago. |
| No llegan los correos | ¿El dominio está **Verified** en Resend? ¿`RESEND_API_KEY` está en Vercel? Revisa la carpeta de spam. |
| No puedo entrar al panel | ¿`ADMIN_PASSWORD` está en Vercel? ¿Volviste a publicar después de agregarla? Si fallaste 5 veces seguidas, espera 15 minutos. |
| El panel dice "No se pudo leer la base de datos" | Revisa `SUPABASE_SERVICE_ROLE_KEY` y que hayas corrido las tres migraciones del paso 2. |
| Cambié el stock y la página no se actualiza | Espera un minuto y recarga. La página se refresca cada 60 segundos. |
| Subí una foto y no aparece | ¿El nombre es exacto y en minúsculas? ¿Hiciste push? Revisa en Vercel que el nuevo deploy terminó. |

Si te trabas en algo que no está acá, guarda el mensaje de error exacto (una captura sirve) y
pídele ayuda a alguien que programe. Con el mensaje de error, se resuelve rápido.
