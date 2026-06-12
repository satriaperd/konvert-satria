import gsJsUrl from '@jspawn/ghostscript-wasm/gs.js?url'
import gsWasmUrl from '@jspawn/ghostscript-wasm/gs.wasm?url'
import { convertFromData } from './pdf.js'

let _gs = null

function injectGSScript(src) {
  return new Promise((resolve, reject) => {
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

// Read %%BoundingBox or %%HiResBoundingBox from EPS DSC header.
// Most stock-site EPS files declare this in the first few KB; some put it
// at the end via "(atend)" — we scan both regions to handle both cases.
function parseBoundingBox(epsBytes) {
  const decode = (slice) =>
    new TextDecoder('utf-8', { fatal: false }).decode(slice)

  const head = decode(epsBytes.slice(0, 8192))
  // Also check the trailer for (atend) declarations
  const tail = epsBytes.length > 8192
    ? decode(epsBytes.slice(-4096))
    : ''

  const text = head + tail

  // HiResBoundingBox has sub-point precision — prefer it
  const m =
    text.match(/%%HiResBoundingBox:\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)/) ||
    text.match(/%%BoundingBox:\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)/)

  if (!m) return null

  const [llx, lly, urx, ury] = [m[1], m[2], m[3], m[4]].map(Number)
  if ([llx, lly, urx, ury].some(isNaN)) return null

  const width  = Math.ceil(urx - llx)
  const height = Math.ceil(ury - lly)
  if (width <= 0 || height <= 0) return null

  return { width, height }
}

async function epsToPDFBytes(epsBytes, gs) {
  gs.FS.writeFile('/input.eps', epsBytes)

  // Read the EPS canvas size so the PDF page matches it exactly.
  // Without this, Ghostscript defaults to US Letter (612×792 pts) and
  // clips anything outside that area — causing missing objects in the SVG output.
  const bbox = parseBoundingBox(epsBytes)

  const args = [
    '-dNOPAUSE', '-dBATCH', '-dSAFER',
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.7',
    '-dEPSCrop',   // Use %%BoundingBox as the PDF crop/page box
  ]

  if (bbox) {
    // Lock the page size to the exact EPS canvas dimensions
    args.push(
      `-dDEVICEWIDTHPOINTS=${bbox.width}`,
      `-dDEVICEHEIGHTPOINTS=${bbox.height}`,
      '-dFIXEDMEDIA',   // Prevent Ghostscript from auto-selecting a different media size
    )
  }

  args.push('-sOutputFile=/output.pdf', '/input.eps')

  const code = gs.callMain(args)
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
