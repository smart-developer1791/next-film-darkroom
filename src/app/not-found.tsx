import Link from 'next/link'
export default function NotFound() {
  return (
    <main id="main" className="wrap py-16 sm:py-24">
      <div className="mx-auto max-w-190 border-[14px] border-ink px-6 py-14 text-center sm:px-14">
        <p className="eyebrow text-rust">FRAME 404 / NO EXPOSURE</p>
        <h1 className="mt-7 font-display text-5xl font-medium tracking-[-.065em] sm:text-7xl">
          This frame
          <br />
          didn’t develop.
        </h1>
        <p className="mx-auto mt-6 max-w-70 text-sm leading-7 text-muted">
          There’s nothing on this page. There’s still plenty of light in the collection.
        </p>
        <Link href="/looks" className="button mt-8">
          Find a new frame ↗
        </Link>
      </div>
    </main>
  )
}
