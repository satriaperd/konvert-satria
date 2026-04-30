import { useState } from 'react'

const FORMATS = [
  { id: 'webp', label: 'WebP' },
  { id: 'avif', label: 'AVIF' },
  { id: 'bmp',  label: 'BMP'  },
]

export default function OptionsPanel({ mode, quality, outputFormat, onMode, onQuality, onFormat, t }) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <section className="options-panel">

      {/* Format selector */}
      <div className="options-row">
        <div>
          <span className="field-label">{t.outputFormat}</span>
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
          <strong>{t.avifWarnBold}</strong> {t.avifWarnText}
        </div>
      )}

      {/* BMP note */}
      {outputFormat === 'bmp' && (
        <div className="format-note">{t.bmpNote}</div>
      )}

      {/* Compression mode — hidden for BMP */}
      {outputFormat !== 'bmp' && (
        <div className="options-row">
          <div>
            <span className="field-label">{t.compressionMode}</span>
            <div className="tabs--boxed" role="tablist">
              {['lossy', 'lossless'].map(m => (
                <button
                  key={m}
                  className={`tab${mode === m ? ' is-active' : ''}`}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => onMode(m)}
                >
                  {m === 'lossy' ? t.lossy : t.lossless}
                </button>
              ))}
            </div>
          </div>
          <button
            className={`info-toggle${infoOpen ? ' is-open' : ''}`}
            type="button"
            onClick={() => setInfoOpen(o => !o)}
          >
            {infoOpen ? t.infoClose : t.infoToggle}
          </button>
        </div>
      )}

      {/* Quality slider */}
      {outputFormat !== 'bmp' && mode === 'lossy' && (
        <div className="quality-row">
          <div className="quality-header">
            <span className="field-label" style={{ marginBottom: 0 }}>{t.quality}</span>
            <span className="quality-val">{quality}%</span>
          </div>
          <input
            type="range"
            className="quality-slider"
            min={1} max={100} value={quality}
            onChange={e => onQuality(Number(e.target.value))}
            aria-label={t.quality}
          />
          <div className="quality-hints">
            <span>{t.qualityMin}</span>
            <span>{t.qualityMax}</span>
          </div>
        </div>
      )}

      {/* Info card */}
      {outputFormat !== 'bmp' && infoOpen && (
        <div className="info-card">
          <div className="info-card__grid">
            <div className="info-card__col">
              <span className="badge badge--warn">{t.lossy}</span>
              <p>{t.infoLossyDesc}</p>
              <p className="stat">{t.infoLossyStat}: <strong>25–75%</strong></p>
            </div>
            <div className="info-card__col">
              <span className="badge badge--ok">{t.lossless}</span>
              <p>{t.infoLosslessDesc}</p>
              <p className="stat">{t.infoLosslessStat}</p>
            </div>
          </div>
          <p className="info-card__note">{t.infoNote}</p>
        </div>
      )}
    </section>
  )
}
