import { Workbench } from '@/components/workbench'
import { readRecipe, recipeQuery } from '@/domain/recipe'
import { pageMetadata } from '@/lib/site'
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }
export async function generateMetadata({ searchParams }: Props) {
  const { recipe } = readRecipe(await searchParams)
  const meta = pageMetadata(
    'Your private darkroom',
    'Make a colour recipe. Develop a photograph locally, compare the result and export a PNG.',
    '/lab',
  )
  const image = `/api/look-card?${recipeQuery(recipe)}`
  return {
    ...meta,
    robots: { index: false, follow: true },
    openGraph: {
      ...meta.openGraph,
      images: [
        { url: image, width: 1200, height: 630, alt: 'Softlight Lab colour recipe settings' },
      ],
    },
    twitter: { card: 'summary_large_image' as const, images: [image] },
  }
}
export default async function Lab({ searchParams }: Props) {
  const { recipe, notice } = readRecipe(await searchParams)
  return (
    <main id="main" className="wrap pt-12 sm:pt-16">
      <div className="mb-10 grid items-end gap-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-5 text-rust">01 / BRING A PHOTOGRAPH</p>
          <h1 className="font-display text-5xl font-medium tracking-[-.065em] sm:text-6xl">
            Your little darkroom.
          </h1>
        </div>
        <p className="max-w-96 text-sm leading-7 text-muted lg:justify-self-end">
          Start with a sample or a photo of your own. Find a feeling. Keep the frame. Your image
          never leaves this browser.
        </p>
      </div>
      <Workbench initialRecipe={recipe} notice={notice} />
      <aside className="mt-12 border-t border-line pt-7 text-xs leading-7 text-muted">
        <strong className="font-medium text-ink">A note on the process.</strong> We apply an
        original RGB colour mix and repeatable digital grain. Colour strength and grain are
        independent. Exports keep the displayed image dimensions, up to a 1600 px edge, without
        source metadata. This is a small creative tool, not a RAW or colour-managed print workflow.
      </aside>
    </main>
  )
}
