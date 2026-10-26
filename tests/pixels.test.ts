import test from 'node:test'
import assert from 'node:assert/strict'
import { develop } from '../src/domain/pixels.ts'
import { defaultRecipe } from '../src/domain/recipe.ts'
const pixels = new Uint8ClampedArray([
  30, 100, 220, 255, 240, 100, 15, 128, 0, 0, 0, 0, 255, 255, 255, 255,
])
test('zero colour and zero grain preserve all RGBA pixels', () =>
  assert.deepEqual(develop(pixels, { ...defaultRecipe, strength: 0, grain: 0 }), pixels))
test('developing makes a separate buffer and never changes source alpha or source pixels', () => {
  const before = pixels.slice()
  const result = develop(pixels, defaultRecipe)
  assert.notEqual(result.buffer, pixels.buffer)
  assert.deepEqual(pixels, before)
  for (let i = 3; i < pixels.length; i += 4) assert.equal(result[i], pixels[i])
  assert.notDeepEqual(result, pixels)
})
test('full Pearl with no grain produces equal RGB channels', () => {
  const result = develop(pixels, { look: 'pearl-100', strength: 100, grain: 0 })
  for (let i = 0; i < result.length; i += 4) {
    assert.equal(result[i], result[i + 1])
    assert.equal(result[i], result[i + 2])
  }
})
test('grain is deterministic, independent of colour strength and clamped', () => {
  const recipe = { ...defaultRecipe, strength: 0, grain: 20 }
  const a = develop(pixels, recipe)
  assert.deepEqual(a, develop(pixels, recipe))
  assert.notDeepEqual(a, pixels)
  assert.ok([...a].every((n) => n >= 0 && n <= 255))
})
test('empty, incomplete RGBA or invalid controls cannot be processed', () => {
  assert.throws(() => develop(new Uint8ClampedArray(), defaultRecipe))
  assert.throws(() => develop(new Uint8ClampedArray(3), defaultRecipe))
  assert.throws(() => develop(pixels, { ...defaultRecipe, look: 'absent' }))
})
