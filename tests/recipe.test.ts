import test from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultRecipe,
  validateRecipe,
  readRecipe,
  recipeQuery,
  queryRecord,
  recipeDocument,
} from '../src/domain/recipe.ts'
test('recipe URLs round-trip all controls without a source photograph', () => {
  const recipe = { look: 'coast-400', strength: 40, grain: 20 }
  assert.deepEqual(validateRecipe(queryRecord(new URLSearchParams(recipeQuery(recipe)))), recipe)
  assert.equal(recipeQuery(recipe).includes('photo'), false)
  assert.equal(recipeDocument(recipe).version, 1)
})
test('bounds, step, arrays, unknown looks and noncanonical values are rejected', () => {
  for (const patch of [
    { look: 'missing' },
    { strength: 101 },
    { strength: 7 },
    { strength: -5 },
    { strength: '05' },
    { strength: '1e2' },
    { strength: ['75', '80'] },
    { grain: 21 },
    { grain: 1.5 },
    { grain: '' },
  ])
    assert.throws(() => validateRecipe({ ...defaultRecipe, ...patch }))
})
test('missing page controls default, invalid links reset visibly, duplicate keys stay invalid', () => {
  assert.deepEqual(readRecipe({}).recipe, defaultRecipe)
  assert.equal(readRecipe({ look: 'pearl-100' }).recipe.look, 'pearl-100')
  const duplicate = queryRecord(
    new URLSearchParams('look=cinder-200&strength=75&strength=50&grain=6'),
  )
  assert.throws(() => validateRecipe(duplicate))
  assert.ok(readRecipe(duplicate).notice)
  assert.deepEqual(readRecipe(duplicate).recipe, defaultRecipe)
})
