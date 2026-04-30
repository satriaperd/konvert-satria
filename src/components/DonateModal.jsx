import { useEffect, useCallback } from 'react'

export default function DonateModal({ onClose, t }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">{t.donateModalTitle}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="modal-desc">{t.donateModalDesc}</p>

        <div className="modal-options">
          <a
            className="donate-option"
            href="https://trakteer.id/satriaperd/tip"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <span className="donate-option__name">{t.donateTrakteerLabel}</span>
            <span className="donate-option__sub">{t.donateTrakteerSub}</span>
          </a>

          <a
            className="donate-option"
            href="https://ko-fi.com/satriaperd"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <span className="donate-option__name">{t.donateKofiLabel}</span>
            <span className="donate-option__sub">{t.donateKofiSub}</span>
          </a>
        </div>

        <button className="btn btn--ghost btn--sm modal-cancel" onClick={onClose}>
          {t.donateCancel}
        </button>

      </div>
    </div>
  )
}
