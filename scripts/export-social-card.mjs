import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
const cover = await readFile(
  new URL('../public/samples/corner-light.webp', import.meta.url),
  'base64',
)
const font = await readFile(
  new URL(
    '../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
    import.meta.url,
  ),
  'base64',
)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.setContent(
    `<style>@font-face{font-family:Display;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#f5f1e8;color:#282925;font-family:Display,Arial}main{height:630px;display:flex;padding:48px;gap:40px}.copy{flex:1;display:flex;flex-direction:column;justify-content:space-between}.brand{font-size:26px;letter-spacing:-1px}h1{font-size:80px;line-height:.96;letter-spacing:-6px;font-weight:500;margin:0}h1 span{color:#91452f}p{font:11px Arial;letter-spacing:2px;margin:0}figure{margin:0;width:450px;background:#282925;padding:24px 18px}img{width:100%;height:100%;object-fit:cover}</style><main><div class="copy"><div class="brand">softlight lab.</div><h1>Keep the light.<br/><span>Change<br/>the mood.</span></h1><p>A SMALL DIGITAL DARKROOM.</p></div><figure><img src="data:image/webp;base64,${cover}"/></figure></main>`,
  )
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((i) => i.decode()))
  })
  await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname })
} finally {
  await browser.close()
}
