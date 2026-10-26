import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
const origin = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4218'
const out = new URL('../docs/previews/', import.meta.url)
await mkdir(out, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  })
  async function capture(name, fullPage = false) {
    await page.evaluate(async () => {
      await document.fonts.ready
      for (const i of document.images) i.loading = 'eager'
      await Promise.all([...document.images].map((i) => i.decode()))
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await page.mouse.move(0, 0)
    await page.screenshot({
      path: new URL(`${name}.png`, out).pathname,
      fullPage,
      animations: 'disabled',
    })
  }
  for (const [name, path] of [
    ['home', '/'],
    ['looks', '/looks'],
    ['story', '/looks/coast-400'],
    ['404', '/lost-frame'],
  ]) {
    await page.goto(new URL(path, origin).href)
    await capture(name, name === 'home')
  }
  await page.goto(new URL('/lab?look=cinder-200&strength=75&grain=6', origin).href)
  await expect(page.getByRole('button', { name: 'Export developed PNG' })).toBeEnabled()
  await capture('darkroom', true)
  await page.locator('#look').selectOption('pearl-100')
  await page.locator('#strength').fill('100')
  await page.locator('#grain').fill('0')
  await expect(page.getByRole('region', { name: 'Local photo preview' })).toHaveAttribute(
    'data-rendered-recipe',
    'look=pearl-100&strength=100&grain=0',
  )
  await capture('pearl', true)
  const response = await page.request.get(
    new URL('/api/look-card?look=coast-400&strength=65&grain=8', origin).href,
  )
  if (!response.ok()) throw new Error('Recipe card failed')
  await writeFile(new URL('recipe-card.png', out), await response.body())
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(new URL('/lab', origin).href)
  await expect(page.getByRole('button', { name: 'Export developed PNG' })).toBeEnabled()
  await capture('mobile', true)
} finally {
  await browser.close()
}
