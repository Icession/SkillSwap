import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import './Messages.css'

export default function Messages() {
  const navigate = useNavigate()
  const { mySwaps, messages, currentUser, getUser, sendMessage, markSwapRead } = useApp()

  const conversations = useMemo(
    () => mySwaps.filter((s) => s.status !== 'Declined'),
    [mySwaps]
  )

  const [activeId, setActiveId] = useState(conversations[0]?.id || null)
  const [draft, setDraft] = useState('')
  const threadRef = useRef(null)

  const activeSwap = conversations.find((s) => s.id === activeId)
  const other = activeSwap
    ? getUser(activeSwap.requesterId === currentUser.id ? activeSwap.recipientId : activeSwap.requesterId)
    : null

  const thread = useMemo(
    () => messages.filter((m) => m.swapId === activeId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages, activeId]
  )

  useEffect(() => {
    if (activeId) markSwapRead(activeId)
  }, [activeId, markSwapRead])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [thread.length, activeId])

  const lastMessage = (swapId) => {
    const msgs = messages.filter((m) => m.swapId === swapId)
    return msgs[msgs.length - 1]
  }

  const handleSend = () => {
    if (!draft.trim()) return
    sendMessage(activeId, draft)
    setDraft('')
  }

  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="msg-page">
      <Navbar showBack />
      <div className="msg-wrap">
        {conversations.length === 0 ? (
          <div className="msg-empty-full">
            <h2>No conversations yet</h2>
            <p>Once you request or accept a swap, your chats will appear here.</p>
            <button className="msg-empty-btn" onClick={() => navigate('/feed')}>Find a swap</button>
          </div>
        ) : (
          <div className="msg-layout">
            <aside className="msg-list">
              <div className="msg-list-title">Messages</div>
              {conversations.map((swap) => {
                const o = getUser(swap.requesterId === currentUser.id ? swap.recipientId : swap.requesterId)
                const last = lastMessage(swap.id)
                return (
                  <div
                    key={swap.id}
                    className={`msg-list-item ${swap.id === activeId ? 'msg-list-active' : ''}`}
                    onClick={() => setActiveId(swap.id)}
                  >
                    <div className="msg-list-avatar" style={{ background: o?.color }}>{o?.initials}</div>
                    <div className="msg-list-info">
                      <div className="msg-list-name">{o?.name}</div>
                      <div className="msg-list-preview">
                        {last ? last.body : `${swap.offerSkill} ↔ ${swap.wantSkill}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </aside>

            <section className="msg-thread-pane">
              {activeSwap && (
                <>
                  <div className="msg-thread-header">
                    <div className="msg-list-avatar" style={{ background: other?.color }}>{other?.initials}</div>
                    <div>
                      <div className="msg-thread-name">{other?.name}</div>
                      <div className="msg-thread-sub">{activeSwap.offerSkill} ↔ {activeSwap.wantSkill} · {activeSwap.status}</div>
                    </div>
                  </div>

                  <div className="msg-thread" ref={threadRef}>
                    {thread.length === 0 ? (
                      <div className="msg-thread-empty">Say hello to start the conversation.</div>
                    ) : thread.map((m) => {
                      const mine = m.senderId === currentUser.id
                      return (
                        <div key={m.id} className={`msg-bubble-row ${mine ? 'mine' : 'theirs'}`}>
                          <div className={`msg-bubble ${mine ? 'msg-bubble-mine' : 'msg-bubble-theirs'}`}>
                            {m.body}
                            <span className="msg-time">{fmt(m.createdAt)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="msg-composer">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} disabled={!draft.trim()}>Send</button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}