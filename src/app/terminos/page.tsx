import type { Metadata } from 'next'
import Link from 'next/link'
import { MarcoPagina } from '@/components/MarcoPagina'
import { ProsaLegal } from '@/components/ProsaLegal'
import { AvisoLegal } from '@/components/AvisoLegal'
import { NEGOCIO } from '@/lib/negocio'
import { COMUNAS, COSTO_ENVIO, ENVIO_GRATIS_DESDE } from '@/lib/logistica'
import { formatearPrecio } from '@/lib/catalogo'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Condiciones de venta de La Casa del Estratega: precios, pagos, cobertura de despacho, plazos, cambios, devoluciones y derecho a retracto.',
}

const ACTUALIZADO = '29 de agosto de 2026'

export default function PaginaTerminos() {
  return (
    <MarcoPagina>
      <ProsaLegal titulo="Términos y condiciones" actualizado={ACTUALIZADO}>
        <p>
          Estos términos regulan la compra de productos en {NEGOCIO.dominio}. Al comprar
          en este sitio aceptas lo que se describe a continuación. Te recomendamos leerlo
          antes de pagar.
        </p>

        <h2>1. Quién vende</h2>
        <p>
          Los productos son vendidos por <strong>{NEGOCIO.nombre}</strong>, tienda
          dedicada a la venta de artículos de ajedrez en Santiago de Chile. Puedes
          contactarnos en{' '}
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a> o por WhatsApp al{' '}
          <span className="numeros">{NEGOCIO.whatsappVisible}</span>.
        </p>

        <h2>2. Productos y precios</h2>
        <ul>
          <li>
            Todos los precios están expresados en <strong>pesos chilenos (CLP)</strong>,
            son precios finales y ya incluyen IVA.
          </li>
          <li>
            El precio que se cobra es siempre el que calcula nuestro servidor al momento
            de generar la orden de pago, a partir del catálogo vigente.
          </li>
          <li>
            Las imágenes son referenciales. Cuando haya diferencias menores de color,
            terminación o presentación respecto de la fotografía, prevalece la
            descripción escrita del producto.
          </li>
          <li>
            La disponibilidad depende del stock real. Si un producto se agota entre que
            inicias el pago y que este se confirma, te contactaremos para coordinar una
            alternativa o devolverte el dinero, según prefieras.
          </li>
        </ul>

        <h2>3. Formas de pago</h2>
        <ul>
          <li>
            Los pagos se procesan a través de <strong>Mercado Pago</strong>, con tarjeta
            de débito o crédito.
          </li>
          <li>
            El pago ocurre íntegramente en el entorno de Mercado Pago.{' '}
            <strong>
              No recibimos, no vemos ni almacenamos los datos de tu tarjeta
            </strong>
            .
          </li>
          <li>
            La compra se entiende perfeccionada cuando Mercado Pago nos confirma que el
            pago fue aprobado. Recién en ese momento se reserva el producto a tu nombre.
          </li>
          <li>Emitimos boleta electrónica, que se envía al correo que registres.</li>
        </ul>

        <h2>4. Cobertura de despacho</h2>
        <p>
          La entrega la realizamos nosotros mismos, en persona. Por eso{' '}
          <strong>despachamos únicamente a las siguientes {COMUNAS.length} comunas</strong>{' '}
          de la Región Metropolitana:
        </p>
        <ul>
          {COMUNAS.map((comuna) => (
            <li key={comuna}>{comuna}</li>
          ))}
        </ul>
        <p>
          No realizamos envíos fuera de esta cobertura ni a través de empresas de
          transporte. Si vives fuera de estas comunas, escríbenos por WhatsApp antes de
          comprar y evaluaremos si podemos ayudarte.
        </p>

        <h2>5. Costo de despacho</h2>
        <ul>
          <li>
            Compras con un valor de productos igual o superior a{' '}
            {formatearPrecio(ENVIO_GRATIS_DESDE)}: despacho{' '}
            <strong>sin costo</strong>.
          </li>
          <li>
            Compras bajo ese monto: {formatearPrecio(COSTO_ENVIO)} de despacho.
          </li>
          <li>
            El umbral se calcula sobre el valor de los productos, sin considerar el costo
            de despacho.
          </li>
        </ul>

        <h2>6. Plazos de entrega</h2>
        <ul>
          <li>
            Te contactaremos por WhatsApp <strong>dentro de 24 horas hábiles</strong>{' '}
            desde la confirmación del pago, para coordinar día y hora de entrega.
          </li>
          <li>
            La entrega se realiza habitualmente entre <strong>1 y 3 días hábiles</strong>,
            según comuna y disponibilidad horaria de ambas partes.
          </li>
          <li>
            Estos plazos son <strong>estimados, no garantizados</strong>. Dependen de la
            coordinación contigo y de circunstancias que pueden escapar a nuestro control.
            Si se produjera un retraso relevante, te avisaremos.
          </li>
          <li>
            Es tu responsabilidad entregar una dirección correcta y estar disponible en el
            horario acordado. Si no fuera posible entregar en el horario convenido,
            coordinaremos una nueva fecha.
          </li>
        </ul>

        <h2>7. Derecho a retracto</h2>
        <p>
          Conforme al <strong>artículo 3° bis de la Ley N° 19.496</strong> sobre
          protección de los derechos de los consumidores, tratándose de compras
          realizadas por medios electrónicos, tienes derecho a{' '}
          <strong>poner término unilateralmente al contrato dentro del plazo de 10 días
          contados desde la recepción del producto</strong>, siempre que no hayamos
          dispuesto expresamente lo contrario.
        </p>
        <ul>
          <li>
            Para ejercerlo, escríbenos a{' '}
            <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a> o por WhatsApp,
            indicando el número de tu pedido.
          </li>
          <li>
            El producto debe devolverse en el mismo estado en que lo recibiste, sin haber
            sido usado más allá de lo necesario para comprobarlo, y con sus envases,
            etiquetas y accesorios.
          </li>
          <li>
            Coordinaremos el retiro dentro de nuestra zona de cobertura, sin costo para
            ti.
          </li>
          <li>
            La devolución del dinero se realiza dentro de los <strong>10 días</strong>{' '}
            siguientes a la recepción conforme del producto, por el mismo medio de pago
            utilizado en la compra.
          </li>
        </ul>

        <h2>8. Garantía legal, cambios y devoluciones</h2>
        <ul>
          <li>
            Si el producto llega dañado, incompleto o con fallas, avísanos dentro de los{' '}
            <strong>primeros 3 días</strong> desde la entrega y lo cambiamos sin costo.
          </li>
          <li>
            Sin perjuicio de lo anterior, se aplica la{' '}
            <strong>garantía legal de 6 meses</strong> establecida en la Ley N° 19.496,
            que te permite optar entre la reparación gratuita, la reposición del producto
            o la devolución de lo pagado cuando el producto presenta fallas o
            deficiencias.
          </li>
          <li>
            No se aceptan devoluciones por daños causados por uso indebido, golpes o
            desgaste normal.
          </li>
        </ul>

        <h2>9. Cancelación por nuestra parte</h2>
        <p>
          Nos reservamos el derecho de cancelar un pedido y devolver íntegramente el
          dinero cuando el producto no esté efectivamente disponible, cuando la dirección
          esté fuera de nuestra cobertura, o cuando existan indicios razonables de fraude
          en el medio de pago. En todos esos casos te contactaremos para explicarte lo que
          ocurrió.
        </p>

        <h2>10. Datos personales</h2>
        <p>
          El tratamiento de tus datos personales se rige por nuestra{' '}
          <Link href="/privacidad">Política de Privacidad</Link>, que forma parte
          integrante de estos términos.
        </p>

        <h2>11. Modificaciones</h2>
        <p>
          Podemos actualizar estos términos. La versión aplicable a tu compra es la que
          esté publicada en este sitio al momento en que la realices. La fecha de última
          actualización aparece al inicio de esta página.
        </p>

        <h2>12. Legislación aplicable</h2>
        <p>
          Estos términos se rigen por la legislación de la República de Chile,
          especialmente por la Ley N° 19.496 sobre protección de los derechos de los
          consumidores. Cualquier controversia se someterá a los tribunales competentes
          de Santiago de Chile. Lo anterior no afecta los derechos irrenunciables que la
          ley te reconoce como consumidor.
        </p>

        <h2>13. Contacto</h2>
        <p>
          Para cualquier consulta sobre estos términos: <br />
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>
          <br />
          WhatsApp <span className="numeros">{NEGOCIO.whatsappVisible}</span>
        </p>

        <AvisoLegal />
      </ProsaLegal>
    </MarcoPagina>
  )
}
