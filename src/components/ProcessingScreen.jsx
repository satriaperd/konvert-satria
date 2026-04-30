function StepIcon({ status }) {
  if (status === 'active') return <span className="step-spinner" aria-hidden="true" />
  if (status === 'done')   return '✓'
  if (status === 'error')  return '✕'
  return '○'
}

export default function ProcessingScreen({ fileStatuses, onViewResults, t }) {
  const total      = fileStatuses.length
  const doneCount  = fileStatuses.filter(s => s.status === 'done').length
  const errCount   = fileStatuses.filter(s => s.status === 'error').length
  const allSettled = fileStatuses.every(s => s.status === 'done' || s.status === 'error')
  const hasError   = errCount > 0

  return (
    <main className="app-main">
      <section className="proc-section">

        <div className="proc-header">
          <div>
            <h2 className="proc-title">
              {allSettled ? t.processingDone(doneCount, total) : t.processingTitle}
            </h2>
            {allSettled && (
              <p className="proc-sub">
                {hasError ? t.errorsSummary(errCount) : t.allDone}
              </p>
            )}
          </div>
          {allSettled && doneCount > 0 && (
            <button className="btn btn--primary" onClick={onViewResults}>
              {t.viewResults}
            </button>
          )}
        </div>

        {allSettled && hasError && (
          <div className="proc-alert" role="alert">
            {t.procAlert}
          </div>
        )}

        <div className="file-status-list">
          {fileStatuses.map(fs => {
            const isExpanded = fs.status === 'active' || fs.status === 'done' || fs.status === 'error'
            return (
              <div key={fs.id} className={`file-status file-status--${fs.status}`}>
                <div className="file-status__head">
                  <span className="file-status__name">{fs.fileName}</span>
                  <span className={`file-status__tag file-status__tag--${fs.status}`}>
                    {fs.status === 'pending' && t.waiting}
                    {fs.status === 'active'  && t.processing}
                    {fs.status === 'done'    && t.done}
                    {fs.status === 'error'   && t.failed}
                  </span>
                </div>

                {isExpanded && (
                  <div className="step-list">
                    {fs.steps.map(step => (
                      <div key={step.id} className={`step-item step--${step.status}`}>
                        <span className={`step-icon step-icon--${step.status}`}>
                          <StepIcon status={step.status} />
                        </span>
                        <span className="step-label">
                          {(t.steps && t.steps[step.labelKey]) || step.label}
                        </span>
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
