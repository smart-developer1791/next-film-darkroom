'use client'
import { useEffect, useRef, useState, useId } from 'react'
import { samples, getLook } from '@/data/looks'
import { develop } from '@/domain/pixels'
import { previewSize, validateImage } from '@/domain/image-input'
import { recipeQuery, type Recipe } from '@/domain/recipe'
import type { WorkerInput, WorkerOutput } from '@/domain/worker-protocol'
type Source = { id: string; name: string; file?: File }
export default function PhotoPreview({ recipe }: { recipe: Recipe }) {
  const [source, setSource] = useState<Source>(() => {
    const id = getLook(recipe.look)!.sample
    return { id, name: samples.find((sample) => sample.id === id)!.name }
  })
  const [reveal, setReveal] = useState(50),
    [working, setWorking] = useState(true),
    [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [fileError, setFileError] = useState(''),
    [mode, setMode] = useState('worker'),
    [rendered, setRendered] = useState(''),
    [size, setSize] = useState('')
  const original = useRef<HTMLCanvasElement>(null),
    result = useRef<HTMLCanvasElement>(null),
    fileInput = useRef<HTMLInputElement>(null)
  const engine = useRef<{ request: (recipe: Recipe) => void } | null>(null),
    latest = useRef(recipe),
    uploadRevision = useRef(0),
    exports = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const alive = useRef(true)
  const comparisonId = useId()
  useEffect(() => {
    latest.current = recipe
    engine.current?.request(recipe)
  }, [recipe])
  useEffect(() => {
    let cancelled = false,
      worker: Worker | null = null,
      pixels: ImageData | null = null,
      busy = false,
      queued: { job: number; recipe: Recipe } | null = null,
      desired = 0,
      timer: ReturnType<typeof setTimeout> | null = null
    const controller = new AbortController()
    setWorking(true)
    setReady(false)
    setError('')
    function finish(message: WorkerOutput, requested: Recipe) {
      if (cancelled) return
      busy = false
      if (message.job === desired) {
        if (message.type === 'result') {
          const canvas = result.current!
          canvas.width = message.width
          canvas.height = message.height
          canvas
            .getContext('2d')!
            .putImageData(
              new ImageData(new Uint8ClampedArray(message.pixels), message.width, message.height),
              0,
              0,
            )
          setRendered(recipeQuery(requested))
          setReady(true)
          setError('')
          setWorking(false)
        } else {
          setError(message.message)
          setWorking(false)
        }
      }
      drain()
    }
    const jobs = new Map<number, Recipe>()
    function drain() {
      if (cancelled || busy || !queued || !pixels) return
      const next = queued
      queued = null
      busy = true
      jobs.set(next.job, next.recipe)
      if (worker) worker.postMessage({ type: 'develop', ...next } satisfies WorkerInput)
      else
        timer = setTimeout(() => {
          if (cancelled || !pixels) return
          try {
            const developed = develop(pixels.data, next.recipe)
            finish(
              {
                type: 'result',
                pixels: developed.buffer,
                width: pixels.width,
                height: pixels.height,
                job: next.job,
              },
              next.recipe,
            )
          } catch {
            finish(
              {
                type: 'error',
                job: next.job,
                message: 'This preview could not be developed. Choose another image.',
              },
              next.recipe,
            )
          }
          jobs.delete(next.job)
        }, 0)
    }
    function request(next: Recipe) {
      queued = { job: ++desired, recipe: next }
      setWorking(true)
      drain()
    }
    function fallback() {
      worker?.terminate()
      worker = null
      busy = false
      jobs.clear()
      setMode('main')
      request(latest.current)
    }
    async function load() {
      let bitmap: ImageBitmap | null = null
      try {
        let blob: Blob
        if (source.file) blob = source.file
        else {
          const response = await fetch(`/samples/${source.id}.webp`, { signal: controller.signal })
          if (!response.ok) throw new Error('Sample unavailable')
          blob = await response.blob()
        }
        bitmap = await createImageBitmap(blob)
        if (cancelled) return
        const dimensions = previewSize(bitmap.width, bitmap.height)
        const canvas = original.current!
        canvas.width = dimensions.width
        canvas.height = dimensions.height
        const context = canvas.getContext('2d', { willReadFrequently: true })!
        context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height)
        pixels = context.getImageData(0, 0, dimensions.width, dimensions.height)
        setSize(`${dimensions.width} × ${dimensions.height} px`)
        try {
          worker = new Worker(new URL('../workers/develop.worker.ts', import.meta.url), {
            type: 'module',
          })
          worker.onmessage = ({ data }: MessageEvent<WorkerOutput>) => {
            const requested = jobs.get(data.job)
            if (requested) {
              jobs.delete(data.job)
              finish(data, requested)
            }
          }
          worker.onerror = (event) => {
            event.preventDefault()
            if (!cancelled) fallback()
          }
          const copy = pixels.data.slice().buffer
          worker.postMessage(
            { type: 'source', pixels: copy, ...dimensions } satisfies WorkerInput,
            [copy],
          )
          setMode('worker')
        } catch {
          worker = null
          setMode('main')
        }
        engine.current = { request }
        request(latest.current)
      } catch {
        if (!cancelled) {
          setError('This image could not be read. Try a different JPG, PNG or WebP.')
          setWorking(false)
        }
      } finally {
        bitmap?.close()
      }
    }
    void load()
    return () => {
      cancelled = true
      engine.current = null
      controller.abort()
      worker?.terminate()
      if (timer) clearTimeout(timer)
      jobs.clear()
    }
  }, [source])
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      for (const [url, timer] of exports.current) {
        clearTimeout(timer)
        URL.revokeObjectURL(url)
      }
      exports.current.clear()
    }
  }, [])
  async function upload(file: File | undefined) {
    if (!file) return
    const revision = ++uploadRevision.current
    try {
      validateImage(new Uint8Array(await file.slice(0, 12).arrayBuffer()), file.size)
      // Decode a candidate before replacing the current valid source.
      const bitmap = await createImageBitmap(file)
      bitmap.close()
      if (revision !== uploadRevision.current) return
      setFileError('')
      setSource({ id: '', file, name: file.name.slice(0, 80) })
    } catch (error) {
      if (revision === uploadRevision.current)
        setFileError(
          `${error instanceof Error ? error.message : 'This image could not be read.'} Your previous image is kept.`,
        )
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }
  function exportImage() {
    if (!ready || working || rendered !== recipeQuery(recipe)) return
    result.current!.toBlob((blob) => {
      if (!alive.current) return
      if (!blob) {
        setFileError('The browser could not export this image. Try again.')
        return
      }
      const url = URL.createObjectURL(blob),
        anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `softlight-${recipe.look}.png`
      anchor.click()
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url)
        exports.current.delete(url)
      }, 1000)
      exports.current.set(url, timer)
    }, 'image/png')
  }
  return (
    <section
      aria-label="Local photo preview"
      data-preview-mode={mode}
      data-rendered-recipe={rendered}
      className="min-w-0"
    >
      <div className="mb-4 flex min-h-8 items-center justify-between gap-4 text-[10px]">
        <p className="min-w-0 truncate uppercase tracking-widest">{source.name}</p>
        <span className="shrink-0 text-muted">{size || 'Preparing your frame'}</span>
      </div>
      <div
        role="img"
        aria-label={`Original and developed comparison of ${source.name}. Use the reveal slider below.`}
        className="relative aspect-[3/2] overflow-hidden rounded-sm bg-ink/90"
      >
        <canvas
          ref={original}
          data-original-canvas
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}>
          <canvas
            ref={result}
            data-developed-canvas
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-paper/95 px-3 py-2 text-[9px] uppercase tracking-widest">
          Developed
        </span>
        <span className="absolute top-4 right-4 rounded-full bg-paper/95 px-3 py-2 text-[9px] uppercase tracking-widest">
          Original
        </span>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-paper/90"
          style={{ left: `${reveal}%` }}
        />
      </div>
      <div className="mt-5">
        <label htmlFor={comparisonId} className="mb-3 flex justify-between gap-4 text-xs">
          <span>Reveal developed image</span>
          <span className="tabular-nums text-muted">{reveal}%</span>
        </label>
        <input
          id={comparisonId}
          type="range"
          min="0"
          max="100"
          value={reveal}
          onChange={(event) => setReveal(Number(event.target.value))}
          aria-valuetext={`${reveal} percent developed`}
          className="w-full accent-ink"
        />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            aria-pressed={source.id === sample.id}
            onClick={() => {
              uploadRevision.current++
              setFileError('')
              if (source.id !== sample.id) setSource({ id: sample.id, name: sample.name })
            }}
            className={`min-h-11 border px-2 py-3 text-[10px] ${source.id === sample.id ? 'border-ink bg-sand' : 'border-line hover:border-ink'}`}
            aria-label={`Use ${sample.name} sample`}
          >
            {sample.name}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => void upload(event.target.files?.[0])}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a photo"
        />
        <button type="button" onClick={() => fileInput.current?.click()} className="button-line">
          Choose your photo <span aria-hidden="true">↗</span>
        </button>
        <button
          type="button"
          onClick={exportImage}
          disabled={!ready || working || rendered !== recipeQuery(recipe)}
          className="button"
        >
          Export developed PNG <span aria-hidden="true">↓</span>
        </button>
      </div>
      <p className="mt-4 text-[10px] leading-5 text-muted">
        Your photo stays in this browser. JPG, PNG or WebP up to 12 MB; exports are resized to a
        maximum 1600 px edge.
      </p>
      <p
        role="status"
        aria-live="polite"
        data-preview-status
        className="min-h-18 pt-3 text-xs leading-6 text-muted"
      >
        {fileError ||
          error ||
          (working
            ? 'Developing your preview…'
            : 'Your local preview is ready. Slide across to compare.')}
      </p>
    </section>
  )
}
