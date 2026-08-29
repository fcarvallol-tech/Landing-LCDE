import type { Metadata } from 'next'
import Link from 'next/link'
import { MarcoPagina } from '@/components/MarcoPagina'
import { ProsaLegal } from '@/components/ProsaLegal'
import { AvisoLegal } from '@/components/AvisoLegal'
import { NEGOCIO } from '@/lib/negocio'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Qué datos recoge La Casa del Estratega, para qué los usa, con quién los comparte, cuánto tiempo los guarda y cómo ejercer tus derechos.',
}

const ACTUALIZADO = '29 de agosto de 2026'

export default function PaginaPrivacidad() {
  return (
    <MarcoPagina>
      <ProsaLegal titulo="Política de privacidad" actualizado={ACTUALIZADO}>
        <p>
          En {NEGOCIO.nombre} sabemos que al comprarnos nos estás entregando la dirección
          donde vives, muchas veces con niños en casa. Nos lo tomamos en serio. Acá está,
          sin rodeos, qué datos recogemos, para qué, con quién los compartimos y cómo
          puedes pedirnos que los borremos.
        </p>

        <h2>1. Quién es responsable de tus datos</h2>
        <p>
          <strong>{NEGOCIO.nombre}</strong>, con domicilio en Santiago de Chile. Contacto
          para todo lo relativo a datos personales:{' '}
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>.
        </p>

        <h2>2. Qué datos recogemos</h2>
        <p>Solo lo necesario para poder entregarte lo que compraste:</p>
        <ul>
          <li>
            <strong>Datos de contacto:</strong> nombre y apellido, correo electrónico y
            número de celular.
          </li>
          <li>
            <strong>Datos de entrega:</strong> comuna, dirección, número de departamento o
            casa, referencia para llegar y horario que te acomoda.
          </li>
          <li>
            <strong>Datos del pedido:</strong> productos, cantidades, montos, estado del
            pedido y, si marcaste que es un regalo, el mensaje para la tarjeta.
          </li>
          <li>
            <strong>Consentimientos:</strong> si aceptaste los términos y si quisiste o no
            recibir novedades.
          </li>
          <li>
            <strong>Datos técnicos:</strong> si aceptaste las cookies de medición,
            información de navegación anónima o seudonimizada.
          </li>
        </ul>

        <h2>3. Qué NO recogemos</h2>
        <p>
          <strong>
            No recibimos, no vemos y no almacenamos los datos de tu tarjeta.
          </strong>{' '}
          Ni el número, ni la fecha de vencimiento, ni el código de seguridad. Todo el
          proceso de pago ocurre dentro del entorno de Mercado Pago. Nosotros solo
          recibimos de vuelta un identificador de la transacción y si el pago fue
          aprobado o no.
        </p>

        <h2>4. Para qué usamos tus datos</h2>
        <ul>
          <li>Procesar tu pedido y cobrarlo.</li>
          <li>Contactarte por WhatsApp o correo para coordinar la entrega.</li>
          <li>Emitir y enviarte la boleta correspondiente.</li>
          <li>Responder tus consultas y gestionar cambios, devoluciones o garantías.</li>
          <li>Cumplir obligaciones legales y tributarias.</li>
          <li>
            Enviarte novedades y ofertas, <strong>solo si marcaste esa casilla</strong>.
            Aceptar los términos y aceptar publicidad son dos cosas distintas: son dos
            casillas separadas y ninguna viene marcada de antemano.
          </li>
        </ul>

        <h2>5. Base de tratamiento</h2>
        <p>
          Tratamos tus datos porque son <strong>necesarios para ejecutar el contrato de
          compraventa</strong> que celebras con nosotros, porque{' '}
          <strong>nos obliga la ley</strong> en materia tributaria y de protección al
          consumidor, y, en el caso exclusivo de las comunicaciones comerciales y las
          cookies de medición, porque nos diste tu <strong>consentimiento expreso</strong>,
          que puedes retirar cuando quieras.
        </p>

        <h2>6. Con quién los compartimos</h2>
        <p>
          No vendemos ni cedemos tus datos a terceros con fines comerciales. Los
          compartimos únicamente con los proveedores que necesitamos para operar:
        </p>
        <ul>
          <li>
            <strong>Mercado Pago</strong> (Mercado Pago S.A.), como procesador de pagos.
            Recibe los datos necesarios para procesar la transacción y actúa como
            responsable independiente respecto de los datos de tu medio de pago.
          </li>
          <li>
            <strong>Supabase</strong>, como proveedor de la base de datos donde se guarda
            tu pedido.
          </li>
          <li>
            <strong>Vercel</strong>, como proveedor del alojamiento de este sitio.
          </li>
          <li>
            <strong>Resend</strong>, como proveedor del envío de los correos de
            confirmación.
          </li>
          <li>
            <strong>Meta</strong> y <strong>Google</strong>, únicamente si aceptaste las
            cookies de medición, y solo con datos de navegación.
          </li>
          <li>
            Autoridades competentes, cuando exista una obligación legal de entregarlos.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores procesan información en servidores ubicados fuera
          de Chile, principalmente en Estados Unidos.
        </p>

        <h2>7. Cuánto tiempo los guardamos</h2>
        <ul>
          <li>
            <strong>Datos de pedidos:</strong> mientras dure la relación comercial y luego
            por el plazo que exigen las obligaciones tributarias y de garantía legal en
            Chile (referencialmente, 6 años).
          </li>
          <li>
            <strong>Datos para envío de novedades:</strong> hasta que nos pidas darte de
            baja.
          </li>
          <li>
            <strong>Cookies de medición:</strong> según los plazos de cada proveedor,
            normalmente entre 6 y 24 meses.
          </li>
        </ul>

        <h2>8. Cookies y píxeles</h2>
        <p>
          Este sitio usa cookies técnicas indispensables para que funcione el carrito y la
          sesión, que no requieren tu consentimiento.
        </p>
        <p>
          Adicionalmente puede usar cookies de medición de <strong>Meta Pixel</strong> y{' '}
          <strong>Google Analytics</strong>, que nos sirven para saber si nuestra
          publicidad funciona.{' '}
          <strong>Estas no se cargan hasta que tú las aceptas</strong> en el banner que
          aparece al entrar. Si no las aceptas, el sitio funciona exactamente igual.
        </p>
        <p>
          Puedes cambiar tu decisión cuando quieras desde el enlace{' '}
          <em>Preferencias de cookies</em> en el pie de página.
        </p>

        <h2>9. Seguridad</h2>
        <p>
          Aplicamos medidas razonables para proteger tu información: conexión cifrada
          (HTTPS) en todo el sitio, acceso a la base de datos restringido exclusivamente
          al servidor, panel de administración protegido con contraseña y sesión firmada,
          y minimización de registros —no dejamos direcciones, teléfonos ni correos
          completos en los archivos de registro del sistema.
        </p>
        <p>
          Ningún sistema es infalible. Si llegara a producirse un incidente que afecte tus
          datos, te lo comunicaremos.
        </p>

        <h2>10. Tus derechos</h2>
        <p>Puedes ejercer en cualquier momento tus derechos de:</p>
        <ul>
          <li>
            <strong>Acceso:</strong> saber qué datos tuyos tenemos.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir datos incorrectos o desactualizados.
          </li>
          <li>
            <strong>Eliminación:</strong> pedir que borremos tus datos, salvo aquellos que
            debamos conservar por obligación legal.
          </li>
          <li>
            <strong>Oposición y revocación del consentimiento:</strong> dejar de recibir
            comunicaciones comerciales o retirar el consentimiento para las cookies de
            medición.
          </li>
        </ul>
        <p>
          Para ejercerlos, escribe a{' '}
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a> indicando tu nombre y el
          número de pedido, si lo tienes. Te responderemos a la brevedad.
        </p>

        <h2>11. Menores de edad</h2>
        <p>
          Nuestros productos están pensados como regalos para niños, pero{' '}
          <strong>las compras las realizan personas adultas</strong>. No recogemos
          deliberadamente datos de menores de edad. Si crees que un menor nos entregó datos
          personales, escríbenos y los eliminaremos.
        </p>

        <h2>12. Cambios a esta política</h2>
        <p>
          Si actualizamos esta política, publicaremos la nueva versión en esta misma
          página con su fecha de actualización. Los{' '}
          <Link href="/terminos">Términos y Condiciones</Link> forman un todo con este
          documento.
        </p>

        <h2>13. Contacto</h2>
        <p>
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>
          <br />
          WhatsApp <span className="numeros">{NEGOCIO.whatsappVisible}</span>
        </p>

        <AvisoLegal />
      </ProsaLegal>
    </MarcoPagina>
  )
}
