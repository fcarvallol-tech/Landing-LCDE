# 10 — Referencias de UX y reglas de conversión

Felipe eligió tres sitios como referencia. Este documento traduce lo que funciona en
ellos a **reglas concretas** para esta página. No copies su arquitectura: los tres son
tiendas de catálogo grande con clientes que ya las conocen. Acá hay cinco productos y
tráfico frío que viene de Instagram. Cambia todo.

## Las referencias y qué se toma de cada una

### Death Wish Coffee — `deathwishcoffee.com`
**Lo que le gustó a Felipe:** la barra superior con el logo al centro, y las fotos.

- **Logo centrado con navegación a ambos lados.** Adóptalo. Es lo que da sensación de
  marca establecida y es la única decisión de layout que Felipe pidió por nombre.
- **Barra de anuncio arriba de la navegación.** Adóptala, pero con un solo mensaje fijo:
  el de despacho. No la uses para promociones rotativas.
- **Fotografía de producto en uso, no solo en fondo blanco.** Café sirviéndose, no solo
  la bolsa. Traducido: el tablero enrollándose, no solo el tablero puesto.
- **NO copiar:** el carrusel del hero con tres slides. Ver "los tres errores" abajo.

### hardgraft — `hardgraft.com`
**Lo que le gustó a Felipe:** la simplicidad, "te muestra exactamente dónde mirar".

- **Sin hero gigante.** Los productos aparecen casi de inmediato. Es la lección más
  importante de las tres para esta página.
- **Tarjeta de producto mínima:** foto, nombre, variante, precio. Nada más. Sin párrafos
  de venta dentro de la tarjeta.
- **Foto cenital sobre fondo neutro y uniforme**, igual en todos los productos. Esto es
  lo que produce la sensación de "caro" — no la tipografía ni los colores.
- **Los datos se enuncian, no se venden.** Despacho y políticas escritos como hechos, en
  tono seco. Genera más confianza que el lenguaje persuasivo.
- **Cero pop-ups, cero animación de relleno, mucho aire.**

### Allbirds — `allbirds.com`
**Lo que le gustó a Felipe:** todos los productos de inmediato, página corta, precios legibles.

- **Franja de despacho por encima de la navegación**, visible antes que cualquier otra cosa.
- **Precio siempre visible en la tarjeta**, en peso alto y con `tabular-nums`. Un precio que
  cuesta encontrar es una venta que se cae.
- **Hero con dos botones que separan al público** ("Shop Men" / "Shop Women"). Este patrón
  resuelve exactamente el problema de los dos ICP de esta marca. Ver abajo.
- **NO copiar:** las once secciones de su home. Allbirds puede pedirte que explores porque
  ya sabes quiénes son. Acá cada scroll extra es gente que se va.

## Los tres errores que las referencias te van a tentar a cometer

1. **Carrusel en el hero.** Death Wish y Allbirds lo usan. No lo uses. En tráfico frío
   nadie espera la segunda diapositiva: el 90% ve solo la primera, así que estás
   escondiendo mensajes que pagaste por mostrar. Un hero, un mensaje, un botón.
2. **Página larga de exploración.** Ellos venden explorando; tú vendes decidiendo. La
   página tiene que poder recorrerse entera en menos de cuatro scrolls en un celular
   hasta llegar a los productos.
3. **Copiar la estética sin la disciplina.** Lo que hace que hardgraft se vea caro no es
   el color: es que las cinco fotos tienen el mismo fondo, la misma luz y el mismo
   encuadre. Eso se consigue con las fotos, no con el CSS.

## Reglas de estructura para esta página

### Encabezado
- Barra de anuncio fija arriba: **"Despacho gratis desde $39.990 · Entrega personal en
  Santiago oriente"**. Un solo mensaje, sin rotación, sin cuenta regresiva.
- Debajo, navegación con **logo al centro**. A la izquierda: `Los packs` y `Para regalo`.
  A la derecha: carrito y WhatsApp. En móvil el logo queda al centro y los enlaces se
  reducen a los dos íconos de la derecha.
- El encabezado es sticky. Nada más es sticky en desktop.

### Hero
- Sin carrusel. Una foto, un titular, un botón primario.
- La foto del hero es **el tablero a medio enrollar** (ver `docs/11-fotografia.md`). Esa
  imagen cuenta la historia del producto sin una palabra.
- Altura máxima del hero: que los productos empiecen a asomar en la primera pantalla del
  celular. Si hay que hacer scroll para sospechar que esto es una tienda, el hero es
  demasiado alto.

### La bifurcación de los dos públicos
Tomando el patrón de Allbirds, pero una sola vez y sin dividir la marca:
- La página principal `/` habla al papá o mamá que busca un regalo.
- Bajo el hero, un enlace discreto —no un botón del mismo peso— del tipo
  *"¿Compras para ti? Mira el tablero por dentro →"* que lleva a `/jugadores`.
- `/jugadores` tiene su propio hero, con las medidas y la practicidad. Cero contenido
  infantil, cero beneficios cognitivos.
- Los anuncios dirigidos a cada segmento aterrizan directo en su página. El enlace del
  hero es solo para quien llegó por la puerta equivocada.

### Tarjetas de producto
Orden exacto de la información, de arriba abajo:
1. Foto cuadrada, mismo fondo en las cinco
2. Etiqueta si corresponde (`Más elegido` en el CM, `Últimas N unidades` si el stock es bajo)
3. Nombre del pack
4. Qué trae, en una línea corta — no un párrafo
5. Precio, grande y legible
6. Botón

Cuatro packs más el reloj, todos visibles sin desplegar nada. En móvil, una columna;
en desktop, tres o cuatro por fila.

### Ruta de compra
La ruta actual —ver pack, agregar al carrito, abrir el panel, llenar el formulario,
pagar— tiene cuatro puntos donde alguien se cae. Para cinco productos donde casi nadie
compra dos, es demasiada ceremonia.

**Ruta objetivo:** un botón en la tarjeta lleva directo a una pantalla única de compra con
ese pack ya seleccionado, el formulario de entrega, y en la misma pantalla el upsell
—*"súmale el reloj y te llevas el despacho gratis"*— con la barra de progreso hacia los
$39.990. Un solo scroll entre el deseo y el pago.

El carrito sigue existiendo para quien quiere sumar cosas, pero deja de ser el camino
obligatorio.

### Formulario
- Un solo paso, todo a la vista. Nada de wizard de tres pantallas.
- Campos en el orden en que la gente los piensa: nombre, teléfono, correo, comuna,
  dirección, depto, referencia.
- `autocomplete` correcto en todos los campos, `inputmode="tel"` en el teléfono y
  `inputmode="email"` en el correo. En celular esto ahorra la mitad del tipeo.
- Validación al salir del campo, nunca mientras escribe. Errores que dicen cómo
  arreglarlo, no "campo inválido".
- Los campos opcionales, marcados como opcionales. Un formulario que se ve corto se
  llena; uno que se ve largo se abandona.

### Precios
- Formato `$29.990`, con `font-variant-numeric: tabular-nums`.
- El costo de despacho aparece **antes** de llegar a Mercado Pago. El cargo sorpresa al
  final es la primera causa de abandono en checkout.
- Nada de precios tachados falsos.

## Coherencia con los anuncios

El titular del hero debe poder cambiar según la campaña de la que viene la persona, con
un parámetro en la URL (`?c=pantalla`, `?c=juntos`, `?c=practico`). El anuncio promete
algo y la página abre diciendo exactamente eso.

Guarda ese parámetro en el pedido, en una columna `campana`, para poder mirar después qué
ángulo trajo gente que compró. Esto no es un test A/B —no hay volumen para eso— pero es
coherencia de mensaje, que sube la conversión, y deja el dato guardado gratis.
