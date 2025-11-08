import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/Home'
import ChatPage from './pages/Chat'

const GlobalNav = () => {
  const navigate = useNavigate()

  return (
    <header className="global-nav">
      <button type="button" className="global-nav__brand" onClick={() => navigate('/')}
      >
        <span className="brand-mark" aria-hidden="true">
          🛡️
        </span>
        <span className="brand-name">SecureSBU</span>
      </button>


      <div className="global-nav__cta">
        <button type="button" className="nav-chat-button" onClick={() => navigate('/chat')}>
          Open Chat
        </button>
        <div className="avatar-badge" aria-hidden="true">
          A
        </div>
      </div>
    </header>
  )
}

const App = () => {
  const location = useLocation()
  const isChatRoute = location.pathname.startsWith('/chat')
  const stageClassName = isChatRoute ? 'app-stage chat-stage' : 'app-stage'

  return (
    <div className="app-frame">
      <GlobalNav />
      <main className={stageClassName}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App