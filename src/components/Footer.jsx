export default function Footer() {
  const year = new Date().getFullYear()

  const handleFeedback = () => {
    const subject = encodeURIComponent('Konvert Feedback')
    const body    = encodeURIComponent('Hi,\n\nHere is my feedback about Konvert:\n\n')
    window.location.href = `mailto:hello.satriaperd@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <footer className="app-footer">
      <span className="app-footer__copy">© {year} CimangClub</span>
      <button className="feedback-btn" onClick={handleFeedback} type="button">
        Send Feedback
      </button>
    </footer>
  )
}
