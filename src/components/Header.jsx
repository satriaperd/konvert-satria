export default function Header({ onToggleTheme, onToggleLang, t }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand__mark">K</div>
        <div>
          <div className="brand__name">Konvert</div>
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
