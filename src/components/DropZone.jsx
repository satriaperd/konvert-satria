import { useState, useRef, useCallback } from 'react'

export default function DropZone({ onFiles }) {
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
        aria-label="Drop JPG files here, or press Enter to browse"
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
          accept=".jpg,.jpeg,image/jpeg"
          hidden
          onChange={handleChange}
        />
        <svg className="dz-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 8v24M14 22l10 10 10-10" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 38h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="drop-zone__title">Drop your JPG files here</p>
        <p className="drop-zone__sub">
          or{' '}
          <button
            className="link-btn"
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          >
            browse files
          </button>
        </p>
        <div className="drop-zone__chips">
          <span className="badge">JPEG / JPG</span>
          <span className="badge">Batch supported</span>
          <span className="badge badge--ok">100% client-side</span>
        </div>
      </div>
    </section>
  )
}
