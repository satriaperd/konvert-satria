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

// Exported so eps.js can reuse the same SVG pipeline after GS converts EPS → PDF
export async function renderToSVG(page) {
  const viewport = page.getViewport({ scale: 1 })
  const operatorList = await page.getOperatorList()
  const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
  svgGfx.embedFonts = false
  const svgEl = await svgGfx.getSVG(operatorList, viewport)
  const svg = sanitizeSVG(new XMLSerializer().serializeToString(svgEl))
  return {
    buffer: new TextEncoder().encode(svg).buffer,
    w: Math.round(viewport.width),
    h: Math.round(viewport.height),
  }
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
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
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
