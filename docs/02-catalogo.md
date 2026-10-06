# 02 — Catálogo, precios y stock

Moneda: **CLP (pesos chilenos)**. Sin decimales. Formato de despliegue: `$29.990`.
Los precios son **finales, IVA incluido**.

## Los 5 SKUs

| id | Nombre comercial | Contenido | Precio | Rol en la página |
|---|---|---|---|---|
| `tradicional` | Pack Tradicional | Juego de ajedrez (tablero + piezas) | 15990 | Puerta de entrada |
| `cm` | Pack CM · Candidato a Maestro | Juego de ajedrez + bolso | 29990 | **Más vendido** (destacado) |
| `im` | Pack IM · Maestro Internacional | Juego de ajedrez + reloj | 39990 | Salto a lo competitivo |
| `gm` | Pack GM · Gran Maestro | Juego + reloj + bolso profesional | 49990 | Tope de gama / regalo grande |
| `reloj` | Reloj de ajedrez | Reloj de ajedrez en su cajita | 24990 | Venta suelta y complemento |

### Notas de producto

- El **reloj suelto** viene en una cajita propia (mencionarlo: aporta a la percepción de regalo).
- El reloj que se vende suelto es el mismo que va incluido en los packs IM y GM.
- El Pack CM debe llevar la etiqueta visual **"Más elegido"** — es el punto dulce de precio y
  además es el que cruza el umbral de despacho gratis ($39.990) cuando se suma cualquier otra cosa.

### Edad recomendada (para mostrar en cada producto)

- Pack Tradicional: desde 5 años
- Pack CM: desde 6 años
- Pack IM: desde 8 años
- Pack GM: desde 8 años
- Reloj: desde 8 años

## Implementación del catálogo

El catálogo vive en **un solo archivo server-side**, p. ej. `src/lib/catalogo.ts`, y es la
única fuente de verdad de precios. El cliente **nunca** manda un precio: manda `id` y
`cantidad`, y el servidor recalcula todo.

```ts
// forma esperada (adáptala a tu implementación)
export const CATALOGO = {
  tradicional: { id: 'tradicional', nombre: 'Pack Tradicional', precio: 15990, edadMin: 5, ... },
  // ...
} as const
```

## Stock

Felipe todavía **no tiene el inventario contado**. Requisitos:

1. El stock vive en Supabase, en la tabla `productos` (columna `stock`), no hardcodeado.
2. Crea un **seed** con valores de partida claramente marcados como provisorios:
   `tradicional: 20, cm: 15, im: 10, gm: 6, reloj: 12`.
3. Felipe debe poder cambiar el stock **desde el panel de administración**, sin tocar código
   y sin entrar a Supabase. Este es un requisito duro.
4. Comportamiento en la página pública:
   - stock > 5 → no se muestra número.
   - stock entre 1 y 5 → badge **"Últimas N unidades"**.
   - stock = 0 → producto en gris, botón deshabilitado con **"Agotado"**, y no se puede
     agregar al carrito ni crear preferencia de pago.
5. El stock se **descuenta en el servidor solo cuando el pago queda confirmado**
   (en el webhook de Mercado Pago), de forma atómica, para que dos compras simultáneas no
   puedan vender la misma última unidad. Al crear la preferencia de pago se **valida**
   disponibilidad, pero no se descuenta.
6. Si el webhook llega y ya no hay stock, se registra el pedido con estado
   `pagado_sin_stock` y se le avisa a Felipe por correo para que contacte y devuelva.
   Nunca se pierde el pedido en silencio.

## Reglas de precio

- No hay descuentos por cantidad ni cupones en esta versión.
- No hay precios tachados falsos. Si más adelante hay oferta, se muestra el precio anterior
  real o no se muestra nada.
- El total del carrito = suma de (precio × cantidad) + costo de despacho (ver `04-logistica.md`).
