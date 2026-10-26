export const MAX_FILE_BYTES = 12 * 1024 * 1024
export const MAX_EDGE = 1600
export function imageKind(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value))
    return 'image/png'
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  )
    return 'image/webp'
  return null
}
export function validateImage(bytes: Uint8Array, size: number) {
  if (!size || size > MAX_FILE_BYTES) throw new Error('Choose a JPG, PNG or WebP file up to 12 MB.')
  if (!imageKind(bytes)) throw new Error('This file is not a supported JPG, PNG or WebP image.')
}
export function previewSize(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new Error('The image has no readable dimensions.')
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}
