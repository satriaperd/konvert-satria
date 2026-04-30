import { useState } from 'react'
import DonateModal from './DonateModal'
import { VERSION } from '../version.js'

export default function Footer({ t }) {
  const year = new Date().getFullYear()
  const [modalOpen, setModalOpen] = useState(false)

  const handleFeedback = () => {
    const subject = encodeURIComponent('Konvert Feedback')
    const body    = encodeURIComponent('Hi,\n\nHere is my feedback about Konvert:\n\n')
    window.location.href = `mailto:hello.satriaperd@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <>
      <footer className="app-footer">
        <div className="app-footer__meta">
          <span className="app-footer__copy">© {year} CimangClub</span>
          <span className="app-footer__version">v{VERSION}</span>
        </div>
        <div className="app-footer__actions">
          <button className="donate-btn" type="button" onClick={() => setModalOpen(true)}>
            {t.donate}
          </button>
          <button className="feedback-btn" onClick={handleFeedback} type="button">
            {t.feedback}
          </button>
        </div>
      </footer>

      {modalOpen && <DonateModal onClose={() => setModalOpen(false)} t={t} />}
    </>
  )
}
