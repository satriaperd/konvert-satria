// Bypass @jsquash/avif/encode.js to avoid its conditional dynamic import of
// avif_enc_mt.js (IIFE format), which breaks Vite's code-splitting build.
// We use the single-threaded encoder directly with locateFile overriding WASM path.
import avifEncFactory     from '@jsquash/avif/codec/enc/avif_enc.js'
import { initEmscriptenModule } from '@jsquash/avif/utils.js'
import avifEncUrl         from '@jsquash/avif/codec/enc/avif_enc.wasm?url'

const DEFAULT_OPTIONS = {
  quality: 50, qualityAlpha: -1, denoiseLevel: 0,
  tileColsLog2: 0, tileRowsLog2: 0, speed: 6,
  subsample: 1, chromaDeltaQ: false, sharpness: 0,
  tune: 0, enableSharpYUV: false, bitDepth: 8, lossless: false,
}

let _ready = null

export function warmup() {
  _ready ??= initEmscriptenModule(avifEncFactory, undefined, {
    locateFile: () => avifEncUrl,
  })
  return _ready
}

const MAX_DIM = 2000

function resizeDims(w, h) {
  if (w <= MAX_DIM && h <= MAX_DIM) return { w, h, resized: false }
  const s = MAX_DIM / Math.max(w, h)
  return { w: Math.round(w * s), h: Math.round(h * s), resized: true }
}

export async function convertFile(file, quality, isLossless, onStep) {
  onStep('encoder', 'active')
  const mod = await warmup()
  onStep('encoder', 'done')

  onStep('decode', 'active')
  const bitmap = await createImageBitmap(file)
  const { w, h, resized } = resizeDims(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const imageData = ctx.getImageData(0, 0, w, h)
  onStep('decode', 'done')

  onStep('encode', 'active')
  const opts = isLossless
    ? { ...DEFAULT_OPTIONS, lossless: true, quality: 100, speed: 8 }
    : { ...DEFAULT_OPTIONS, quality, lossless: false, speed: 8 }
  const output = mod.encode(new Uint8Array(imageData.data.buffer), w, h, opts)
  if (!output) throw new Error('AVIF encoding failed')
  onStep('encode', 'done')

  return { buffer: output.buffer, w, h, resized }
}
