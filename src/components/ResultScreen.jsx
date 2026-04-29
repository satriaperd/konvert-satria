import { formatSize, pctSaved, savingsClass, savingsLabel } from '../utils/format'
import { FORMAT_META } from '../encoders/index.js'

export default function ResultScreen({ results, onDownloadOne, onDownloadAll, onReset }) {
  return (
    <main className="app-main">
      <section className="result-section">

        <div className="result-header">
          <h2 className="result-title">
            {results.length} image{results.length !== 1 ? 's' : ''} converted
          </h2>
          <div className="result-actions">
            {results.length > 1 && (
              <button className="btn btn--secondary" onClick={onDownloadAll}>
                Download All (ZIP)
              </button>
            )}
            <button className="btn btn--ghost" onClick={onReset}>
              ← Convert More
            </button>
          </div>
        </div>

        <div className="files-list">
          {results.map(r => {
            const meta   = FORMAT_META[r.format] || FORMAT_META.webp
            const pct    = pctSaved(r.originalSize, r.outputSize)
            const bigger = pct <= 0
            return (
              <div key={r.id} className={`file-card ${bigger ? 'is-warn' : 'is-done'}`}>

                <div className="file-card__header">
                  <div className="file-card__info">
                    <span className="file-card__name">
                      {r.file.name.replace(/\.(jpg|jpeg|png|svg)$/i, meta.ext)}
                    </span>
                    <span className="file-card__meta">
                      {meta.label} · {r.w}×{r.h}{r.resized ? ' (resized)' : ''}
                    </span>
                  </div>
                </div>

                <div className="file-card__preview">
                  <div className="preview-col">
                    <span className="preview-col__label">Before</span>
                    <div className="preview-img-box">
                      <img src={r.originalUrl} alt="Original" loading="lazy" />
                    </div>
                    <span className="preview-size">{formatSize(r.originalSize)}</span>
                  </div>
                  <div className="preview-arrow">→</div>
                  <div className="preview-col">
                    <span className="preview-col__label">After</span>
                    <div className="preview-img-box">
                      <img src={r.blobUrl} alt="Converted" loading="lazy" />
                    </div>
                    <span className={`preview-size ${bigger ? 'bigger' : 'saved'}`}>
                      {formatSize(r.outputSize)}
                    </span>
                  </div>
                </div>

                <div className="file-card__footer">
                  <div className="card-status">
                    <span className={`savings-pill ${savingsClass(pct)}`}>{savingsLabel(pct)}</span>
                    {r.resized && <span className="savings-pill info">↓ {r.w}×{r.h}</span>}
                  </div>
                  <div className="card-actions">
                    <button className="btn btn--primary btn--sm" onClick={() => onDownloadOne(r)}>
                      ↓ {meta.label}
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </section>
    </main>
  )
}
