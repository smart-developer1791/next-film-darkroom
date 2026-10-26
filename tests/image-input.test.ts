import test from 'node:test'
import assert from 'node:assert/strict'
import { imageKind, validateImage, previewSize, MAX_FILE_BYTES } from '../src/domain/image-input.ts'
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
test('supported formats use magic bytes, not names or supplied MIME types', () => {
  assert.equal(imageKind(png), 'image/png')
  assert.equal(imageKind(new Uint8Array([255, 216, 255])), 'image/jpeg')
  assert.equal(imageKind(new TextEncoder().encode('RIFF0000WEBP')), 'image/webp')
  assert.equal(imageKind(new TextEncoder().encode('<svg>')), null)
})
test('empty, oversized and unsupported input is rejected before decoding', () => {
  assert.throws(() => validateImage(png, 0))
  assert.throws(() => validateImage(png, MAX_FILE_BYTES + 1))
  assert.throws(() => validateImage(new Uint8Array(12), 12))
  assert.doesNotThrow(() => validateImage(png, MAX_FILE_BYTES))
})
test('export dimensions preserve aspect and never upscale small images', () => {
  assert.deepEqual(previewSize(4000, 3000), { width: 1600, height: 1200 })
  assert.deepEqual(previewSize(3000, 4000), { width: 1200, height: 1600 })
  assert.deepEqual(previewSize(20, 10), { width: 20, height: 10 })
  assert.deepEqual(previewSize(1, 6000), { width: 1, height: 1600 })
  assert.throws(() => previewSize(0, 10))
  assert.throws(() => previewSize(NaN, 10))
})
