'use client'
import Link from 'next/link'
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main id="main" className="wrap py-20">
      <p className="eyebrow text-rust">A PAUSE IN THE PROCESS</p>
      <h1 className="mt-6 font-display text-5xl tracking-[-.06em]">Let’s try that frame again.</h1>
      <p className="mt-6 max-w-100 text-sm leading-7 text-muted">
        This page could not be developed. Reloading clears a local photo from the darkroom, so
        export your frame first if the editor is still available.
      </p>
      <div className="mt-8 flex flex-wrap gap-5">
        <button onClick={reset} className="button">
          Try again
        </button>
        <Link href="/" className="button-line">
          Back to the light
        </Link>
      </div>
    </main>
  )
}
