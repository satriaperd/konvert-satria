export function formatSize(bytes) {
  if (bytes < 1024)        return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export function pctSaved(orig, converted) {
  return Math.round(((orig - converted) / orig) * 100)
}

export function savingsClass(pct) {
  if (pct >= 30) return 'ok'
  if (pct >= 10) return 'warn'
  if (pct > 0)   return 'info'
  return 'err'
}

export function savingsLabel(pct) {
  if (pct > 0)   return `▼ ${pct}% smaller`
  if (pct === 0) return '= no change'
  return `▲ ${Math.abs(pct)}% larger`
}

export function classifyError(err) {
  const msg = String(err?.message || err || '')

  if (/EPS conversion failed|exit \d/.test(msg))
    return { human: 'The EPS file could not be parsed — it may be corrupt or use unsupported PostScript features.', detail: msg }
  if (/Failed to load EPS converter/i.test(msg))
    return { human: 'Could not load the EPS converter. Check your internet connection and try again.', detail: msg }
  if (/AVIF encoding failed/i.test(msg))
    return { human: 'AVIF encoding failed. Try a smaller image or switch to WebP.', detail: msg }
  if (/Failed to render SVG|SVG has zero dimensions/i.test(msg))
    return { human: 'The SVG could not be rendered — it may be corrupt or have an invalid structure.', detail: msg }
  if (/Canvas export failed/i.test(msg))
    return { human: 'Could not export the image — the file may be too large for this browser.', detail: msg }
  if (/Unknown IR type/i.test(msg))
    return { human: 'This PDF contains unsupported vector features. Try exporting as PNG or JPG instead.', detail: msg }
  if (/Unknown format/i.test(msg))
    return { human: 'This file format is not supported.', detail: msg }
  if (/out of memory/i.test(msg))
    return { human: 'Not enough memory to convert this file. Try a smaller image or close other browser tabs.', detail: msg }

  return { human: 'Something went wrong during conversion.', detail: msg || 'No additional details available.' }
}

export function isPDF(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

export function isEPS(file) {
  return (
    file.type === 'application/postscript' ||
    file.type === 'image/x-eps' ||
    /\.eps$/i.test(file.name)
  )
}

export function isSVG(file) {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
}

export function isSupported(file) {
  const TYPES = [
    'image/jpeg', 'image/png', 'image/svg+xml',
    'application/pdf',
    'application/postscript', 'image/x-eps',
  ]
  if (TYPES.includes(file.type)) return true
  return /\.(jpg|jpeg|png|svg|pdf|eps)$/i.test(file.name)
}

export function fileTypeLabel(file) {
  if (file.type === 'image/png')            return 'PNG'
  if (file.type === 'image/svg+xml')        return 'SVG'
  if (file.type === 'image/jpeg')           return 'JPEG'
  if (file.type === 'application/pdf')      return 'PDF'
  if (file.type === 'application/postscript' ||
      file.type === 'image/x-eps')          return 'EPS'
  const ext = file.name.split('.').pop()?.toUpperCase()
  return ext || 'IMAGE'
}

let _uid = 0
export const uid = () => `f${++_uid}`
