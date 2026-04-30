# Konvert

A fast, privacy-first image converter that runs entirely in your browser. No server uploads, no accounts — just drop your images and convert.

**Live:** [konvert.cimangclub.my.id](https://konvert.cimangclub.my.id)

---

## Features

- **Input formats:** JPEG, PNG, SVG
- **Output formats:** WebP, AVIF, BMP
- **Lossy & lossless** compression modes with adjustable quality slider
- **Auto-resize** — images wider/taller than 2000px are scaled down automatically
- **Batch conversion** — convert multiple files at once, download as ZIP
- **100% client-side** — images never leave your device
- **Dark mode** — follows system preference, togglable
- **EN / ID** language switch
- Responsive, mobile-friendly layout

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 + Vite 5 |
| WebP encoding | `@jsquash/webp` (WASM) |
| AVIF encoding | `@jsquash/avif` (WASM, single-thread) |
| BMP encoding | Pure JS (no WASM) |
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
├── components/       # Presentational components (Header, Footer, DropZone, …)
├── encoders/         # Format-specific encoders (webp.js, avif.js, bmp.js, index.js)
├── styles/           # tokens.css (design tokens) + app.css (component styles)
├── utils/            # format.js (file validation, size formatting)
├── i18n.js           # EN/ID translation strings
├── version.js        # Single-source version string
└── App.jsx           # App state, screen routing, conversion logic

public/
├── .htaccess         # UTF-8 charset + WASM MIME type + cache headers (Apache)
├── robots.txt
├── sitemap.xml
└── og-image.png      # 1200×630 social preview image
```

---

## How It Works

1. User drops images onto the upload zone (JPEG / PNG / SVG)
2. App reads each file via `createImageBitmap` → draws to canvas → extracts `ImageData`
3. If the image exceeds 2000px on either axis, it's scaled down proportionally before encoding
4. The selected encoder (WebP/AVIF/BMP) processes the raw pixel data entirely in the browser using WebAssembly or pure JS
5. Output is packaged as a `Blob`, shown in a before/after preview, and available for individual or batch (ZIP) download

### AVIF note

`@jsquash/avif` ships with a multi-threaded encoder (`avif_enc_mt.js` — IIFE format) that breaks Vite's Rollup bundler. This project bypasses it by importing the single-threaded `avif_enc.js` directly alongside `initEmscriptenModule` from `@jsquash/avif/utils.js`.

---

## Deployment

The app is deployed as a static site on an Apache subdomain. Copy the contents of `dist/` to the subdomain document root. The included `public/.htaccess` handles UTF-8 charset, WASM MIME type, and caching headers.

---

## License

MIT
