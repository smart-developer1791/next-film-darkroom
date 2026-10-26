import Image from 'next/image'
import Link from 'next/link'
import { looks, samples } from '@/data/looks'
import { LookCard } from '@/components/look-card'
import { sampleImages } from '@/lib/sample-images'
import { pageMetadata } from '@/lib/site'
export const metadata = pageMetadata(
  'A small digital darkroom',
  'Keep the light. Change the mood. Three original colour recipes and a private browser darkroom for your photographs.',
)
export default function Home() {
  return (
    <main id="main" className="wrap">
      <section className="grid items-center gap-12 pt-12 pb-16 sm:pt-18 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:pt-20 lg:pb-24">
        <div>
          <p className="eyebrow text-rust">A SMALL DIGITAL DARKROOM / EST. 2026</p>
          <h1 className="mt-7 font-display text-[clamp(3.9rem,7.1vw,7.3rem)] leading-[.94] font-medium tracking-[-.075em]">
            Keep the light.
            <br />
            <span className="text-rust">
              Change
              <br />
              the mood.
            </span>
          </h1>
          <p className="mt-8 max-w-76 text-sm leading-7 text-muted">
            For the frames you want to feel, not just remember. Three considered colour recipes. A
            little room to make them your own.
          </p>
          <Link href="/lab" className="button mt-8">
            Find your light <span aria-hidden="true">↗</span>
          </Link>
          <p className="mt-5 text-[10px] text-muted">
            No account. No uploads. Just your photograph.
          </p>
        </div>
        <figure className="min-w-0">
          <div className="relative rounded-sm bg-ink px-4 py-8 sm:px-6 sm:py-10">
            <div aria-hidden="true" className="film-edge absolute inset-x-3 top-3 h-2" />
            <Image
              src={sampleImages['corner-light']}
              alt={samples[0].alt}
              priority
              sizes="(min-width:1024px) 50vw,90vw"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
            />
            <div aria-hidden="true" className="film-edge absolute inset-x-3 bottom-3 h-2" />
            <span className="absolute top-13 right-8 rounded-full border border-paper/60 bg-paper px-4 py-3 text-[9px] uppercase tracking-widest sm:top-16 sm:right-10">
              Good light,
              <br />
              slow afternoons.
            </span>
          </div>
          <figcaption className="mt-4 flex justify-between gap-5 text-[9px] uppercase tracking-widest text-muted">
            <span>Frame 01 / Corner light</span>
            <span>Original sample</span>
          </figcaption>
        </figure>
      </section>
      <section className="flex flex-wrap items-center justify-between gap-5 border-y border-line py-5 text-[10px] uppercase tracking-widest text-muted">
        <span>Made for ordinary, lovely moments.</span>
        <span>Local processing / Your photo stays yours</span>
      </section>
      <section className="py-18 sm:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-4 text-rust">01 / THE COLLECTION</p>
            <h2 className="font-display text-4xl font-medium tracking-[-.06em] sm:text-5xl">
              Three ways to see it.
            </h2>
          </div>
          <Link href="/looks" className="py-3 text-xs underline underline-offset-4">
            Meet the looks ↗
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look) => (
            <LookCard key={look.slug} look={look} />
          ))}
        </div>
      </section>
      <section
        id="process"
        className="grid gap-10 border-t border-line pt-16 lg:grid-cols-[.85fr_1.15fr] lg:gap-24"
      >
        <div>
          <p className="eyebrow mb-5 text-rust">02 / LESS FUSS, MORE FEELING</p>
          <h2 className="font-display text-4xl leading-[1.08] font-medium tracking-[-.06em] sm:text-5xl">
            A small ritual
            <br />
            for a good frame.
          </h2>
          <p className="mt-6 max-w-80 text-sm leading-7 text-muted">
            Digital colour, with room for intuition. These are our own recipes, inspired by light
            and texture.
          </p>
        </div>
        <ol className="divide-y divide-line">
          {[
            [
              'Bring a photograph.',
              'Start with one of our samples, or choose a JPG, PNG or WebP from your device.',
            ],
            [
              'Find your balance.',
              'Choose a colour recipe, turn the strength, add a little grain. Slide across to see the difference.',
            ],
            [
              'Keep what you made.',
              'Export a real developed PNG. Save or share the settings separately, as a link, JSON or recipe card.',
            ],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-6 py-7 first:pt-0">
              <span className="pt-2 text-[10px] text-rust">0{i + 1}</span>
              <div>
                <h3 className="font-display text-2xl font-medium tracking-[-.045em]">{title}</h3>
                <p className="mt-3 max-w-100 text-sm leading-7 text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-18 flex flex-wrap items-center justify-between gap-8 rounded-sm bg-sand px-7 py-10 sm:mt-24 sm:px-12">
        <div>
          <p className="eyebrow mb-4 text-rust">YOUR NEXT FAVOURITE FRAME</p>
          <h2 className="font-display text-3xl font-medium tracking-[-.055em] sm:text-4xl">
            Make a little space for the light.
          </h2>
        </div>
        <Link href="/lab" className="button">
          Step into the darkroom ↗
        </Link>
      </section>
    </main>
  )
}
