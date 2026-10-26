import Image from 'next/image'
import Link from 'next/link'
import type { Look } from '@/data/looks'
import { samples } from '@/data/looks'
import { sampleImages } from '@/lib/sample-images'
export function LookCard({ look }: { look: Look }) {
  return (
    <article className="group min-w-0">
      <Link href={`/looks/${look.slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm">
          <Image
            src={sampleImages[look.sample]}
            alt={samples.find((s) => s.id === look.sample)!.alt}
            sizes="(min-width: 1024px) 32vw, (min-width:640px) 50vw, 100vw"
            className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
          />
          <span className="absolute right-3 bottom-3 rounded-full bg-paper/95 px-3 py-2 text-[9px] uppercase tracking-wider">
            Original sample
          </span>
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-3xl font-medium tracking-[-.06em]">{look.name}</h3>
          <span className="text-xs">
            ↗<span className="sr-only"> Read the {look.name} story</span>
          </span>
        </div>
      </Link>
      <p className="eyebrow mt-3 text-rust">{look.mood}</p>
      <p className="mt-4 max-w-sm text-sm leading-7 text-muted">{look.description}</p>
      <div role="img" aria-label={`${look.name} colour palette`} className="mt-5 flex gap-1.5">
        {look.colours.map((colour) => (
          <span key={colour} className="h-1.5 flex-1" style={{ backgroundColor: colour }} />
        ))}
      </div>
    </article>
  )
}
