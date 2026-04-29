function StepIcon({ status }) {
  if (status === 'active') return <span className="step-spinner" aria-hidden="true" />
  if (status === 'done')   return '✓'
  if (status === 'error')  return '✕'
  return '○'
}

export default function ProcessingScreen({ fileStatuses, onViewResults }) {
  const total      = fileStatuses.length
  const doneCount  = fileStatuses.filter(s => s.status === 'done').length
  const errCount   = fileStatuses.filter(s => s.status === 'error').length
  const allSettled = fileStatuses.every(s => s.status === 'done' || s.status === 'error')
  const hasError   = errCount > 0

  return (
    <main className="app-main">
      <section className="proc-section">

        {/* Header */}
        <div className="proc-header">
          <div>
            <h2 className="proc-title">
              {allSettled ? `${doneCount} of ${total} converted` : 'Converting images…'}
            </h2>
            {allSettled && (
              <p className="proc-sub">
                {hasError ? `${errCount} file${errCount > 1 ? 's' : ''} failed — check details below.` : 'All done!'}
              </p>
            )}
          </div>
          {allSettled && doneCount > 0 && (
            <button className="btn btn--primary" onClick={onViewResults}>
              View Results →
            </button>
          )}
        </div>

        {/* Global error alert */}
        {allSettled && hasError && (
          <div className="proc-alert" role="alert">
            <strong>Some files could not be converted.</strong>
            {' '}Review the errors below. Successfully converted files are still available.
          </div>
        )}

        {/* Per-file checklist */}
        <div className="file-status-list">
          {fileStatuses.map(fs => {
            const isExpanded = fs.status === 'active' || fs.status === 'done' || fs.status === 'error'
            return (
              <div key={fs.id} className={`file-status file-status--${fs.status}`}>
                <div className="file-status__head">
                  <span className="file-status__name">{fs.fileName}</span>
                  <span className={`file-status__tag file-status__tag--${fs.status}`}>
                    {fs.status === 'pending'  && 'Waiting'}
                    {fs.status === 'active'   && 'Processing…'}
                    {fs.status === 'done'     && '✓ Done'}
                    {fs.status === 'error'    && '✕ Failed'}
                  </span>
                </div>

                {isExpanded && (
                  <div className="step-list">
                    {fs.steps.map(step => (
                      <div key={step.id} className={`step-item step--${step.status}`}>
                        <span className={`step-icon step-icon--${step.status}`}>
                          <StepIcon status={step.status} />
                        </span>
                        <span className="step-label">{step.label}</span>
                      </div>
                    ))}
                    {fs.error && (
                      <p className="step-error">{fs.error}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </section>
    </main>
  )
}
