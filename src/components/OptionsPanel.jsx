import { useState } from 'react'

const MODES   = ['lossy', 'lossless']
const FORMATS = [
  { id: 'webp', label: 'WebP' },
  { id: 'avif', label: 'AVIF' },
  { id: 'bmp',  label: 'BMP'  },
]

export default function OptionsPanel({ mode, quality, outputFormat, onMode, onQuality, onFormat }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <section className="options-panel">

      {/* Format selector */}
      <div className="options-row">
        <div>
          <span className="field-label">Output format</span>
          <div className="tabs--boxed" role="tablist">
            {FORMATS.map(f => (
              <button
                key={f.id}
                className={`tab${outputFormat === f.id ? ' is-active' : ''}`}
                role="tab"
                aria-selected={outputFormat === f.id}
                onClick={() => onFormat(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AVIF slow-encoding warning */}
      {outputFormat === 'avif' && (
        <div className="format-warn" role="alert">
          <strong>Heads up:</strong> AVIF encoding is significantly slower than WebP — expect 5–20 seconds per image. This is normal behavior from the AVIF encoder (libaom).
        </div>
      )}

      {/* BMP note */}
      {outputFormat === 'bmp' && (
        <div className="format-note">
          BMP stores raw uncompressed pixel data — no quality settings apply. Output files will be large.
        </div>
      )}

      {/* Compression mode — hidden for BMP */}
      {outputFormat !== 'bmp' && (
        <div className="options-row">
          <div>
            <span className="field-label">Compression mode</span>
            <div className="tabs--boxed" role="tablist">
              {MODES.map(m => (
                <button
                  key={m}
                  className={`tab${mode === m ? ' is-active' : ''}`}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => onMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            className={`info-toggle${infoOpen ? ' is-open' : ''}`}
            type="button"
            onClick={() => setInfoOpen(o => !o)}
          >
            {infoOpen ? '✕ Close' : "ⓘ What's the difference?"}
          </button>
        </div>
      )}

      {/* Quality slider — only for lossy mode, not BMP */}
      {outputFormat !== 'bmp' && mode === 'lossy' && (
        <div className="quality-row">
          <div className="quality-header">
            <span className="field-label" style={{ marginBottom: 0 }}>Quality</span>
            <span className="quality-val">{quality}%</span>
          </div>
          <input
            type="range"
            className="quality-slider"
            min={1} max={100} value={quality}
            onChange={e => onQuality(Number(e.target.value))}
            aria-label="Compression quality"
          />
          <div className="quality-hints">
            <span>1% — smallest file</span>
            <span>100% — max quality</span>
          </div>
        </div>
      )}

      {/* Info card */}
      {outputFormat !== 'bmp' && infoOpen && (
        <div className="info-card">
          <div className="info-card__grid">
            <div className="info-card__col">
              <span className="badge badge--warn">Lossy</span>
              <p>Discards some image data to shrink file size. At 80%+ quality, the difference is barely visible. Best for web photos, blog content, and social media.</p>
              <p className="stat">Typical savings vs JPEG: <strong>25–75%</strong></p>
            </div>
            <div className="info-card__col">
              <span className="badge badge--ok">Lossless</span>
              <p>No data discarded — encodes at quality=100. Output dari sumber JPEG <strong>hampir selalu lebih besar</strong> karena JPEG sudah lossy. Ideal untuk PNG/screenshot.</p>
              <p className="stat">Vs JPEG sumber: biasanya <strong>lebih besar</strong></p>
            </div>
          </div>
          <p className="info-card__note">
            ⚑ Browser "lossless" = encoder quality=100 (near-lossless). For true pixel-perfect lossless, use CLI tools.
          </p>
        </div>
      )}
    </section>
  )
}
