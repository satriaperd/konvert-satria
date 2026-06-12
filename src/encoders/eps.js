import gsJsUrl from '@jspawn/ghostscript-wasm/gs.js?url'
import gsWasmUrl from '@jspawn/ghostscript-wasm/gs.wasm?url'
import { convertFromData } from './pdf.js'

let _gs = null

function injectGSScript(src) {
  return new Promise((resolve, reject) => {
    // Avoid double-injection across multiple EPS conversions
    if (document.querySelector('script[data-ghostscript]')) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.dataset.ghostscript = '1'
    s.onload = resolve
    s.onerror = () => reject(new Error('Failed to load EPS converter'))
    document.head.appendChild(s)
  })
}

async function loadGhostscript() {
  if (_gs) return _gs
  // Load gs.js as a classic (non-module) script tag so its top-level
  // `var Module = ...` binds to globalThis. Vite's CJS→ESM transform
  // intercepts module.exports and breaks globalThis.Module otherwise.
  await injectGSScript(gsJsUrl)
  _gs = await globalThis.Module({ locateFile: () => gsWasmUrl })
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
  onStep('getting_ready', 'active')
  const gs = await loadGhostscript()
  onStep('getting_ready', 'done')

  onStep('load_eps', 'active')
  const epsBytes = new Uint8Array(await file.arrayBuffer())
  const pdfBytes = await epsToPDFBytes(epsBytes, gs)
  onStep('load_eps', 'done')

  return convertFromData(pdfBytes, quality, format, onStep)
}
