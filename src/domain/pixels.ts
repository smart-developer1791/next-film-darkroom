import { getLook } from '../data/looks.ts'
import { validateRecipe, type Recipe } from './recipe.ts'
function noise(index: number) {
  let value = (index ^ 42) >>> 0
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295 - 0.5
}
export function develop(source: Uint8ClampedArray, input: Recipe) {
  const recipe = validateRecipe(input),
    look = getLook(recipe.look)!
  if (!source.length || source.length % 4 !== 0) throw new Error('Use complete RGBA pixels.')
  const result = new Uint8ClampedArray(source.length),
    mix = recipe.strength / 100
  for (let index = 0; index < source.length; index += 4) {
    const red = source[index],
      green = source[index + 1],
      blue = source[index + 2],
      grain = noise(index / 4) * recipe.grain * 2
    for (let channel = 0; channel < 3; channel++) {
      const row = channel * 3
      const transformed =
        (look.matrix[row] * red +
          look.matrix[row + 1] * green +
          look.matrix[row + 2] * blue -
          128) *
          look.contrast +
        128 +
        look.offset[channel]
      result[index + channel] = Math.round(
        Math.max(
          0,
          Math.min(
            255,
            source[index + channel] + (transformed - source[index + channel]) * mix + grain,
          ),
        ),
      )
    }
    result[index + 3] = source[index + 3]
  }
  return result
}
