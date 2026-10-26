import { getLook } from '../data/looks.ts'
export type Recipe = { look: string; strength: number; grain: number }
export const defaultRecipe: Recipe = { look: 'cinder-200', strength: 75, grain: 6 }
function integer(value: unknown, maximum: number, step: number) {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    !/^(0|[1-9]\d{0,2})$/.test(String(value))
  )
    throw new Error('Choose a whole control value.')
  const number = Number(value)
  if (number > maximum || number % step !== 0)
    throw new Error('Choose a value within the control range.')
  return number
}
export function validateRecipe(input: Record<string, unknown>): Recipe {
  if (typeof input.look !== 'string' || !getLook(input.look))
    throw new Error('Choose a look from the collection.')
  return {
    look: input.look,
    strength: integer(input.strength, 100, 5),
    grain: integer(input.grain, 20, 1),
  }
}
export function readRecipe(query: Record<string, unknown>) {
  try {
    return {
      recipe: validateRecipe({
        look: query.look ?? defaultRecipe.look,
        strength: query.strength ?? defaultRecipe.strength,
        grain: query.grain ?? defaultRecipe.grain,
      }),
      notice: '',
    }
  } catch {
    return {
      recipe: { ...defaultRecipe },
      notice:
        'This recipe link was invalid. The controls were reset to Cinder 200, 75% colour strength and grain 6.',
    }
  }
}
export const recipeQuery = (recipe: Recipe) =>
  new URLSearchParams({
    look: recipe.look,
    strength: String(recipe.strength),
    grain: String(recipe.grain),
  }).toString()
export const recipePath = (recipe: Recipe) => `/lab?${recipeQuery(recipe)}`
export function queryRecord(params: URLSearchParams) {
  return Object.fromEntries(
    [...new Set(params.keys())].map((key) => [
      key,
      params.getAll(key).length === 1 ? params.get(key) : params.getAll(key),
    ]),
  )
}
export function recipeDocument(recipe: Recipe) {
  return {
    version: 1,
    studio: 'Softlight Lab',
    ...recipe,
    note: 'Original digital RGB recipe. Grain is deterministic. Source photographs are not included.',
  }
}
