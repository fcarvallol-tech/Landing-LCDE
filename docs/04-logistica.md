# 04 — Logística, cobertura y despacho

## Cobertura: solo 9 comunas de Santiago

La entrega la hace Felipe en persona. **No se despacha fuera de esta lista.**

```
Peñalolén
La Reina
Las Condes
Ñuñoa
Santiago Centro
Providencia
Vitacura
Lo Barnechea
Huechuraba
```

(La lista original repetía "Las Condes"; son 9 comunas únicas.)

### Cómo se refleja esto en la página

1. Una **franja de cobertura visible** cerca del hero, no escondida al final:
   > Entregamos personalmente en Peñalolén, La Reina, Las Condes, Ñuñoa, Santiago Centro,
   > Providencia, Vitacura, Lo Barnechea y Huechuraba.
2. En el formulario de compra, la comuna es un **`<select>` cerrado con solo esas 9 opciones**.
   No es un campo de texto libre. Es imposible comprar hacia otra comuna.
3. Debajo del select, un link discreto: *"¿No estás en estas comunas? Escríbenos por WhatsApp
   y vemos qué podemos hacer."* → abre WhatsApp con mensaje prellenado.
4. El servidor **revalida** que la comuna recibida esté en la lista blanca. Si no lo está,
   rechaza el pedido con 400. Nunca confíes solo en el select.
5. Una sección de FAQ que lo repite en texto plano, porque la gente lo va a buscar ahí.

## Costo de despacho

| Condición | Costo |
|---|---|
| Subtotal ≥ **$39.990** | **Gratis** |
| Subtotal < $39.990 | **$3.990** |

- El umbral se evalúa sobre el **subtotal de productos**, antes del despacho.
- El cálculo se hace **en el servidor**. El cliente nunca manda el costo de envío.
- Define el umbral y el costo como constantes en un solo lugar
  (`ENVIO_GRATIS_DESDE = 39990`, `COSTO_ENVIO = 3990`) para que se cambien en un archivo.

### Palanca de conversión (implementar)

En el carrito, cuando el subtotal esté bajo el umbral, mostrar una barra de progreso con:
> Te faltan **$X** para el despacho gratis.

Con `$X = 39990 - subtotal`. Es el mecanismo de upsell más importante de la página: empuja
del Pack Tradicional ($15.990) hacia el Pack IM ($39.990 + cualquier cosa) o hacia sumar el
reloj ($24.990). Cuando se alcanza el umbral, la barra se completa y dice
"Despacho gratis conseguido".

## Plazos de entrega

- Coordinación por WhatsApp dentro de las **24 horas hábiles** siguientes al pago.
- Entrega en **1 a 3 días hábiles** según comuna y disponibilidad de horario.
- Redacción para la página: *"Te escribimos por WhatsApp dentro de 24 horas para coordinar
  día y hora de entrega. La mayoría de los pedidos llega en 1 a 3 días hábiles."*
- No prometer "entrega hoy" ni fechas exactas automáticas.

## Datos que hay que capturar del comprador

Obligatorios:
- Nombre y apellido
- Teléfono móvil (formato chileno, validar `+56 9 XXXX XXXX`; normalizar a `+569XXXXXXXX`)
- Email
- Comuna (select cerrado, lista blanca)
- Dirección: calle y número
- Depto / casa / block (opcional pero campo aparte)

Opcionales útiles:
- Referencia para la entrega (texto libre corto, máx. 200 caracteres)
- Horario preferido de entrega (mañana / tarde / indiferente)
- Checkbox: "Es un regalo" → si está marcado, campo opcional "mensaje para la tarjeta" (máx. 200)

Consentimientos (checkboxes separados, ninguno premarcado):
- [ ] Acepto los Términos y Condiciones y la Política de Privacidad **(obligatorio)**
- [ ] Quiero recibir novedades y ofertas de La Casa del Estratega **(opcional, es el opt-in de marketing)**

## Vista de entregas para Felipe

El panel de administración debe permitir, sin fricción:
- Ver los pedidos pagados **agrupados por comuna** (así arma la ruta del día).
- Ver de cada pedido: nombre, teléfono con botón directo a WhatsApp, dirección completa,
  referencia, productos, total, fecha de pago, estado.
- Marcar un pedido como **Entregado** (con fecha).
- Filtrar por estado: pendiente de pago / pagado / entregado / cancelado.
- Exportar los pedidos pagados a **CSV**.
