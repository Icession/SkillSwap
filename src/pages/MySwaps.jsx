import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import './MySwaps.css'

const FILTERS = ['All', 'Pending', 'Active', 'Done']

export default function MySwaps() {
  const navigate = useNavigate()
  const { mySwaps, currentUser, getUser, updateSwapStatus } = useApp()
  const [filter, setFilter] = useState('All')

  const incoming = mySwaps.filter(
    (s) => s.recipientId === currentUser.id && s.status === 'Pending'
  )

  const list = filter === 'All' ? mySwaps : mySwaps.filter((s) => s.status === filter)

  const otherParty = (swap) =>
    getUser(swap.requesterId === currentUser.id ? swap.recipientId : swap.requesterId)

  const statusClass = (s) =>
    s === 'Pending' ? 'swp-pending' : s === 'Active' ? 'swp-active'
      : s === 'Done' ? 'swp-done' : 'swp-declined'

  return (
    <div className="swp-page">
      <Navbar showBack />
      <div className="swp-wrap">
        <h1 className="swp-heading">My Swaps</h1>
        <p className="swp-sub">Manage your skill exchanges and respond to requests.</p>

        {incoming.length > 0 && (
          <section className="swp-incoming">
            <h2 className="swp-section-title">Incoming requests <span className="swp-badge">{incoming.length}</span></h2>
            {incoming.map((swap) => {
              const other = otherParty(swap)
              return (
                <div key={swap.id} className="swp-incoming-card">
                  <div className="swp-avatar" style={{ background: other?.color }}>{other?.initials}</div>
                  <div className="swp-incoming-info">
                    <div className="swp-incoming-name">{other?.name}</div>
                    <div className="swp-exchange">
                      <span className="swp-chip swp-chip-offer">{swap.offerSkill}</span>
                      <span className="swp-arrow">↔</span>
                      <span className="swp-chip swp-chip-want">{swap.wantSkill}</span>
                    </div>
                  </div>
                  <div className="swp-incoming-actions">
                    <button className="swp-btn-decline" onClick={() => updateSwapStatus(swap.id, 'Declined')}>Decline</button>
                    <button className="swp-btn-accept" onClick={() => updateSwapStatus(swap.id, 'Active')}>Accept</button>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        <div className="swp-filter-row">
          {FILTERS.map((f) => (
            <span
              key={f}
              className={`swp-filter ${filter === f ? 'swp-filter-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="swp-empty">
            {filter === 'All'
              ? "You haven't started any swaps yet. Browse the feed to find someone to learn from."
              : `No ${filter.toLowerCase()} swaps.`}
            {filter === 'All' && (
              <button className="swp-empty-btn" onClick={() => navigate('/feed')}>Explore skills</button>
            )}
          </div>
        ) : (
          <div className="swp-list">
            {list.map((swap) => {
              const other = otherParty(swap)
              const outgoing = swap.requesterId === currentUser.id
              return (
                <div key={swap.id} className="swp-card">
                  <div className="swp-avatar" style={{ background: other?.color }}>{other?.initials}</div>
                  <div className="swp-card-body">
                    <div className="swp-card-top">
                      <span className="swp-card-name">{other?.name}</span>
                      <span className={`swp-status ${statusClass(swap.status)}`}>{swap.status}</span>
                    </div>
                    <div className="swp-exchange">
                      <span className="swp-chip swp-chip-offer">{outgoing ? swap.offerSkill : swap.wantSkill}</span>
                      <span className="swp-arrow">↔</span>
                      <span className="swp-chip swp-chip-want">{outgoing ? swap.wantSkill : swap.offerSkill}</span>
                      <span className="swp-direction">{outgoing ? 'You requested' : 'They requested'}</span>
                    </div>
                  </div>
                  <div className="swp-card-actions">
                    {swap.status === 'Active' && (
                      <button className="swp-btn-done" onClick={() => updateSwapStatus(swap.id, 'Done')}>Mark done</button>
                    )}
                    {(swap.status === 'Active' || swap.status === 'Pending') && (
                      <button className="swp-btn-msg" onClick={() => navigate('/messages')}>Message</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}