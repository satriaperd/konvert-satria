import { convertFile as convertWebP, warmup as warmupWebP } from './webp.js'
import { convertFile as convertAVIF, warmup as warmupAVIF } from './avif.js'
import { convertFile as convertBMP }                         from './bmp.js'

export const FORMAT_STEPS = {
  webp: [
    { id: 'encoder', label: 'Initializing WebP encoder' },
    { id: 'decode',  label: 'Loading & decoding image'  },
    { id: 'encode',  label: 'Encoding to WebP'          },
  ],
  avif: [
    { id: 'encoder', label: 'Initializing AVIF encoder' },
    { id: 'decode',  label: 'Loading & decoding image'  },
    { id: 'encode',  label: 'Encoding to AVIF'          },
  ],
  bmp: [
    { id: 'decode',  label: 'Loading & decoding image'  },
    { id: 'encode',  label: 'Writing BMP data'          },
  ],
}

export const FORMAT_META = {
  webp: { ext: '.webp', mime: 'image/webp', label: 'WebP' },
  avif: { ext: '.avif', mime: 'image/avif', label: 'AVIF' },
  bmp:  { ext: '.bmp',  mime: 'image/bmp',  label: 'BMP'  },
}

export function warmup(format) {
  if (format === 'webp') return warmupWebP()
  if (format === 'avif') return warmupAVIF()
  // BMP has no WASM — nothing to warm up
}

export function convertFile(file, quality, isLossless, format, onStep) {
  if (format === 'webp') return convertWebP(file, quality, isLossless, onStep)
  if (format === 'avif') return convertAVIF(file, quality, isLossless, onStep)
  if (format === 'bmp')  return convertBMP(file,  quality, isLossless, onStep)
  throw new Error(`Unknown format: ${format}`)
}
