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

  // ── Pass 2: strip shadingFill ops → vector SVG without gradient fills ───
  // OPS.shadingFill is the pdf.js internal code for the PDF "sh" operator.
  // Hardcoded to 83 (stable across pdf.js v2–v4) with a live lookup fallback.
  const shadingFillOp = pdfjsLib.OPS?.shadingFill ?? 83
  try {
    const filteredOpList = stripOps(operatorList, shadingFillOp)
    const gfx2 = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
    gfx2.embedFonts = false
    return svgElementToResult(await gfx2.getSVG(filteredOpList, viewport), viewport)
  } catch {
    // Shading referenced via setFillColorN (pattern-space), not "sh" directly.
    // Filtering "sh" wasn't enough — fall through to raster.
  }

  // ── Pass 3: canvas raster (complete visual but not vector) ───────────────
  const { canvas } = await renderToCanvas(page, 2)
  const blob   = await new Promise(r => canvas.toBlob(r, 'image/png'))
  const buffer = await blob.arrayBuffer()
  return { buffer, w: Math.round(viewport.width), h: Math.round(viewport.height) }
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

export async function convertFile(file, quality, isLossless, format, onStep) {
  onStep('load_pdf', 'active')
  const data = await file.arrayBuffer()
  onStep('load_pdf', 'done')
  return convertFromData(data, quality, format, onStep)
}
