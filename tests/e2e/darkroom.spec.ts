import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
const defaultQuery = 'look=cinder-200&strength=75&grain=6'
const preview = (page: Page) => page.getByRole('region', { name: 'Local photo preview' })
async function ready(page: Page, query = defaultQuery) {
  await expect(preview(page)).toHaveAttribute('data-rendered-recipe', query)
  await expect(page.getByRole('button', { name: 'Export developed PNG' })).toBeEnabled()
}
async function range(page: Page, id: string, value: number) {
  await page.locator(`#${id}`).fill(String(value))
}
async function pixels(page: Page) {
  return page.evaluate(() => {
    const a = document.querySelector<HTMLCanvasElement>('[data-original-canvas]')!,
      b = document.querySelector<HTMLCanvasElement>('[data-developed-canvas]')!
    return {
      a: [...a.getContext('2d')!.getImageData(10, 10, 10, 10).data],
      b: [...b.getContext('2d')!.getImageData(10, 10, 10, 10).data],
      width: b.width,
      height: b.height,
    }
  })
}
test('home, collection and all three statically generated stories work', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Keep the light.')
  await page.getByRole('link', { name: 'The looks', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('atmosphere')
  for (const [slug, name] of [
    ['cinder-200', 'Cinder 200'],
    ['coast-400', 'Coast 400'],
    ['pearl-100', 'Pearl 100'],
  ]) {
    await page.goto(`/looks/${slug}`)
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
    await expect(page.getByRole('link', { name: `Try ${name}` })).toHaveAttribute(
      'href',
      `/lab?look=${slug}&strength=75&grain=6`,
    )
  }
})
test('real bundled worker processes the sample into different pixels', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const workers: string[] = []
  page.on('worker', (w) => workers.push(w.url()))
  await page.goto('/lab')
  await ready(page)
  await expect(preview(page)).toHaveAttribute('data-preview-mode', 'worker')
  expect(workers.length).toBeGreaterThan(0)
  const image = await pixels(page)
  expect(image.a).not.toEqual(image.b)
  expect(image.width).toBe(1440)
  expect(errors).toEqual([])
})
test('zero treatment is exact and full Pearl is monochrome', async ({ page }) => {
  await page.goto('/lab?look=cinder-200&strength=0&grain=0')
  await ready(page, 'look=cinder-200&strength=0&grain=0')
  let image = await pixels(page)
  expect(image.a).toEqual(image.b)
  await page.locator('#look').selectOption('pearl-100')
  await range(page, 'strength', 100)
  await ready(page, 'look=pearl-100&strength=100&grain=0')
  image = await pixels(page)
  for (let i = 0; i < image.b.length; i += 4) {
    expect(image.b[i]).toBe(image.b[i + 1])
    expect(image.b[i]).toBe(image.b[i + 2])
  }
})
test('rapid control changes finish with the latest recipe; reveal does not redevelop', async ({
  page,
}) => {
  await page.goto('/lab')
  await ready(page)
  for (const value of [0, 100, 25, 80, 40]) await range(page, 'strength', value)
  await range(page, 'grain', 12)
  const query = 'look=cinder-200&strength=40&grain=12'
  await ready(page, query)
  const before = await pixels(page)
  await page.getByRole('slider', { name: 'Reveal developed image' }).fill('85')
  await expect(preview(page)).toHaveAttribute('data-rendered-recipe', query)
  expect(await pixels(page)).toEqual(before)
  await expect(page.getByRole('slider', { name: 'Reveal developed image' })).toHaveValue('85')
})
test('switching samples produces a new frame without changing recipe', async ({ page }) => {
  await page.goto('/lab')
  await ready(page)
  const first = await pixels(page)
  await page.getByRole('button', { name: 'Use Coast road sample' }).click()
  await expect(page.getByRole('button', { name: 'Use Coast road sample' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect.poll(async () => (await pixels(page)).a).not.toEqual(first.a)
  await ready(page)
})
test('developed PNG download contains canvas pixels and correct dimensions', async ({ page }) => {
  await page.goto('/lab?look=pearl-100&strength=100&grain=0')
  await ready(page, 'look=pearl-100&strength=100&grain=0')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export developed PNG' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('softlight-pearl-100.png')
  const bytes = await readFile((await download.path())!)
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(bytes.readUInt32BE(16)).toBe(1440)
  const decoded = await page.evaluate(async (b64) => {
    const img = await createImageBitmap(
      await fetch(`data:image/png;base64,${b64}`).then((r) => r.blob()),
    )
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    c.getContext('2d')!.drawImage(img, 0, 0)
    img.close()
    return [...c.getContext('2d')!.getImageData(10, 10, 10, 10).data]
  }, bytes.toString('base64'))
  expect(decoded).toEqual((await pixels(page)).b)
})
test('a local upload is never posted and survives colour changes, URL updates and reset', async ({
  page,
}) => {
  const writes: string[] = []
  page.on('request', (request) => {
    if (request.method() !== 'GET') writes.push(request.url())
  })
  await page.goto('/lab')
  await ready(page)
  await page.getByLabel('Choose a photo', { exact: true }).setInputFiles({
    name: 'my-private-frame.webp',
    mimeType: 'image/webp',
    buffer: await readFile('public/samples/citrus-table.webp'),
  })
  await expect(preview(page)).toContainText('my-private-frame.webp')
  await ready(page)
  const original = (await pixels(page)).a
  await page.locator('#look').selectOption('coast-400')
  await range(page, 'strength', 50)
  await ready(page, 'look=coast-400&strength=50&grain=6')
  await page.getByRole('button', { name: 'Update recipe link' }).click()
  await expect(page).toHaveURL(/look=coast-400&strength=50&grain=6/)
  await ready(page, 'look=coast-400&strength=50&grain=6')
  expect((await pixels(page)).a).toEqual(original)
  await page.getByRole('button', { name: 'Reset recipe' }).click()
  await ready(page)
  await expect(preview(page)).toContainText('my-private-frame.webp')
  expect(writes).toEqual([])
})
test('unsupported, corrupt and oversized uploads preserve the valid image', async ({ page }) => {
  await page.goto('/lab')
  await ready(page)
  const original = (await pixels(page)).a
  const input = page.getByLabel('Choose a photo', { exact: true })
  for (const file of [
    { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('<svg/>') },
    {
      name: 'broken.png',
      mimeType: 'image/png',
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]),
    },
    { name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(12 * 1024 * 1024 + 1) },
  ]) {
    await input.setInputFiles(file)
    await expect(page.locator('[data-preview-status]')).toContainText(
      'Your previous image is kept.',
    )
    expect((await pixels(page)).a).toEqual(original)
    await expect(page.getByRole('button', { name: 'Export developed PNG' })).toBeEnabled()
  }
})
test('a large local image is exported at the documented maximum edge', async ({ page }) => {
  await page.goto('/lab')
  await ready(page)
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = 2400
    c.height = 1800
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#ee7755'
    ctx.fillRect(0, 0, c.width, c.height)
    return c.toDataURL().split(',')[1]
  })
  await page.getByLabel('Choose a photo', { exact: true }).setInputFiles({
    name: 'large-frame.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  })
  await expect(preview(page)).toContainText('1600 × 1200 px')
  await ready(page)
  const image = await pixels(page)
  expect([image.width, image.height]).toEqual([1600, 1200])
})
test('missing Worker API uses the same tested pixel processor', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Worker', { value: undefined, configurable: true })
  })
  await page.goto('/lab?look=cinder-200&strength=0&grain=0')
  await ready(page, 'look=cinder-200&strength=0&grain=0')
  await expect(preview(page)).toHaveAttribute('data-preview-mode', 'main')
  const image = await pixels(page)
  expect(image.a).toEqual(image.b)
})
test('an asynchronously failing worker recovers to local processing', async ({ page }) => {
  await page.addInitScript(() => {
    class BrokenWorker {
      onerror: ((e: ErrorEvent) => void) | null = null
      onmessage = null
      constructor() {
        setTimeout(() => this.onerror?.(new ErrorEvent('error')), 30)
      }
      postMessage() {}
      terminate() {}
    }
    Object.defineProperty(window, 'Worker', { value: BrokenWorker, configurable: true })
  })
  await page.goto('/lab')
  await ready(page)
  await expect(preview(page)).toHaveAttribute('data-preview-mode', 'main')
})
test('invalid and duplicate recipe links reset with a visible explanation', async ({ page }) => {
  await page.goto('/lab?look=unknown&strength=200&grain=-1')
  await expect(page.locator('main [role=alert]')).toContainText('invalid')
  await ready(page)
  await page.goto('/lab?look=cinder-200&strength=75&strength=50&grain=6')
  await expect(page.locator('main [role=alert]')).toContainText('invalid')
  await ready(page)
})
test('copy fallback provides the exact recipe URL without photo data', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }),
  )
  await page.goto('/lab')
  await ready(page)
  await range(page, 'grain', 11)
  await page.getByRole('button', { name: 'Copy recipe link' }).click()
  await expect(page.getByRole('textbox', { name: 'Recipe link' })).toHaveValue(
    /\/lab\?look=cinder-200&strength=75&grain=11$/,
  )
  await expect(page.getByRole('link', { name: 'Open this recipe' })).toHaveAttribute(
    'href',
    '/lab?look=cinder-200&strength=75&grain=11',
  )
})
test('browser back restores the URL recipe without remounting the photo', async ({ page }) => {
  await page.goto('/lab')
  await ready(page)
  await range(page, 'strength', 30)
  await page.getByRole('button', { name: 'Update recipe link' }).click()
  await expect(page).toHaveURL(/strength=30/)
  await range(page, 'strength', 85)
  await page.getByRole('button', { name: 'Update recipe link' }).click()
  await expect(page).toHaveURL(/strength=85/)
  await page.goBack()
  await expect(page.locator('#strength')).toHaveValue('30')
  await ready(page, 'look=cinder-200&strength=30&grain=6')
})
test('native GET form and recipe downloads work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:4217/lab')
    await expect(page.locator('#look')).toBeVisible()
    await page.locator('#look').selectOption('pearl-100')
    await page.getByRole('button', { name: 'Update recipe link' }).click()
    await expect(page).toHaveURL(/look=pearl-100/)
    await expect(page.locator('[data-recipe-summary]')).toContainText('monochrome')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Download recipe JSON' }).click(),
    ])
    const doc = JSON.parse(await readFile((await download.path())!, 'utf8'))
    expect(doc.look).toBe('pearl-100')
    const [card] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Download recipe card PNG' }).click(),
    ])
    expect((await readFile((await card.path())!)).readUInt32BE(16)).toBe(1200)
  } finally {
    await context.close()
  }
})
test('recipe endpoint returns a settings-only attachment and rejects malformed requests', async ({
  request,
}) => {
  const response = await request.get(`/api/recipe?${defaultQuery}`)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-disposition']).toContain('attachment')
  const doc = await response.json()
  expect(doc).toMatchObject({
    version: 1,
    studio: 'Softlight Lab',
    look: 'cinder-200',
    strength: 75,
    grain: 6,
  })
  expect(Object.keys(doc)).toEqual(['version', 'studio', 'look', 'strength', 'grain', 'note'])
  for (const query of ['', 'look=cinder-200&strength=3&grain=0', `${defaultQuery}&look=pearl-100`])
    expect((await request.get(`/api/recipe?${query}`)).status()).toBe(400)
})
test('ImageResponse renders actual 1200×630 PNGs with validated settings', async ({ request }) => {
  const a = await request.get(`/api/look-card?${defaultQuery}&download=1`),
    b = await request.get('/api/look-card?look=pearl-100&strength=100&grain=0')
  expect(a.status()).toBe(200)
  expect(a.headers()['content-type']).toContain('image/png')
  expect(a.headers()['content-disposition']).toContain('softlight-cinder-200-recipe.png')
  const bytes = await a.body()
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630])
  expect(bytes.equals(await b.body())).toBe(false)
  expect((await request.get('/api/look-card?look=bad')).status()).toBe(400)
})
test('custom 404 returns HTTP 404 for arbitrary pages and unknown look slugs', async ({ page }) => {
  for (const path of ['/missing-frame', '/looks/unknown']) {
    expect((await page.goto(path))!.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('didn’t develop')
  }
})
test('metadata, real social image, robots and five editorial sitemap URLs', async ({
  page,
  request,
}) => {
  await page.goto('/')
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://next-film-darkroom.vercel.app',
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://next-film-darkroom.vercel.app/og.png',
  )
  const image = await request.get('/og.png')
  expect((await image.body()).readUInt32BE(16)).toBe(1200)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect((sitemap.match(/<loc>/g) || []).length).toBe(5)
  expect(sitemap).not.toContain('/lab')
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /api/')
  await page.goto('/lab?look=pearl-100&strength=100&grain=0')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /api\/look-card\?look=pearl-100&strength=100&grain=0/,
  )
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, follow')
})
test('desktop and mobile pages have no horizontal overflow', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/looks', '/looks/cinder-200', '/lab', '/missing-frame']) {
      await page.goto(path)
      if (path === '/lab') await ready(page)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${width} ${path}`,
      ).toBe(true)
    }
  }
})
test('look changes and reset keep preview and controls in the same place', async ({ page }) => {
  await page.goto('/lab')
  await ready(page)
  const before = await preview(page).boundingBox()
  const summary = await page.locator('[data-recipe-summary]').boundingBox()
  for (const look of ['coast-400', 'pearl-100', 'cinder-200']) {
    await page.locator('#look').selectOption(look)
    await ready(page, `look=${look}&strength=75&grain=6`)
    const next = await preview(page).boundingBox()
    expect(next).toEqual(before)
    expect(await page.locator('[data-recipe-summary]').boundingBox()).toEqual(summary)
  }
  await page.getByRole('button', { name: 'Reset recipe' }).click()
  await ready(page)
  expect(await preview(page).boundingBox()).toEqual(before)
})
test('delayed local fonts and scripts do not shift the home or darkroom', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { shifts: number }).shifts = 0
    new PerformanceObserver((list) => {
      for (const raw of list.getEntries()) {
        const e = raw as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!e.hadRecentInput) (window as unknown as { shifts: number }).shifts += e.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.route(/\.(woff2|js)(\?|$)/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250))
    await route.continue()
  })
  for (const path of ['/', '/lab']) {
    await page.goto(path)
    if (path === '/lab') await ready(page)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    expect(
      await page.evaluate(() => (window as unknown as { shifts: number }).shifts),
    ).toBeLessThan(0.05)
  }
})
test('axe finds no accessibility violations in seven representative states', async ({ page }) => {
  for (const path of [
    '/',
    '/looks',
    '/looks/cinder-200',
    '/looks/pearl-100',
    '/lab',
    '/lab?look=invalid',
    '/missing-frame',
  ]) {
    await page.goto(path)
    if (path.startsWith('/lab')) await ready(page)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      results.violations,
      `${path}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([])
  }
})
