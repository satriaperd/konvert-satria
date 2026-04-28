import { useState } from 'react'

const MODES = ['lossy', 'lossless']

export default function OptionsPanel({ mode, quality, onMode, onQuality }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <section className="options-panel">
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

      {mode === 'lossy' && (
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

      {infoOpen && (
        <div className="info-card">
          <div className="info-card__grid">
            <div className="info-card__col">
              <span className="badge badge--warn">Lossy</span>
              <p>Discards some image data to shrink file size. At 80%+ quality, the difference is barely visible. Best for web photos, blog content, and social media.</p>
              <p className="stat">Typical savings vs JPEG: <strong>25–75%</strong></p>
            </div>
            <div className="info-card__col">
              <span className="badge badge--ok">Lossless</span>
              <p>No data discarded — uses WebP at quality=100. Output dari sumber JPEG <strong>hampir selalu lebih besar</strong> karena JPEG sudah lossy. Ideal untuk PNG/screenshot.</p>
              <p className="stat">Vs JPEG sumber: biasanya <strong>lebih besar</strong></p>
            </div>
          </div>
          <p className="info-card__note">
            ⚑ Browser "lossless" = WebP quality=100 (near-lossless). For true pixel-perfect lossless, use CLI tools like cwebp.
          </p>
        </div>
      )}
    </section>
  )
}
