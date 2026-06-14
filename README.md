# Konvert

A fast, privacy-first image converter that runs entirely in your browser. No server, no uploads, no accounts — just drop your files and convert.

**Live:** [konvert.cimangclub.my.id](https://konvert.cimangclub.my.id)

---

## What it does

Konvert handles a bunch of formats that are usually a pain to deal with:

- Convert **JPEG / PNG** images to WebP, AVIF, or BMP
- Convert **PDF** files to SVG, PNG, or JPG (first page)
- Convert **EPS** vector files to SVG, PNG, or JPG
- Convert **SVG** files to PNG, JPG, WebP — or clean them up and re-export as SVG

Everything happens locally in your browser. Your files never leave your device.

---

## Features

- **Wide format support** — JPEG, PNG, SVG, PDF, and EPS as input; WebP, AVIF, BMP, SVG, PNG, JPG as output
- **SVG auto-fix** — automatically corrects clipped or cropped SVGs, which is super common with files from Vecteezy and similar stock sites
- **Lossy & lossless modes** — with a quality slider for fine-grained control
- **Auto-resize** — images larger than 2000px on either axis are scaled down proportionally before encoding
- **Batch conversion** — drop multiple files, convert them all, download as a ZIP
- **Clear error messages** — if something goes wrong, you get a plain-English explanation and an expandable panel with the technical details if you need them
- **100% client-side** — nothing is uploaded anywhere
- **Dark mode** — follows your system preference, and you can toggle it manually
- **EN / ID** language switch
- Responsive layout that works on mobile and desktop

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 + Vite 5 |
| WebP encoding | `@jsquash/webp` (WASM) |
| AVIF encoding | `@jsquash/avif` (WASM, single-thread) |
| BMP encoding | Pure JS (no dependencies) |
| PDF & EPS rendering | `pdfjs-dist` v3 |
| EPS → PDF conversion | `@jspawn/ghostscript-wasm` |
| ZIP packaging | JSZip |
| Fonts | Space Grotesk + JetBrains Mono |
| Design system | BlitzUI (refined brutalism, custom) |

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── components/         # UI components (Header, Footer, DropZone, OptionsPanel, …)
├── encoders/
│   ├── index.js        # Format dispatch + step definitions + FORMAT_META
│   ├── webp.js         # JPEG/PNG → WebP via @jsquash/webp
│   ├── avif.js         # JPEG/PNG → AVIF via @jsquash/avif (single-thread)
│   ├── bmp.js          # JPEG/PNG → BMP (pure JS encoder)
│   ├── pdf.js          # PDF → SVG / PNG / JPG via pdf.js
│   ├── eps.js          # EPS → PDF (Ghostscript WASM) → SVG / PNG / JPG
│   └── svg.js          # SVG → fixed SVG / PNG / JPG / WebP
├── styles/
│   ├── tokens.css      # Design tokens (colors, spacing, typography)
│   └── app.css         # Component styles
├── utils/
│   └── format.js       # File type checks, size formatting, error classification
├── i18n.js             # EN/ID translation strings
├── version.js          # Single-source version string
└── App.jsx             # App state, screen routing, conversion orchestration

public/
├── .htaccess           # WASM MIME type + UTF-8 + cache headers (Apache)
├── robots.txt
├── sitemap.xml
└── og-image.png        # Social preview image
```

---

## How It Works

### Images (JPEG / PNG → WebP / AVIF / BMP)

1. File is decoded via `createImageBitmap` and drawn to a canvas
2. If either dimension exceeds 2000px, it's scaled down proportionally
3. Raw `ImageData` is passed to the WASM encoder (or pure-JS for BMP)
4. Output blob is shown in a before/after preview, ready to download

### PDF → SVG / PNG / JPG

PDF rendering is handled by `pdfjs-dist`. Only the first page is exported.

For SVG output, the renderer tries to produce true vector output. If the PDF contains gradient fills that the SVG renderer can't handle, it gracefully skips those elements rather than bailing out entirely — so you still get a vector SVG with the solid paths, text, and shapes intact.

### EPS → SVG / PNG / JPG

EPS files go through a two-step pipeline:

1. **Ghostscript WASM** converts the EPS to a PDF in-browser (first use downloads ~15 MB, cached after that)
2. The resulting PDF is then handled the same way as any other PDF input

The EPS bounding box (`%%BoundingBox` / `%%HiResBoundingBox`) is read from the file header and used to set the exact PDF page size, so the content isn't clipped.

### SVG auto-fix

Stock-site SVGs often have a `viewBox` that doesn't match the actual content bounds, resulting in clipped or partially invisible artwork. Konvert detects this by inserting the SVG into the DOM, measuring the real content bounds with `getBBox()`, and rewriting the `viewBox`, `width`, and `height` attributes before export.

---

## A note on AVIF encoding

`@jsquash/avif` ships with a multi-threaded encoder (`avif_enc_mt.js`) that breaks Vite's bundler because of its IIFE format. Konvert bypasses it by importing the single-threaded encoder (`avif_enc.js`) directly. AVIF encoding is noticeably slower than WebP as a result — usually 5–20 seconds per image — but it works reliably across all environments.

---

## Deployment

Static site, deployed on Apache. Build with `npm run build` and copy the contents of `dist/` to your document root. The included `public/.htaccess` takes care of the WASM MIME type, UTF-8 charset, and cache headers.

---

## License

MIT
