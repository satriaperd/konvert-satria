const MAX_DIM = 2000

function resizeDims(w, h) {
  if (w <= MAX_DIM && h <= MAX_DIM) return { w, h, resized: false }
  const s = MAX_DIM / Math.max(w, h)
  return { w: Math.round(w * s), h: Math.round(h * s), resized: true }
}

function encodeImageDataToBMP(imageData) {
  const { width, height, data } = imageData
  // 24-bit BMP: 3 bytes per pixel, rows padded to 4-byte boundary
  const rowSize = Math.ceil(width * 3 / 4) * 4
  const pixelDataSize = rowSize * height
  const fileSize = 54 + pixelDataSize

  const buf   = new ArrayBuffer(fileSize)
  const view  = new DataView(buf)
  const bytes = new Uint8Array(buf)

  // File header (14 bytes)
  bytes[0] = 0x42; bytes[1] = 0x4D       // 'BM'
  view.setUint32(2,  fileSize,       true) // file size
  view.setUint32(6,  0,              true) // reserved
  view.setUint32(10, 54,             true) // pixel data offset

  // DIB header — BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40,             true) // header size
  view.setInt32( 18, width,          true) // image width
  view.setInt32( 22, -height,        true) // negative = top-down row order
  view.setUint16(26, 1,              true) // color planes
  view.setUint16(28, 24,             true) // bits per pixel
  view.setUint32(30, 0,              true) // compression (none)
  view.setUint32(34, pixelDataSize,  true) // pixel data size
  view.setInt32( 38, 2835,           true) // ~72 DPI horizontal
  view.setInt32( 42, 2835,           true) // ~72 DPI vertical
  view.setUint32(46, 0,              true) // colors in palette
  view.setUint32(50, 0,              true) // important colors

  // Pixel data — BGR order
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4
      const dst = 54 + y * rowSize + x * 3
      bytes[dst]     = data[src + 2] // B
      bytes[dst + 1] = data[src + 1] // G
      bytes[dst + 2] = data[src + 0] // R
    }
  }

  return buf
}

export async function convertFile(file, _quality, _isLossless, onStep) {
  onStep('decode', 'active')
  const bitmap = await createImageBitmap(file)
  const { w, h, resized } = resizeDims(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const imageData = ctx.getImageData(0, 0, w, h)
  onStep('decode', 'done')

  onStep('encode', 'active')
  const buffer = encodeImageDataToBMP(imageData)
  onStep('encode', 'done')

  return { buffer, w, h, resized }
}
