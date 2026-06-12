export const STRINGS = {
  en: {
    // Header
    tagline: 'Image Converter',
    privacyBadge: '🔒 runs locally',
    langBtn: 'ID',

    // DropZone
    dropTitle: 'Drop your images here',
    dropOr: 'or',
    dropBrowse: 'browse files',

    // OptionsPanel
    outputFormat: 'Output format',
    compressionMode: 'Compression mode',
    lossy: 'Lossy',
    lossless: 'Lossless',
    infoToggle: "ⓘ What's the difference?",
    infoClose: '✕ Close',
    quality: 'Quality',
    qualityMin: '1% — smallest file',
    qualityMax: '100% — max quality',
    avifWarnBold: 'Heads up:',
    avifWarnText: 'AVIF encoding is significantly slower than WebP — expect 5–20 seconds per image. This is normal behavior from the AVIF encoder (libaom).',
    bmpNote: 'BMP stores raw uncompressed pixel data — no quality settings apply. Output files will be large.',
    pdfNote: 'Only the first page is exported. SVG preserves vector paths for Figma import.',
    svgNote: 'Vector output — import directly into Figma, Illustrator, or any vector editor.',
    infoLossyDesc: 'Discards some image data to shrink file size. At 80%+ quality, the difference is barely visible. Best for web photos, blog content, and social media.',
    infoLossyStat: 'Typical savings vs JPEG: 25–75%',
    infoLosslessDesc: 'No data discarded — encodes at quality=100. Output from a JPEG source is almost always larger because JPEG is already lossy. Ideal for PNG/screenshots.',
    infoLosslessStat: 'Vs JPEG source: usually larger',
    infoNote: '⚑ Browser "lossless" = encoder quality=100 (near-lossless). For true pixel-perfect lossless, use CLI tools.',

    // Files section
    filesLabel: 'Files',
    total: (size) => `${size} total`,
    convertOne: 'Convert 1 image →',
    convertMany: (n) => `Convert all ${n} images →`,
    convertOnePdf: 'Convert 1 PDF →',
    convertManyPdf: (n) => `Convert all ${n} PDFs →`,
    convertOneEps: 'Convert 1 EPS →',
    convertManyEps: (n) => `Convert all ${n} EPS files →`,
    epsNote: 'First use downloads the EPS converter in the background (~15 MB, cached after that).',

    // Processing
    processingTitle: 'Converting images…',
    processingDone: (done, total) => `${done} of ${total} converted`,
    allDone: 'All done!',
    errorsSummary: (n) => `${n} file${n > 1 ? 's' : ''} failed — check details below.`,
    viewResults: 'View Results →',
    procAlert: 'Some files could not be converted. Review the errors below. Successfully converted files are still available.',
    waiting: 'Waiting',
    processing: 'Processing…',
    done: '✓ Done',
    failed: '✕ Failed',

    // Step labels (keyed by labelKey from FORMAT_STEPS)
    steps: {
      encoder_webp: 'Initializing WebP encoder',
      encoder_avif: 'Initializing AVIF encoder',
      decode:       'Loading & decoding image',
      encode_webp:  'Encoding to WebP',
      encode_avif:  'Encoding to AVIF',
      encode_bmp:   'Writing BMP data',
      load_pdf:     'Loading PDF',
      render_svg:   'Rendering to SVG',
      render_png:   'Rendering to PNG',
      render_jpg:   'Rendering to JPG',
      getting_ready: 'Getting things ready (first time only)…',
      load_eps:     'Reading EPS file…',
    },

    // Result screen
    resultTitle: (n) => `${n} image${n !== 1 ? 's' : ''} converted`,
    downloadAll: 'Download All (ZIP)',
    convertMore: '← Convert More',
    before: 'Before',
    after: 'After',

    // Footer & donate modal
    feedback: 'Send Feedback',
    donate: '☕ Buy me a coffee',
    donateModalTitle: 'Pick your currency',
    donateModalDesc: "We'll send you to the right platform.",
    donateTrakteerLabel: 'Trakteer',
    donateTrakteerSub: 'Indonesian Rupiah · IDR',
    donateKofiLabel: 'Ko-fi',
    donateKofiSub: 'All other currencies',
    donateCancel: 'Cancel',
  },

  id: {
    // Header
    tagline: 'Konverter Gambar',
    privacyBadge: '🔒 berjalan lokal',
    langBtn: 'EN',

    // DropZone
    dropTitle: 'Taruh gambarmu di sini',
    dropOr: 'atau',
    dropBrowse: 'pilih file',

    // OptionsPanel
    outputFormat: 'Format output',
    compressionMode: 'Mode kompresi',
    lossy: 'Lossy',
    lossless: 'Lossless',
    infoToggle: 'ⓘ Apa bedanya?',
    infoClose: '✕ Tutup',
    quality: 'Kualitas',
    qualityMin: '1% — file terkecil',
    qualityMax: '100% — kualitas maksimal',
    avifWarnBold: 'Perhatian:',
    avifWarnText: 'Encoding AVIF jauh lebih lambat dari WebP — perkirakan 5–20 detik per gambar. Ini perilaku normal dari encoder AVIF (libaom).',
    bmpNote: 'BMP menyimpan data piksel mentah tanpa kompresi — pengaturan kualitas tidak berlaku. Ukuran file output akan besar.',
    pdfNote: 'Hanya halaman pertama yang diekspor. SVG mempertahankan jalur vektor untuk diimpor ke Figma.',
    svgNote: 'Output vektor — impor langsung ke Figma, Illustrator, atau editor vektor lainnya.',
    infoLossyDesc: 'Membuang sebagian data gambar untuk memperkecil ukuran file. Di kualitas 80%+, perbedaannya hampir tidak terlihat. Cocok untuk foto web, blog, dan media sosial.',
    infoLossyStat: 'Tipikal penghematan vs JPEG: 25–75%',
    infoLosslessDesc: 'Tidak ada data yang dibuang — encode di kualitas=100. Output dari sumber JPEG hampir selalu lebih besar karena JPEG sudah lossy. Ideal untuk PNG/screenshot.',
    infoLosslessStat: 'Vs sumber JPEG: biasanya lebih besar',
    infoNote: '⚑ "Lossless" di browser = kualitas encoder=100 (near-lossless). Untuk lossless pixel-perfect sejati, gunakan tools CLI.',

    // Files section
    filesLabel: 'File',
    total: (size) => `${size} total`,
    convertOne: 'Konversi 1 gambar →',
    convertMany: (n) => `Konversi semua ${n} gambar →`,
    convertOnePdf: 'Konversi 1 PDF →',
    convertManyPdf: (n) => `Konversi semua ${n} PDF →`,
    convertOneEps: 'Konversi 1 EPS →',
    convertManyEps: (n) => `Konversi semua ${n} file EPS →`,
    epsNote: 'Penggunaan pertama mengunduh konverter EPS di latar belakang (~15 MB, tersimpan setelah itu).',

    // Processing
    processingTitle: 'Mengonversi gambar…',
    processingDone: (done, total) => `${done} dari ${total} selesai`,
    allDone: 'Selesai semua!',
    errorsSummary: (n) => `${n} file gagal — cek detail di bawah.`,
    viewResults: 'Lihat Hasil →',
    procAlert: 'Beberapa file tidak bisa dikonversi. Cek error di bawah. File yang berhasil dikonversi tetap tersedia.',
    waiting: 'Menunggu',
    processing: 'Memproses…',
    done: '✓ Selesai',
    failed: '✕ Gagal',

    // Step labels
    steps: {
      encoder_webp: 'Inisialisasi encoder WebP',
      encoder_avif: 'Inisialisasi encoder AVIF',
      decode:       'Memuat & mendekode gambar',
      encode_webp:  'Encoding ke WebP',
      encode_avif:  'Encoding ke AVIF',
      encode_bmp:   'Menulis data BMP',
      load_pdf:     'Memuat PDF',
      render_svg:   'Merender ke SVG',
      render_png:   'Merender ke PNG',
      render_jpg:   'Merender ke JPG',
      getting_ready: 'Sedang menyiapkan (hanya pertama kali)…',
      load_eps:     'Membaca file EPS…',
    },

    // Result screen
    resultTitle: (n) => `${n} gambar dikonversi`,
    downloadAll: 'Unduh Semua (ZIP)',
    convertMore: '← Konversi Lagi',
    before: 'Sebelum',
    after: 'Sesudah',

    // Footer & donate modal
    feedback: 'Kirim Masukan',
    donate: '☕ Donasi Kopi Jago',
    donateModalTitle: 'Pilih mata uangmu',
    donateModalDesc: 'Kita arahkan ke platform yang sesuai.',
    donateTrakteerLabel: 'Trakteer',
    donateTrakteerSub: 'Rupiah Indonesia · IDR',
    donateKofiLabel: 'Ko-fi',
    donateKofiSub: 'Mata uang lainnya',
    donateCancel: 'Batal',
  },
}
