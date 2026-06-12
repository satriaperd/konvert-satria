import { useState, useRef, useLayoutEffect } from 'react'

const IMG_FORMATS = [
  { id: 'webp', label: 'WebP' },
  { id: 'avif', label: 'AVIF' },
  { id: 'bmp',  label: 'BMP'  },
]

const PDF_FORMATS = [
  { id: 'svg', label: 'SVG' },
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' },
]

function useTabIndicator(containerRef, indicatorRef, activeId) {
  useLayoutEffect(() => {
    const container = containerRef.current
    const indicator = indicatorRef.current
    if (!container || !indicator) return
    const active = container.querySelector('.tab.is-active')
    if (!active) return
    indicator.style.left  = active.offsetLeft + 'px'
    indicator.style.width = active.offsetWidth + 'px'
  }, [activeId, containerRef, indicatorRef])
}

export default function OptionsPanel({ mode, quality, outputFormat, onMode, onQuality, onFormat, inputType, t }) {
  const [infoOpen, setInfoOpen] = useState(false)

  const fmtTabsRef  = useRef(null)
  const fmtIndRef   = useRef(null)
  const modeTabsRef = useRef(null)
  const modeIndRef  = useRef(null)

  useTabIndicator(fmtTabsRef,  fmtIndRef,  outputFormat)
  useTabIndicator(modeTabsRef, modeIndRef, mode)

  const isPdfMode   = inputType === 'pdf'
  const formats     = isPdfMode ? PDF_FORMATS : IMG_FORMATS
  const isBmp       = outputFormat === 'bmp'
  const isSvg       = outputFormat === 'svg'
  const isPng       = outputFormat === 'png'
  const showMode    = !isBmp && !isSvg && !isPng && outputFormat !== 'jpg'
  const showQuality = outputFormat === 'jpg' || (showMode && mode === 'lossy')

  return (
    <section className="options-panel">

      {/* Format selector */}
      <div className="options-row">
        <div>
          <span className="field-label">{t.outputFormat}</span>
          <div className="tabs--boxed" role="tablist" ref={fmtTabsRef}>
            <span className="tab-indicator" ref={fmtIndRef} aria-hidden="true" />
            {formats.map(f => (
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

      {/* Format notes */}
      {outputFormat === 'avif' && (
        <div className="format-warn" role="alert">
          <strong>{t.avifWarnBold}</strong> {t.avifWarnText}
        </div>
      )}
      {outputFormat === 'bmp' && (
        <div className="format-note">{t.bmpNote}</div>
      )}
      {isSvg && (
        <div className="format-note">{t.svgNote}</div>
      )}
      {isPdfMode && (
        <div className="format-note">{t.pdfNote}</div>
      )}

      {/* Compression mode — only for webp / avif */}
      {showMode && (
        <div className="options-row">
          <div>
            <span className="field-label">{t.compressionMode}</span>
            <div className="tabs--boxed" role="tablist" ref={modeTabsRef}>
              <span className="tab-indicator" ref={modeIndRef} aria-hidden="true" />
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
      {showQuality && (
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
      {showMode && infoOpen && (
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
