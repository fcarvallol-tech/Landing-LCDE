/**
 * Contenido factual de la página (docs/07-copy-y-contenido.md).
 *
 * ⚠ REGLA DURA: acá no se inventa ni una cifra. Todo lo que está en este
 * archivo viene textualmente de docs/07-copy-y-contenido.md, con su fuente.
 * Si mañana alguien quiere afirmar algo que no está acá, primero tiene que
 * agregarlo a ese documento con la fuente. La credibilidad con papás y mamás
 * informados es el activo más frágil de esta página.
 */

export type Beneficio = {
  titulo: string
  texto: string
  fuente: string
}

/** Los 5 bloques verificados de docs/07 §A. Redacción intacta. */
export const BENEFICIOS: Beneficio[] = [
  {
    titulo: 'Matemáticas y habilidades cognitivas',
    texto:
      'Un metaanálisis de estudios sobre instrucción de ajedrez en escolares encontró efectos positivos —de magnitud pequeña a moderada— en habilidades matemáticas y cognitivas. Los propios autores advierten que el traspaso a otras áreas no es automático: el ajedrez ayuda, no hace magia.',
    fuente:
      'Sala & Gobet, "Do the benefits of chess instruction transfer to academic and cognitive skills?", Educational Research Review (2016).',
  },
  {
    titulo: 'Envejecimiento del cerebro',
    texto:
      'Un estudio de seguimiento a largo plazo publicado en el New England Journal of Medicine asoció la participación frecuente en actividades de ocio cognitivo —entre ellas los juegos de tablero— con un menor riesgo de demencia en adultos mayores.',
    fuente: 'Verghese et al., NEJM (2003), Bronx Aging Study.',
  },
  {
    titulo: 'Atención y TDAH',
    texto:
      'Un estudio piloto español con niños diagnosticados con TDAH observó una mejora en la puntuación de síntomas tras un programa de entrenamiento en ajedrez. Es un estudio pequeño y exploratorio, no una terapia establecida.',
    fuente: 'Blasco-Fontecilla et al., Revista de Psiquiatría y Salud Mental (2016).',
  },
  {
    titulo: 'El cerebro del jugador experto',
    texto:
      'Investigación publicada en Nature mostró que los jugadores expertos y los aficionados activan regiones cerebrales distintas frente a la misma posición: el experto reconoce patrones almacenados, el aficionado calcula desde cero. Jugar entrena precisamente esa capacidad de reconocer patrones.',
    fuente: 'Amidzic et al., Nature (2001).',
  },
  {
    titulo: 'Comprensión lectora',
    texto:
      'Un informe sobre programas de ajedrez en escuelas públicas de Nueva York reportó mejoras en comprensión lectora en los alumnos participantes. Es un informe educativo, no un ensayo clínico: tómalo como indicio, no como prueba.',
    fuente: 'Margulies, "The Effect of Chess on Reading Scores" (1991).',
  },
]

/** Cierre honesto de la sección de beneficios. Texto obligatorio de docs/07. */
export const CIERRE_BENEFICIOS =
  'La evidencia dice que el ajedrez ayuda, no que hace milagros. Lo que sí es seguro: es una hora de concentración real, sin pantalla, sentado frente a alguien que quieres.'

export type DatoCurioso = {
  titulo: string
  texto: string
}

/** Hechos matemáticos verificables de docs/07 §B. */
export const DATOS_CURIOSOS: DatoCurioso[] = [
  {
    titulo: '288 mil millones',
    texto:
      'Posiciones posibles después de solo cuatro jugadas de cada bando. En el cuarto movimiento la partida ya es única.',
  },
  {
    titulo: '10¹²⁰',
    texto:
      'El número de Shannon estima ahí la complejidad del ajedrez: más partidas posibles que átomos en el universo observable.',
  },
  {
    titulo: 'Dos jugadas',
    texto:
      'El mate más corto posible ocurre en dos jugadas. Se llama mate del loco, y perderlo una vez se recuerda para siempre.',
  },
  {
    titulo: 'La dama',
    texto:
      'No siempre fue la pieza más poderosa: hasta el siglo XV se movía una sola casilla en diagonal. La versión moderna nació en la España de Isabel la Católica.',
  },
]

export type Pregunta = { pregunta: string; respuesta: string }

/** FAQ de docs/07 §E. Los hechos son intocables; la redacción es la de ahí. */
export const PREGUNTAS: Pregunta[] = [
  {
    pregunta: '¿A qué comunas llegan?',
    respuesta:
      'Peñalolén, La Reina, Las Condes, Ñuñoa, Santiago Centro, Providencia, Vitacura, Lo Barnechea y Huechuraba. Por ahora entregamos solo ahí, porque la entrega la hacemos nosotros mismos.',
  },
  {
    pregunta: '¿Cuánto cuesta el despacho?',
    respuesta: 'Gratis en compras sobre $40.000. Bajo ese monto, $3.990.',
  },
  {
    pregunta: '¿Cuándo me llega?',
    respuesta:
      'Te escribimos por WhatsApp dentro de 24 horas hábiles para coordinar día y hora. La mayoría de los pedidos se entrega entre 1 y 3 días hábiles.',
  },
  {
    pregunta: '¿Cómo puedo pagar?',
    respuesta:
      'Con tarjeta de débito o crédito a través de Mercado Pago. Nunca vemos ni guardamos los datos de tu tarjeta: el pago ocurre en el entorno seguro de Mercado Pago.',
  },
  {
    pregunta: 'Mi hijo nunca ha jugado. ¿Sirve igual?',
    respuesta:
      'Sí. El ajedrez se aprende jugando y las reglas básicas se explican en una tarde. El Pack Tradicional está pensado exactamente para eso.',
  },
  {
    pregunta: 'Yo tampoco sé jugar. ¿Es un problema?',
    respuesta: 'No. Aprender juntos es probablemente la mejor parte.',
  },
  {
    pregunta: '¿Desde qué edad?',
    respuesta:
      'Desde los 5 años para el Pack Tradicional. Los packs con reloj funcionan mejor desde los 8.',
  },
  {
    pregunta: '¿Puedo comprar el reloj por separado?',
    respuesta: 'Sí. Viene en su cajita, a $24.990.',
  },
  {
    pregunta: '¿Hacen boleta?',
    respuesta:
      'Sí, te la enviamos por correo junto con la confirmación de tu pedido.',
  },
  {
    pregunta: '¿Y si no estoy en esas comunas?',
    respuesta: 'Escríbenos por WhatsApp y vemos qué podemos hacer.',
  },
  {
    pregunta: '¿Puedo pedirlo para regalo?',
    respuesta:
      'Sí. Marca la opción "es un regalo" al comprar y puedes dejarnos un mensaje para la tarjeta.',
  },
]
