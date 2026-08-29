# 08 — Qué debes entregar

## Entregables

1. **Aplicación Next.js completa y funcional**, con todo lo descrito en `05-arquitectura.md`.
2. **Migraciones SQL** en `supabase/migrations/` — tablas, índices, RLS y la función RPC de
   descuento atómico de stock. Deben poder pegarse en el SQL Editor de Supabase y correr.
3. **Seed** de los 5 productos con los precios de `02-catalogo.md`.
4. **Panel de administración** funcionando: login, listado de pedidos por comuna, marcar
   entregado, editar stock, exportar CSV.
5. **`.env.example`** completo y comentado.
6. **`README.md`** con instrucciones de instalación local.
7. **`docs/09-verificacion.md`** con el resultado de cada punto del checklist de `06-seguridad.md`.
8. **`PUESTA-EN-MARCHA.md`** — la guía para Felipe (ver abajo). Este es el documento que más
   le importa: él no es desarrollador.
9. **`DECISIONES.md`** — cada decisión que tomaste por tu cuenta, en una línea, con el motivo.
10. Commits limpios en el repo, en español, sin secretos en el historial.

## `PUESTA-EN-MARCHA.md` — contenido obligatorio

Escríbela para alguien que no programa. Paso a paso, con lo que va a ver en pantalla.

1. **Crear proyecto en Supabase** — dónde encontrar la URL y la `service_role key`, y la
   advertencia de que esa clave no se comparte con nadie.
2. **Correr las migraciones** — copiar y pegar el SQL, en qué orden.
3. **Cuenta de Mercado Pago Chile** — dónde sacar el Access Token de producción, la Public Key
   y cómo crear el webhook apuntando a
   `https://lacasadelestratega.cl/api/webhooks/mercadopago`, y de dónde se copia el secreto
   de firma. Explicar la diferencia entre credenciales de **prueba** y de **producción**, y
   cómo hacer una compra de prueba con tarjeta de test antes de salir a producción.
4. **Resend** — verificar el dominio `lacasadelestratega.cl` (registros DNS) para que los
   correos no caigan en spam.
5. **Deploy en Vercel** — importar el repo, pegar las variables de entorno una por una
   (lista exacta), y conectar el dominio `lacasadelestratega.cl` con los registros DNS que
   Vercel entregue.
6. **Después de publicar** — cómo entrar al panel, cómo cambiar el stock, cómo marcar un
   pedido entregado, cómo exportar el CSV.
7. **Cómo subir las fotos de los productos** — la carpeta, los nombres de archivo exactos, y
   que basta con hacer commit y push para que se actualicen.
8. **Meta Pixel y Google Analytics** — dónde se sacan los IDs y en qué variable van.
9. **Qué falta / qué revisar con un humano** — los textos legales, el stock real, las fotos.

## Prioridad si el tiempo aprieta

Si algo tiene que quedar para después, este es el orden de sacrificio (lo último es lo
primero que se sacrifica):

1. Flujo de compra completo y seguro (checkout + webhook + Supabase) — **intocable**
2. Diseño de la landing y contenido — **intocable**
3. Panel de administración — importante
4. Correos transaccionales — importante
5. Exportar CSV, píxeles, OG image generada — deseable

## Cómo trabajar

- Haz **todo lo que puedas de una sola vez**, sin pedir confirmaciones intermedias.
- Cuando una decisión menor sea ambigua, elige la opción sensata, anótala en `DECISIONES.md`
  y sigue.
- Detente a preguntar **solo** si falta una credencial o un dato que no puedes generar ni
  inventar razonablemente.
- Al terminar, entrega un resumen corto: qué quedó hecho, qué necesita Felipe hacer con sus
  manos, y qué revisaría un humano antes de cobrarle dinero real a alguien.
