'use client'
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '80px 24px',
          background: '#f5f1e8',
          color: '#282925',
          fontFamily: 'Arial,sans-serif',
        }}
      >
        <main>
          <p>SOFTLIGHT LAB</p>
          <h1>We lost the light for a moment.</h1>
          <p>Try loading the page again. A local photo will need to be selected again.</p>
          <button onClick={reset} style={{ padding: 16, marginRight: 20 }}>
            Try again
          </button>
          <a href="/">Return home</a>
        </main>
      </body>
    </html>
  )
}
