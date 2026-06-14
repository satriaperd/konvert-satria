import { memo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { formatSize, fileTypeLabel, isPDF, isEPS, isSVG } from '../utils/format'

const FilePreviewCard = memo(function FilePreviewCard({ entry, onRemove }) {
  const { id, file, previewUrl, w, h } = entry
  const label = fileTypeLabel(file)
  const cardRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from(cardRef.current, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out' })
  }, [])

  return (
    <div ref={cardRef} className="preview-card">
      <div className="preview-card__thumb">
        {(isPDF(file) || isEPS(file) || isSVG(file))
          ? <div className="preview-card__pdf-ph">{label}</div>
          : <img src={previewUrl} alt={file.name} loading="lazy" />
        }
      </div>
      <div className="preview-card__info">
        <span className="preview-card__name">{file.name}</span>
        <span className="preview-card__meta">
          {fileTypeLabel(file)} · {formatSize(file.size)}{w ? ` · ${w}×${h}` : ''}
        </span>
      </div>
      <button
        className="remove-btn"
        onClick={() => onRemove(id)}
        title="Remove"
        aria-label={`Remove ${file.name}`}
      >×</button>
    </div>
  )
})

export default FilePreviewCard
