import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/Home'
import ChatPage from './pages/Chat'

const App = () => {
  const handleReportClick = () => {
    window.dispatchEvent(new CustomEvent('secureSBU:openReport'))
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage onReportClick={handleReportClick} />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
