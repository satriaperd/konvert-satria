import encodeWebP, { init as initEncoder } from '@jsquash/webp/encode.js'
import webpEncUrl     from '@jsquash/webp/codec/enc/webp_enc.wasm?url'
import webpEncSimdUrl from '@jsquash/webp/codec/enc/webp_enc_simd.wasm?url'

let _ready = null

export function warmup() {
  _ready ??= initEncoder({
    locateFile: (p) => p.includes('simd') ? webpEncSimdUrl : webpEncUrl,
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
  await warmup()
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
  const options = isLossless
    ? { lossless: 1, quality: 100, method: 0 }
    : { quality, lossless: 0, method: 0, use_sharp_yuv: 1 }
  const buffer = await encodeWebP(imageData, options)
  onStep('encode', 'done')

  return { buffer, w, h, resized }
}
