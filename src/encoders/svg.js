// SVG → PNG / JPG / WebP / fixed-SVG converter.
// Fixes mismatched viewBox (common in PDF-exported SVGs from stock sites)
// by inserting the SVG into the DOM and using getBBox() on the root content group.

async function fixViewBox(svgText) {
  return new Promise((resolve) => {
    const div = document.createElement('div')
    // Offscreen but not display:none so getBBox() works
    div.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:5000px;height:5000px;overflow:visible;'
    div.innerHTML = svgText
    document.body.appendChild(div)

    requestAnimationFrame(() => {
      try {
        const svgEl = div.querySelector('svg')
        if (!svgEl) { resolve(svgText); return }

        // getBBox() on root <g> gives bounds in SVG user-unit space,
        // accounting for all nested transforms (flip, scale, etc.)
        const rootG = svgEl.querySelector(':scope > g') || svgEl
        let bbox
        try { bbox = rootG.getBBox() } catch { resolve(svgText); return }

        if (!bbox || bbox.width <= 0 || bbox.height <= 0) { resolve(svgText); return }

        // Only fix if content actually extends beyond the declared viewBox
        const vb = svgEl.viewBox.baseVal
        const fits = (
          bbox.x >= vb.x - 1 &&
          bbox.y >= vb.y - 1 &&
          bbox.x + bbox.width  <= vb.x + vb.width  + 1 &&
          bbox.y + bbox.height <= vb.y + vb.height + 1
        )
        if (fits) { resolve(svgText); return }

        // Rebuild with corrected viewBox
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const root = doc.documentElement

        root.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
        root.setAttribute('width',  String(Math.ceil(bbox.width)))
        root.setAttribute('height', String(Math.ceil(bbox.height)))
        root.removeAttribute('preserveAspectRatio')

        resolve(new XMLSerializer().serializeToString(doc))
      } catch {
        resolve(svgText)
      } finally {
        document.body.removeChild(div)
      }
    })
  })
}

async function rasterize(svgText, format, quality) {
  const blob = new Blob([svgText], { type: 'image/svg+xml' })
  const url  = URL.createObjectURL(blob)

  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload  = () => resolve(i)
      i.onerror = () => reject(new Error('Failed to render SVG'))
      i.src = url
    })

    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) throw new Error('SVG has zero dimensions after viewBox fix')

    const canvas = document.createElement('canvas')
    canvas.width  = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
    }
    ctx.drawImage(img, 0, 0)

    const mime = format === 'jpg' ? 'image/jpeg'
               : format === 'webp' ? 'image/webp'
               : 'image/png'
    const q = format === 'png' ? undefined : quality / 100

    const out = await new Promise(r => canvas.toBlob(r, mime, q))
    return { buffer: await out.arrayBuffer(), w, h, resized: false }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function convertFile(file, quality, isLossless, format, onStep) {
  onStep('load_svg', 'active')
  const text  = await file.text()
  const fixed = await fixViewBox(text)
  onStep('load_svg', 'done')

  onStep('render', 'active')

  if (format === 'svg') {
    const outBlob = new Blob([fixed], { type: 'image/svg+xml' })
    const buffer  = await outBlob.arrayBuffer()
    const parser  = new DOMParser()
    const root    = parser.parseFromString(fixed, 'image/svg+xml').documentElement
    const w = parseFloat(root.getAttribute('width'))  || 0
    const h = parseFloat(root.getAttribute('height')) || 0
    onStep('render', 'done')
    return { buffer, w, h, resized: false }
  }

  const result = await rasterize(fixed, format, quality)
  onStep('render', 'done')
  return result
}
