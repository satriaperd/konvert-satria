export default function Header({ onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand__mark">K</div>
        <div>
          <div className="brand__name">Konvert</div>
          <div className="brand__tagline">JPG → WebP</div>
        </div>
      </div>
      <div className="header-right">
        <span className="badge privacy-badge">🔒 runs locally</span>
        <button className="theme-btn" onClick={onToggleTheme} title="Toggle dark mode">◑</button>
      </div>
    </header>
  )
}
