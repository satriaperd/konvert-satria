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

export function enlargedTip(convMode) {
  if (convMode === 'lossless')
    return 'Lossless WebP dari sumber JPEG memang lebih besar — coba mode Lossy.'
  return 'WebP quality terlalu tinggi untuk sumber ini — coba turunkan di bawah 75%.'
}

export function isJpeg(file) {
  return file.type === 'image/jpeg' || /\.(jpg|jpeg)$/i.test(file.name)
}

let _uid = 0
export const uid = () => `f${++_uid}`
