import { convertFile as convertWebP, warmup as warmupWebP } from './webp.js'
import { convertFile as convertAVIF, warmup as warmupAVIF } from './avif.js'
import { convertFile as convertBMP }                         from './bmp.js'
import { convertFile as convertPDF }                         from './pdf.js'

export const FORMAT_STEPS = {
  webp: [
    { id: 'encoder', labelKey: 'encoder_webp', label: 'Initializing WebP encoder' },
    { id: 'decode',  labelKey: 'decode',        label: 'Loading & decoding image'  },
    { id: 'encode',  labelKey: 'encode_webp',   label: 'Encoding to WebP'          },
  ],
  avif: [
    { id: 'encoder', labelKey: 'encoder_avif', label: 'Initializing AVIF encoder' },
    { id: 'decode',  labelKey: 'decode',        label: 'Loading & decoding image'  },
    { id: 'encode',  labelKey: 'encode_avif',   label: 'Encoding to AVIF'          },
  ],
  bmp: [
    { id: 'decode',  labelKey: 'decode',       label: 'Loading & decoding image' },
    { id: 'encode',  labelKey: 'encode_bmp',   label: 'Writing BMP data'         },
  ],
  svg: [
    { id: 'load_pdf', labelKey: 'load_pdf',   label: 'Loading PDF'      },
    { id: 'render',   labelKey: 'render_svg', label: 'Rendering to SVG' },
  ],
  png: [
    { id: 'load_pdf', labelKey: 'load_pdf',   label: 'Loading PDF'      },
    { id: 'render',   labelKey: 'render_png', label: 'Rendering to PNG' },
  ],
  jpg: [
    { id: 'load_pdf', labelKey: 'load_pdf',   label: 'Loading PDF'      },
    { id: 'render',   labelKey: 'render_jpg', label: 'Rendering to JPG' },
  ],
}

export const FORMAT_META = {
  webp: { ext: '.webp', mime: 'image/webp',    label: 'WebP' },
  avif: { ext: '.avif', mime: 'image/avif',    label: 'AVIF' },
  bmp:  { ext: '.bmp',  mime: 'image/bmp',     label: 'BMP'  },
  svg:  { ext: '.svg',  mime: 'image/svg+xml', label: 'SVG'  },
  png:  { ext: '.png',  mime: 'image/png',     label: 'PNG'  },
  jpg:  { ext: '.jpg',  mime: 'image/jpeg',    label: 'JPG'  },
}

export const PDF_OUTPUT_FORMATS = ['svg', 'png', 'jpg']
export const IMG_OUTPUT_FORMATS = ['webp', 'avif', 'bmp']

export function warmup(format) {
  if (format === 'webp') return warmupWebP()
  if (format === 'avif') return warmupAVIF()
}

export function convertFile(file, quality, isLossless, format, onStep) {
  if (format === 'webp') return convertWebP(file, quality, isLossless, onStep)
  if (format === 'avif') return convertAVIF(file, quality, isLossless, onStep)
  if (format === 'bmp')  return convertBMP(file,  quality, isLossless, onStep)
  if (PDF_OUTPUT_FORMATS.includes(format)) return convertPDF(file, quality, isLossless, format, onStep)
  throw new Error(`Unknown format: ${format}`)
}
