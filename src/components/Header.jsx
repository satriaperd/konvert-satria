import { useState, useEffect } from 'react'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'

function useScramble(text, duration = 950) {
  const [display, setDisplay] = useState(() =>
    text.split('').map(c => c === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]).join('')
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }

    let raf
    let t0

    const tick = (ts) => {
      if (!t0) t0 = ts
      const progress = Math.min((ts - t0) / duration, 1)

      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (progress > (i / text.length) + 0.12) return char
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }).join('')
      )

      if (progress < 1) raf = requestAnimationFrame(tick)
      else setDisplay(text)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, duration])

  return display
}

export default function Header({ onToggleTheme, onToggleLang, t }) {
  const brand = useScramble('Konvert')

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand__mark">K</div>
        <div>
          <div className="brand__name" aria-label="Konvert">{brand}</div>
          <div className="brand__tagline">{t.tagline}</div>
        </div>
      </div>
      <div className="header-right">
        <span className="badge privacy-badge">{t.privacyBadge}</span>
        <button className="lang-btn" onClick={onToggleLang} title="Switch language">
          {t.langBtn}
        </button>
        <button className="theme-btn" onClick={onToggleTheme} title="Toggle dark mode">◑</button>
      </div>
    </header>
  )
}
