import { TEXTO_PLAZO } from '@/lib/logistica'

/**
 * Cómo funciona (docs/07-copy-y-contenido.md §C.5).
 *
 * Acá los números 01/02/03 sí significan algo: es una secuencia real y el orden
 * es información que la persona necesita. No son decoración.
 */

const PASOS = [
  {
    numero: '01',
    titulo: 'Eliges tu pack',
    texto:
      'Cinco opciones, nada más. Si te decides por dos cosas, el despacho probablemente te sale gratis.',
  },
  {
    numero: '02',
    titulo: 'Pagas seguro con Mercado Pago',
    texto:
      'Con débito o crédito. El pago ocurre en el sitio de Mercado Pago: los datos de tu tarjeta nunca pasan por nosotros.',
  },
  {
    numero: '03',
    titulo: 'Te escribimos y te lo llevamos',
    texto: TEXTO_PLAZO,
  },
]

export function ComoFunciona() {
  return (
    <section className="bg-[var(--color-beige)]">
      <div className="contenedor seccion">
        <div className="revelar max-w-3xl">
          <p className="eyebrow mb-3">Cómo funciona</p>
          <h2 className="text-[length:var(--text-h2)]">Tres pasos y listo.</h2>
        </div>

        <ol className="mt-9 grid gap-6 md:grid-cols-3">
          {PASOS.map((paso, i) => (
            <li
              key={paso.numero}
              className="revelar relative rounded-xl border-2 border-[var(--color-carbon)] bg-[var(--color-crema)] p-6 sombra-block"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p
                className="font-[family-name:var(--font-display)] text-4xl leading-none text-[var(--color-terracota)]"
                aria-hidden="true"
              >
                {paso.numero}
              </p>
              <h3 className="mt-3 text-[1.0625rem] leading-tight">{paso.titulo}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--color-marron)]">
                {paso.texto}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
