export default function Footer({ t }) {
  const year = new Date().getFullYear()

  const handleFeedback = () => {
    const subject = encodeURIComponent('Konvert Feedback')
    const body    = encodeURIComponent('Hi,\n\nHere is my feedback about Konvert:\n\n')
    window.location.href = `mailto:hello.satriaperd@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <footer className="app-footer">
      <span className="app-footer__copy">© {year} CimangClub</span>
      <div className="app-footer__actions">
        <a
          className="donate-btn"
          href="https://trakteer.id/satriaperd/tip"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.donate}
        </a>
        <button className="feedback-btn" onClick={handleFeedback} type="button">
          {t.feedback}
        </button>
      </div>
    </footer>
  )
}
