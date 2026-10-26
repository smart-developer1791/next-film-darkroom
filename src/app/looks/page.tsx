import { looks } from '@/data/looks'
import { LookCard } from '@/components/look-card'
import { pageMetadata } from '@/lib/site'
export const metadata = pageMetadata(
  'The colour collection',
  'Three original digital looks: warm Cinder 200, cool Coast 400 and monochrome Pearl 100.',
  '/looks',
)
export default function Looks() {
  return (
    <main id="main" className="wrap pt-14 sm:pt-20">
      <p className="eyebrow text-rust">THE COLOUR COLLECTION / 01—03</p>
      <div className="mt-6 grid gap-7 lg:grid-cols-2">
        <h1 className="font-display text-5xl leading-none font-medium tracking-[-.065em] sm:text-7xl">
          A different kind
          <br />
          of atmosphere.
        </h1>
        <p className="max-w-100 self-end text-sm leading-7 text-muted">
          A warm afternoon, a salt-air morning, a quieter point of view. Three original digital
          recipes, ready for your photograph. Sample photographs below are unprocessed; try a look
          in the darkroom.
        </p>
      </div>
      <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look) => (
          <LookCard key={look.slug} look={look} />
        ))}
      </div>
    </main>
  )
}
