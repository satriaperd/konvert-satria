import { useState, useRef, useCallback } from 'react'

export default function DropZone({ onFiles, t }) {
  const [isOver, setIsOver] = useState(false)
  const inputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsOver(false)
    onFiles([...e.dataTransfer.files])
  }, [onFiles])

  const handleClick = useCallback((e) => {
    if (e.target.closest('.link-btn')) return
    inputRef.current?.click()
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }, [])

  const handleChange = useCallback((e) => {
    onFiles([...e.target.files])
    e.target.value = ''
  }, [onFiles])

  return (
    <section className="upload-section">
      <div
        className={`drop-zone${isOver ? ' is-over' : ''}`}
        tabIndex={0}
        role="button"
        aria-label={t.dropTitle}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.svg,.pdf,.eps,image/jpeg,image/png,image/svg+xml,application/pdf,application/postscript,image/x-eps"
          hidden
          onChange={handleChange}
        />
        <svg className="dz-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 8v24M14 22l10 10 10-10" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 38h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="drop-zone__title">{t.dropTitle}</p>
        <p className="drop-zone__sub">
          {t.dropOr}{' '}
          <button
            className="link-btn"
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          >
            {t.dropBrowse}
          </button>
        </p>
        <div className="drop-zone__chips">
          <span className="badge">JPEG</span>
          <span className="badge">PNG</span>
          <span className="badge">SVG</span>
          <span className="badge">PDF</span>
          <span className="badge">EPS</span>
          <span className="badge badge--ok">100% client-side</span>
        </div>
      </div>
    </section>
  )
}
