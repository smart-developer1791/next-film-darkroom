import type { Recipe } from './recipe'
export type WorkerInput =
  | { type: 'source'; pixels: ArrayBuffer; width: number; height: number }
  | { type: 'develop'; job: number; recipe: Recipe }
export type WorkerOutput =
  | { type: 'result'; pixels: ArrayBuffer; width: number; height: number; job: number }
  | { type: 'error'; job: number; message: string }
