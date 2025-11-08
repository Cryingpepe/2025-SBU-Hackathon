import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import '../App.css'

type Sender = 'user' | 'bot'

type Message = {
  id: string
  sender: Sender
  text: string
}

const BOT_NAME = 'SecureSBU Bot'
const API_BASE_URL = 'https://stagingapi.neuralseek.com/v1/stony36'
const API_KEY = import.meta.env.VITE_NEURALSEEK_API_KEY ?? 'e24f8a05-e4fe85b2-3e859a20-6186b503'

const quickReplies: string[] = [
  'What is our PHI email policy?',
  'How do I report a lost device?',
  'What counts as suspicious login activity?',
]

const initialMessages: Message[] = [
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Hello! I am the SecureSBU assistant. Ask me about hospital security or compliance policies anytime.',
  },
]

const extractText = (value: unknown, depth = 0): string | null => {
  if (!value) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => extractText(entry, depth + 1))
      .filter((entry): entry is string => Boolean(entry))

    const joined = parts.join('\n').trim()
    return joined.length > 0 ? joined : null
  }

  if (typeof value === 'object' && depth < 6) {
    const obj = value as Record<string, unknown>
    const primaryKeys = ['answer', 'response', 'output', 'rendered', 'text', 'content', 'out']

    for (const key of primaryKeys) {
      if (key in obj) {
        const result = extractText(obj[key], depth + 1)
        if (result) return result
      }
    }

    if (Array.isArray(obj.sourceParts)) {
      const joinedParts = obj.sourceParts
        .map((part) => extractText(part, depth + 1))
        .filter((part): part is string => Boolean(part))
        .join('\n')

      if (joinedParts.trim().length > 0) {
        return joinedParts.trim()
      }
    }

    if (Array.isArray(obj.outputs)) {
      const joinedOutputs = obj.outputs
        .map((part) => extractText(part, depth + 1))
        .filter((part): part is string => Boolean(part))
        .join('\n')

      if (joinedOutputs.trim().length > 0) {
        return joinedOutputs.trim()
      }
    }
  }

  return null
}

const resolveBotText = (payload: unknown): string => {
  const direct = extractText(payload)
  if (direct) {
    return direct
  }

  if (typeof payload === 'string') {
    return payload
  }

  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return ''
  }
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isWaiting, [input, isWaiting])

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isWaiting])

  const pushMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const buildLastTurn = (history: Message[]) => {
    const lastUser = [...history].reverse().find((item) => item.sender === 'user')
    const lastBot = [...history].reverse().find((item) => item.sender === 'bot')

    if (lastUser && lastBot) {
      return [
        {
          input: lastUser.text,
          response: lastBot.text,
        },
      ]
    }

    return []
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()

    if (!trimmed || isWaiting) {
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    }

    pushMessage(userMessage)
    setInput('')
    setIsWaiting(true)

    const historySnapshot = [...messages, userMessage]
    const payload = {
      ntl: '',
      agent: 'ChatBot',
      params: [
        {
          name: 'userInput',
          value: trimmed,
        },
      ],
      options: {
        streaming: false,
        llm: '',
        user_id: '',
        timeout: 600000,
        temperatureMod: 1,
        toppMod: 1,
        freqpenaltyMod: 1,
        minTokens: 0,
        maxTokens: 1000,
        lastTurn: buildLastTurn(historySnapshot),
        returnVariables: false,
        returnVariablesExpanded: false,
        returnRender: false,
        returnSource: true,
        maxRecursion: 10,
      },
    }

    try {
      const response = await fetch(`${API_BASE_URL}/maistro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: API_KEY,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const botReply = resolveBotText(data) || 'The service returned an empty response.'

      pushMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
      })
      setErrorMessage(null)
    } catch (error) {
      console.error(error)
      const fallbackText =
        'Sorry, I could not reach NeuralSeek right now. Please try again in a moment.'

      pushMessage({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
      })
      setErrorMessage('Failed to fetch a response from NeuralSeek.')
    } finally {
      setIsWaiting(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    setInput(reply)
  }

  return (
    <div className="chat-page">
      <header className="topbar">
        <Link to="/" className="topbar-brand">
          <span className="brand-mark" aria-hidden="true">
            🛡️
          </span>
          <span className="brand-name">SecureSBU</span>
        </Link>
        <div className="topbar-right">
          <Link to="/" className="link-button">
            ← Back to dashboard
          </Link>
          <div className="avatar-badge" aria-hidden="true">
            A
          </div>
        </div>
      </header>

      <div className="chat-wrapper">
        <div className="chat-container">
          <header className="chat-header">
            <div>
              <h1>SecureSBU Assistant</h1>
              <p>Ask about security policy, HIPAA compliance, or incident response steps.</p>
            </div>
            <span className="status-indicator">
              <span className={`status-dot ${isWaiting ? 'busy' : 'ready'}`} />
              {isWaiting ? 'Generating reply...' : 'Ready'}
            </span>
          </header>

          <main className="chat-body">
            <ul className="message-list" aria-live="polite">
              {messages.map((message) => (
                <li key={message.id} className={`message ${message.sender}`}>
                  <div className="avatar" aria-hidden="true">
                    {message.sender === 'bot' ? '🛡️' : '🧑'}
                  </div>
                  <div className="bubble">
                    {message.sender === 'bot' && <span className="sender-label">{BOT_NAME}</span>}
                    <p>{message.text}</p>
                  </div>
                </li>
              ))}

              {isWaiting && (
                <li className="message bot typing">
                  <div className="avatar" aria-hidden="true">
                    🛡️
                  </div>
                  <div className="bubble">
                    <span className="sender-label">{BOT_NAME}</span>
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </li>
              )}
              <div ref={scrollAnchorRef} />
            </ul>
          </main>

          <footer className="chat-footer">
            <div className="quick-replies" role="list">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  role="listitem"
                  className="quick-reply"
                  onClick={() => handleQuickReply(reply)}
                  disabled={isWaiting}
                >
                  {reply}
                </button>
              ))}
            </div>

            <form className="chat-input" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isWaiting}
                aria-label="Message input"
              />
              <button type="submit" disabled={!canSend}>
                Send
              </button>
            </form>
          </footer>

          {errorMessage && (
            <div role="alert" className="error-banner">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
