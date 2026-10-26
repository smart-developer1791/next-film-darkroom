import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLook, looks, samples } from '@/data/looks'
import { recipePath } from '@/domain/recipe'
import { sampleImages } from '@/lib/sample-images'
import { pageMetadata } from '@/lib/site'
export const dynamicParams = false
export function generateStaticParams() {
  return looks.map((look) => ({ slug: look.slug }))
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const look = getLook((await params).slug)
  return look ? pageMetadata(look.name, look.description, `/looks/${look.slug}`) : {}
}
export default async function LookStory({ params }: { params: Promise<{ slug: string }> }) {
  const look = getLook((await params).slug)
  if (!look) notFound()
  return (
    <main id="main" className="wrap pt-10 sm:pt-16">
      <Link href="/looks" className="inline-block py-3 text-xs underline underline-offset-4">
        ← The collection
      </Link>
      <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <figure>
          <Image
            src={sampleImages[look.sample]}
            alt={samples.find((s) => s.id === look.sample)!.alt}
            priority
            sizes="(min-width:1024px) 55vw,90vw"
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
          <figcaption className="mt-4 flex justify-between text-[9px] uppercase tracking-widest text-muted">
            <span>Frame {look.number}</span>
            <span>Original, unprocessed sample</span>
          </figcaption>
        </figure>
        <div>
          <p className="eyebrow text-rust">
            RECIPE {look.number} / {look.mood}
          </p>
          <h1 className="mt-6 font-display text-6xl leading-none font-medium tracking-[-.07em] sm:text-7xl">
            {look.name}
          </h1>
          <p className="mt-7 font-display text-2xl leading-8 tracking-[-.035em]">
            {look.description}
          </p>
          <p className="mt-6 text-sm leading-7 text-muted">{look.story}</p>
          <div role="group" aria-label="Colour palette" className="mt-8 grid grid-cols-3 gap-2">
            {look.colours.map((colour) => (
              <div key={colour}>
                <div className="h-16" style={{ backgroundColor: colour }} />
                <p className="mt-2 text-[9px] uppercase text-muted">{colour}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 border-t border-line pt-5 text-xs leading-6 text-muted">
            Our starting point: 75% colour strength, grain 6. Adjust both in the darkroom. An
            original RGB treatment; not a reproduction of a commercial film stock.
          </p>
          <Link
            href={recipePath({ look: look.slug, strength: 75, grain: 6 })}
            className="button mt-7"
          >
            Try {look.name} ↗
          </Link>
        </div>
      </div>
    </main>
  )
}
