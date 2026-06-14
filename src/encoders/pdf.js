import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

function sanitizeSVG(raw) {
  // XMLSerializer sometimes emits <svg:svg>, <svg:path>, etc. — strip the prefix
  let s = raw.replace(/<(\/?)svg:/g, '<$1')
  // Ensure xmlns is present on root
  if (!/<svg[^>]+xmlns=/.test(s)) {
    s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  // Use href instead of xlink:href (Figma prefers SVG 2.0 form)
  s = s.replace(/\s+xmlns:xlink="[^"]*"/g, '')
  s = s.replace(/xlink:href=/g, 'href=')
  return s
}

// Remove specific operator codes from an operator list (returns a shallow copy).
// Used to strip shading ops so SVGGraphics can continue rendering vector content.
function stripOps(opList, ...codes) {
  const skip = new Set(codes)
  const fnArray = [], argsArray = []
  for (let i = 0; i < opList.fnArray.length; i++) {
    if (skip.has(opList.fnArray[i])) continue
    fnArray.push(opList.fnArray[i])
    argsArray.push(opList.argsArray[i])
  }
  return { ...opList, fnArray, argsArray }
}

function svgElementToResult(svgEl, viewport) {
  const svg = sanitizeSVG(new XMLSerializer().serializeToString(svgEl))
  return {
    buffer: new TextEncoder().encode(svg).buffer,
    w: Math.round(viewport.width),
    h: Math.round(viewport.height),
  }
}

// Last-resort canvas render: rasterise to PNG at 2× and store as a
// high-resolution PNG blob (not wrapped in SVG — caller decides the format).
async function renderToCanvas(page, scale = 2) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width  = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  return { canvas, naturalW: Math.round(viewport.width / scale), naturalH: Math.round(viewport.height / scale) }
}

// Three-pass SVG renderer with progressive fallback:
//
//  Pass 1 — Full SVGGraphics render → true vector SVG.
//            Works for most simple PDFs.
//
//  Pass 2 — Strip PDF "sh" (shadingFill) operators, retry SVGGraphics.
//            pdf.js SVGGraphics can render all other operators (paths, text,
//            solid fills, images) but throws on "sh" shading operators.
//            Result: vector SVG with gradient areas simply absent
//            (transparent). All paths, outlines, solid fills preserved.
//
//  Pass 3 — Canvas rasterize as absolute last resort.
//            Only reached when shading is used via setFillColorN (pattern-
//            space shading) instead of the direct "sh" operator, which
//            means filtering alone isn't enough.
export async function renderToSVG(page) {
  const viewport     = page.getViewport({ scale: 1 })
  const operatorList = await page.getOperatorList()

  // ── Pass 1: full vector ──────────────────────────────────────────────────
  try {
    const gfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
    gfx.embedFonts = false
    return svgElementToResult(await gfx.getSVG(operatorList, viewport), viewport)
  } catch (err) {
    if (!String(err?.message).includes('Unknown IR type')) throw err
    // "sh" shading operator detected — proceed to Pass 2
  }

  // ── Pass 2: strip shadingFill ops + patch instance → vector SVG ─────────
  // OPS.shadingFill (83) = PDF "sh" operator. Stripped from the opList so
  // SVGGraphics never encounters direct shading-fill commands.
  //
  // Shading can also arrive via pattern color space (setFillColorN/
  // setStrokeColorN, opcodes 33/34) — those can't be stripped because they
  // carry non-shading colors too. Instead, patch all three methods so any
  // "Unknown IR type" error is silently swallowed: the element gets no
  // fill/stroke (transparent gap) but all paths/text/solid fills stay vector.
  const shadingFillOp = pdfjsLib.OPS?.shadingFill ?? 83
  try {
    const filteredOpList = stripOps(operatorList, shadingFillOp)
    const gfx2 = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
    gfx2.embedFonts = false
    const silenceUnknownIR = (fn) => (...args) => {
      try { return fn(...args) }
      catch (e) { if (!String(e?.message).includes('Unknown IR type')) throw e }
    }
    for (const method of ['shadingFill', 'setFillColorN', 'setStrokeColorN']) {
      if (typeof gfx2[method] === 'function') {
        gfx2[method] = silenceUnknownIR(gfx2[method].bind(gfx2))
      }
    }
    return svgElementToResult(await gfx2.getSVG(filteredOpList, viewport), viewport)
  } catch {
    // SVGGraphics failed entirely — fall through to raster.
  }

  // ── Pass 3: raster fallback, always wrapped in SVG so output is valid XML ─
  // Raw PNG bytes must NEVER be returned here — the caller expects SVG text and
  // the download filename will be .svg. Wrapping ensures Chrome/Figma can open it.
  const w = Math.round(viewport.width)
  const h = Math.round(viewport.height)
  const { canvas } = await renderToCanvas(page, 2)
  const dataUrl = canvas.toDataURL('image/png')
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<image href="${dataUrl}" x="0" y="0" width="${w}" height="${h}"/>`,
    `</svg>`,
  ].join('')
  return { buffer: new TextEncoder().encode(svg).buffer, w, h }
}

async function renderToRaster(page, mime, quality) {
  const scale = 2
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width  = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  const buffer = await new Promise((res, rej) => {
    canvas.toBlob(
      b => b ? b.arrayBuffer().then(res) : rej(new Error('Canvas export failed')),
      mime,
      quality / 100,
    )
  })
  return {
    buffer,
    w: Math.round(viewport.width / scale),
    h: Math.round(viewport.height / scale),
  }
}

async function renderPage(page, quality, format) {
  if (format === 'svg') return renderToSVG(page)
  return renderToRaster(page, format === 'jpg' ? 'image/jpeg' : 'image/png', quality)
}

// Exported so eps.js can call this after getting PDF bytes from Ghostscript
export async function convertFromData(pdfData, quality, format, onStep) {
  onStep('render', 'active')
  const pdf  = await pdfjsLib.getDocument({ data: pdfData }).promise
  const page = await pdf.getPage(1)
  const result = await renderPage(page, quality, format)
  onStep('render', 'done')
  return { ...result, resized: false }
}

export async function convertFile(file, quality, _isLossless, format, onStep) {
  onStep('load_pdf', 'active')
  const data = await file.arrayBuffer()
  onStep('load_pdf', 'done')
  return convertFromData(data, quality, format, onStep)
}
