import gsWasmUrl from '@jspawn/ghostscript-wasm/gs.wasm?url'
import { convertFromData } from './pdf.js'

let _gs = null

async function loadGhostscript() {
  if (_gs) return _gs
  // Dynamic import = code-split by Vite; GS JS (~108 KB) + WASM (15 MB) only
  // download when the user actually converts an EPS file
  const { default: initGS } = await import('@jspawn/ghostscript-wasm')
  _gs = await initGS({ locateFile: () => gsWasmUrl })
  return _gs
}

async function epsToPDFBytes(epsBytes, gs) {
  gs.FS.writeFile('/input.eps', epsBytes)
  const code = gs.callMain([
    '-dNOPAUSE', '-dBATCH', '-dSAFER',
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.7',
    '-sOutputFile=/output.pdf',
    '/input.eps',
  ])
  if (code !== 0) throw new Error(`EPS conversion failed (exit ${code})`)
  const pdf = gs.FS.readFile('/output.pdf')
  try { gs.FS.unlink('/input.eps') } catch {}
  try { gs.FS.unlink('/output.pdf') } catch {}
  return pdf
}

export async function convertFile(file, quality, isLossless, format, onStep) {
  // Step 1 — lazy-load Ghostscript WASM (cached after first use)
  onStep('getting_ready', 'active')
  const gs = await loadGhostscript()
  onStep('getting_ready', 'done')

  // Step 2 — EPS → PDF via Ghostscript (runs synchronously in WASM)
  onStep('load_eps', 'active')
  const epsBytes = new Uint8Array(await file.arrayBuffer())
  const pdfBytes = await epsToPDFBytes(epsBytes, gs)
  onStep('load_eps', 'done')

  // Step 3 — PDF → SVG via existing pdf.js pipeline (reuses renderToSVG + sanitize)
  return convertFromData(pdfBytes, quality, format, onStep)
}
