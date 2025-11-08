import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const SECURITY_TIPS = [
  "Always verify the sender's email address before clicking links.",
  'Lock unattended workstations within 60 seconds to protect PHI.',
  'Report lost or stolen devices to Security within 15 minutes.',
  'Store PHI only in encrypted, hospital-approved systems.',
]

type HomePageProps = {
  userName?: string
}

const HomePage = ({ userName = 'Alex' }: HomePageProps) => {
  const navigate = useNavigate()
  const tipOfTheDay = useMemo(
    () => SECURITY_TIPS[Math.floor(Math.random() * SECURITY_TIPS.length)],
    [],
  )

  return (
    <div className="home-page">
      <header className="topbar">
        <button type="button" className="topbar-brand" onClick={() => navigate('/')}
        >
          <span className="brand-mark" aria-hidden="true">
            🛡️
          </span>
          <span className="brand-name">SecureSBU</span>
        </button>
        <div className="topbar-right">
          <button type="button" className="link-button" onClick={() => navigate('/chat')}>
            Chat
          </button>
          <div className="avatar-badge" aria-hidden="true">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="home-content">
        <section className="home-hero">
          <h1 className="home-title">Welcome back, {userName}!</h1>
          <p className="home-subtitle">
            Prep the Hoffmann CSO briefing with SecureSBU. Ask policy questions, rehearse incident
            response playbooks, and route suspicious activity to security in a single click.
          </p>
        </section>

        <section className="tip-card" aria-label="Today&apos;s security tip">
          <div className="tip-icon" aria-hidden="true">
            🔐
          </div>
          <div>
            <span className="tip-eyebrow">Today&apos;s Security Tip</span>
            <p className="tip-text">{tipOfTheDay}</p>
          </div>
        </section>

        <div className="home-actions">
          <button type="button" className="primary-action" onClick={() => navigate('/chat')}>
            <span aria-hidden="true">❓</span>
            Ask a Policy Question
          </button>
          <button type="button" className="secondary-action" onClick={() => navigate('/chat')}>
            <span aria-hidden="true">🚨</span>
            Report Suspicious Activity
          </button>
        </div>

        <p className="home-helper">
          Select an option to start a conversation with the SecureSBU assistant.
        </p>
      </main>

      <footer className="home-footer">
        <button type="button" className="link-button">
          Help
        </button>
        <span aria-hidden="true">•</span>
        <button type="button" className="link-button">
          IT Support
        </button>
      </footer>
    </div>
  )
}

export default HomePage
