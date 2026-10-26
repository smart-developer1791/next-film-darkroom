'use client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Form from 'next/form'
import { useState } from 'react'
import { looks, getLook } from '@/data/looks'
import { defaultRecipe, recipePath, recipeQuery, type Recipe } from '@/domain/recipe'
import { sampleImages } from '@/lib/sample-images'
const PhotoPreview = dynamic(() => import('./photo-preview'), {
  ssr: false,
  loading: () => (
    <div>
      <div className="mb-4 min-h-8 text-[10px] uppercase tracking-widest">
        Original sample / preview loading
      </div>
      <Image
        src={sampleImages['corner-light']}
        alt="Original street-corner sample"
        sizes="(min-width:1024px) 58vw,90vw"
        className="aspect-[3/2] w-full rounded-sm object-cover"
      />
      <p className="min-h-100 pt-5 text-xs leading-6 text-muted">
        The interactive photo preview loads here. JavaScript is required for local processing.
      </p>
    </div>
  ),
})
export function Workbench({ initialRecipe, notice }: { initialRecipe: Recipe; notice: string }) {
  const [recipe, setRecipe] = useState(initialRecipe),
    [applied, setApplied] = useState(recipeQuery(initialRecipe)),
    [feedback, setFeedback] = useState(''),
    [manual, setManual] = useState('')
  const incoming = recipeQuery(initialRecipe)
  if (applied !== incoming) {
    setApplied(incoming)
    setRecipe(initialRecipe)
  }
  const look = getLook(recipe.look)!,
    query = recipeQuery(recipe)
  async function copy() {
    const url = new URL(recipePath(recipe), window.location.origin).href
    try {
      await navigator.clipboard.writeText(url)
      setManual('')
      setFeedback('Recipe link copied. Your photo is not included.')
    } catch {
      setManual(url)
      setFeedback('Copy the recipe link below, or open it directly.')
    }
  }
  return (
    <div className="grid items-start gap-9 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
      <PhotoPreview recipe={recipe} />
      <section aria-labelledby="controls-heading" className="min-w-0 border border-line p-5 sm:p-8">
        <p className="eyebrow mb-4 text-rust">02 / FIND YOUR BALANCE</p>
        <h2 id="controls-heading" className="font-display text-3xl font-medium tracking-[-.055em]">
          A look, made yours.
        </h2>
        {notice && (
          <p role="alert" className="mt-5 border border-line p-4 text-xs leading-6">
            {notice}
          </p>
        )}
        <Form action="/lab" scroll={false} className="mt-7">
          <label htmlFor="look" className="mb-2 block text-xs">
            Colour recipe
          </label>
          <select
            id="look"
            name="look"
            value={recipe.look}
            onChange={(event) => setRecipe({ ...recipe, look: event.target.value })}
            className="field"
          >
            {looks.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <label htmlFor="strength" className="mt-6 mb-3 flex justify-between text-xs">
            <span>Colour strength</span>
            <span className="tabular-nums">{recipe.strength}%</span>
          </label>
          <input
            id="strength"
            name="strength"
            type="range"
            min="0"
            max="100"
            step="5"
            value={recipe.strength}
            onChange={(event) => setRecipe({ ...recipe, strength: Number(event.target.value) })}
            aria-valuetext={`${recipe.strength} percent`}
            className="w-full accent-ink"
          />
          <label htmlFor="grain" className="mt-6 mb-3 flex justify-between text-xs">
            <span>Grain</span>
            <span className="tabular-nums">{recipe.grain} / 20</span>
          </label>
          <input
            id="grain"
            name="grain"
            type="range"
            min="0"
            max="20"
            step="1"
            value={recipe.grain}
            onChange={(event) => setRecipe({ ...recipe, grain: Number(event.target.value) })}
            className="w-full accent-ink"
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="button-line">
              Update recipe link ↗
            </button>
            <button
              type="button"
              onClick={() => setRecipe({ ...defaultRecipe })}
              className="min-h-11 text-xs underline underline-offset-4"
            >
              Reset recipe
            </button>
          </div>
        </Form>
        <div data-recipe-summary className="mt-7 min-h-40 border-y border-line py-5">
          <div className="mb-3 flex items-center justify-between gap-5">
            <p className="eyebrow">{look.mood}</p>
            <div aria-hidden="true" className="flex gap-1">
              {look.colours.map((colour) => (
                <span
                  key={colour}
                  className="size-4 rounded-full border border-ink/10"
                  style={{ backgroundColor: colour }}
                />
              ))}
            </div>
          </div>
          <p className="text-xs leading-6 text-muted">{look.description}</p>
          <p className="mt-3 text-[10px] text-muted">
            {recipe.strength}% colour strength / grain {recipe.grain}. An original digital recipe.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3 text-xs">
          <button type="button" onClick={copy} className="min-h-11 underline underline-offset-4">
            Copy recipe link
          </button>
          <a href={recipePath(recipe)} className="min-h-11 py-3 underline underline-offset-4">
            Open this recipe ↗
          </a>
        </div>
        <div className="min-h-26">
          <p role="status" aria-live="polite" className="pt-2 text-[11px] leading-5 text-muted">
            {feedback || 'Links and recipe cards contain settings only. Your photo stays local.'}
          </p>
          {manual && (
            <input
              aria-label="Recipe link"
              readOnly
              value={manual}
              onFocus={(event) => event.currentTarget.select()}
              className="field mt-2"
            />
          )}
        </div>
        <div className="mt-3 grid gap-3 border-t border-line pt-5 text-xs">
          <a href={`/api/recipe?${query}`} className="min-h-11 py-3 underline underline-offset-4">
            Download recipe JSON ↓
          </a>
          <a
            href={`/api/look-card?${query}&download=1`}
            className="min-h-11 py-3 underline underline-offset-4"
          >
            Download recipe card PNG ↓
          </a>
        </div>
      </section>
    </div>
  )
}
