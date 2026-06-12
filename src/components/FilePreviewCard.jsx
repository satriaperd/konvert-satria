import { memo } from 'react'
import { formatSize, fileTypeLabel, isPDF } from '../utils/format'

const FilePreviewCard = memo(function FilePreviewCard({ entry, onRemove }) {
  const { id, file, previewUrl, w, h } = entry
  return (
    <div className="preview-card">
      <div className="preview-card__thumb">
        {isPDF(file)
          ? <div className="preview-card__pdf-ph">PDF</div>
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
