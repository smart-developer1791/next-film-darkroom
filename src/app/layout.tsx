import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'
import { siteUrl } from '@/lib/site'
import './globals.css'
const display = localFont({
  src: '../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  variable: '--font-bricolage',
  weight: '200 800',
  display: 'optional',
  fallback: ['Arial'],
})
const text = localFont({
  src: '../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  variable: '--font-dm',
  weight: '100 1000',
  display: 'optional',
  fallback: ['Arial'],
})
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Softlight Lab / A small digital darkroom', template: '%s / Softlight Lab' },
  description:
    'Three original colour recipes. Your photograph, developed privately in your browser.',
  applicationName: 'Softlight Lab',
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="wrap">
          <div className="flex min-h-24 flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-line py-5">
            <Link href="/" aria-label="Softlight Lab home" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="relative flex size-6 items-center justify-center rounded-full border border-ink"
              >
                <span className="size-2.5 rounded-full bg-rust" />
              </span>
              <span className="font-display text-xl font-semibold tracking-[-.05em]">
                softlight<span className="ml-1.5 text-xs font-normal tracking-normal">lab.</span>
              </span>
            </Link>
            <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-9">
              <Link href="/looks" className="py-3 text-xs hover:underline">
                The looks
              </Link>
              <Link href="/#process" className="hidden py-3 text-xs hover:underline sm:block">
                The process
              </Link>
              <Link href="/lab" className="button-line min-h-10 px-4 py-2 text-[11px]">
                Open darkroom <span aria-hidden="true">↗</span>
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="wrap mt-20 pb-7 sm:mt-28">
          <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-8">
            <div>
              <Link href="/" className="font-display text-2xl font-medium tracking-[-.055em]">
                A little less perfect.
                <br />A little more you.
              </Link>
              <p className="mt-5 text-[10px] text-muted">
                Softlight Lab © 2026 / A fictional independent digital darkroom.
              </p>
            </div>
            <div className="flex gap-6 text-xs">
              <Link href="/looks" className="py-3 underline underline-offset-4">
                Browse looks
              </Link>
              <Link href="/lab" className="py-3 underline underline-offset-4">
                Make a frame ↗
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
