import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/Home'
import ChatPage from './pages/Chat'
import MyReportsPage from './pages/MyReports'

const GlobalNav = () => {
  const navigate = useNavigate()

  const handleOpenReport = () => {
    window.dispatchEvent(
      new CustomEvent('secureSBU:openReport', {
        detail: {
          flaggedMessage: 'Manual report from navigation bar',
          reason: 'User opened report dialog from the navigation.',
        },
      }),
    )
  }

  return (
    <header className="global-nav">
      <button type="button" className="global-nav__brand" onClick={() => navigate('/')}>
        <span className="brand-mark" aria-hidden="true">
          🛡️
        </span>
        <span className="brand-name">SecureSBU</span>
      </button>

      <nav className="global-nav__links" aria-label="Primary navigation" />

      <div className="global-nav__cta">
        <button
          type="button"
          className="nav-report-button"
          onClick={handleOpenReport}
        >
          Report Suspicious Activity
        </button>
        <button
          type="button"
          className="avatar-badge"
          onClick={() => navigate('/reports')}
          aria-label="View my reports"
        >
          A
        </button>
      </div>
    </header>
  )
}

const App = () => {
  const location = useLocation()
  const isChatRoute = location.pathname.startsWith('/chat')
  const isReportsRoute = location.pathname.startsWith('/reports')
  const stageClassName = isChatRoute ? 'app-stage chat-stage' : isReportsRoute ? 'app-stage reports-stage' : 'app-stage'

  return (
    <div className="app-frame">
      <GlobalNav />
      <main className={stageClassName}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/reports" element={<MyReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App