import { useState } from 'react'
import './RequestSwapModal.css'

export default function RequestSwapModal({ recipient, currentUser, onSubmit, onClose }) {
  const myOffers = currentUser?.offer || []
  const theirOffers = recipient?.offer || []

  const [offerSkill, setOfferSkill] = useState(myOffers[0] || '')
  const [wantSkill, setWantSkill]   = useState(theirOffers[0] || '')
  const [message, setMessage]       = useState('')

  const canSubmit = offerSkill && wantSkill

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ offerSkill, wantSkill, message })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Request a swap with {recipient.name.split(' ')[0]}</h3>
          <span className="modal-close" onClick={onClose}>✕</span>
        </div>

        <p className="modal-sub">Propose what you'll teach and what you'd like to learn.</p>

        <label className="modal-label">You'll teach</label>
        {myOffers.length === 0 ? (
          <div className="modal-warn">You haven't added any skills to offer yet. Add some in Settings first.</div>
        ) : (
          <select className="modal-select" value={offerSkill} onChange={(e) => setOfferSkill(e.target.value)}>
            {myOffers.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        <label className="modal-label">You'll learn</label>
        <select className="modal-select" value={wantSkill} onChange={(e) => setWantSkill(e.target.value)}>
          {theirOffers.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="modal-preview">
          <span className="modal-chip modal-chip-offer">{offerSkill || '—'}</span>
          <span className="modal-arrow">↔</span>
          <span className="modal-chip modal-chip-want">{wantSkill || '—'}</span>
        </div>

        <label className="modal-label">Add a message <span className="modal-optional">(optional)</span></label>
        <textarea
          className="modal-textarea"
          rows={3}
          placeholder={`Hi ${recipient.name.split(' ')[0]}, I'd love to swap skills...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="modal-actions">
          <button className="modal-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="modal-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5 }}
          >
            Send request
          </button>
        </div>
      </div>
    </div>
  )
}