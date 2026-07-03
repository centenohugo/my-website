/* Script used for seeding blog posts. Local used only, not intended for deployment*/

import { sql } from '../lib/db'

const SAMPLES: Array<{ title: string; subtitle: string }> = [
  {
    title: 'El valor de lo que no se ve',
    subtitle:
      'Notas sobre el diseño invisible y por qué el buen trabajo desaparece.',
  },
  {
    title: 'Escribir para pensar',
    subtitle: 'Por qué el primer borrador nunca es el argumento real.',
  },
  {
    title: 'La lentitud como método',
    subtitle:
      'Apuntes sobre trabajar despacio en un oficio que premia la velocidad.',
  },
  {
    title: 'Herramientas que desaparecen',
    subtitle: 'Cuando el buen software deja de notarse.',
  },
  {
    title: 'Notas de un cuaderno viejo',
    subtitle: 'Fragmentos rescatados de dos años de libretas.',
  },
  {
    title: 'Sobre empezar de nuevo',
    subtitle: 'Lo que se aprende al reescribir un proyecto desde cero.',
  },
]

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function seed() {
  const count = 45

  for (let i = 0; i < count; i++) {
    const sample = SAMPLES[i % SAMPLES.length]
    const monthIndex = i % 12
    const year = 2026 - Math.floor(i / 12)
    const publishedAt = new Date(Date.UTC(year, monthIndex, 1))
    const title = `${sample.title} (${pad(i + 1)})`
    const slug = slugify(`${sample.title}-${pad(i + 1)}`)
    const content = `${sample.subtitle}\n\nContenido de ejemplo para "${title}".`

    await sql`
      insert into posts (title, subtitle, slug, content, status, published_at)
      values (${title}, ${sample.subtitle}, ${slug}, ${content}, 'published', ${publishedAt})
      on conflict (slug) do nothing
    `
  }

  console.log(`Seed listo: ${count} posts insertados/omitidos.`)
  await sql.end()
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
