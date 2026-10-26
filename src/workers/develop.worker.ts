import { develop } from '../domain/pixels'
import type { WorkerInput, WorkerOutput } from '../domain/worker-protocol'
const scope = self as unknown as {
  onmessage: (event: MessageEvent<WorkerInput>) => void
  postMessage: (message: WorkerOutput, transfer?: Transferable[]) => void
}
let source: Uint8ClampedArray | null = null,
  width = 0,
  height = 0
scope.onmessage = ({ data }) => {
  if (data.type === 'source') {
    source = new Uint8ClampedArray(data.pixels)
    width = data.width
    height = data.height
    return
  }
  try {
    if (!source || source.length !== width * height * 4)
      throw new Error('Choose an image before developing it.')
    const pixels = develop(source, data.recipe)
    scope.postMessage({ type: 'result', pixels: pixels.buffer, width, height, job: data.job }, [
      pixels.buffer,
    ])
  } catch (error) {
    scope.postMessage({
      type: 'error',
      job: data.job,
      message: error instanceof Error ? error.message : 'The preview could not be developed.',
    })
  }
}
