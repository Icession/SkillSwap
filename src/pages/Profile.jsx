import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RequestSwapModal from '../components/RequestSwapModal'
import { useApp } from '../context/AppContext'
import './Profile.css'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUser, currentUser, createSwap, swaps } = useApp()

  const user = getUser(id)
  const isOwnProfile = currentUser && String(currentUser.id) === String(id)

  const [modalOpen, setModalOpen] = useState(false)
  const [justSent, setJustSent] = useState(false)

  useEffect(() => {
    if (!user) navigate('/feed')
  }, [user, navigate])

  if (!user) return null

  const existing = swaps.find(
    (s) => s.requesterId === currentUser?.id && String(s.recipientId) === String(user.id) &&
      (s.status === 'Pending' || s.status === 'Active')
  )

  const handleSubmit = ({ offerSkill, wantSkill, message }) => {
    createSwap({ recipientId: user.id, offerSkill, wantSkill, message })
    setModalOpen(false)
    setJustSent(true)
  }

  const offerLevel = (skill) => user.offerLevels?.[skill] ?? 'Intermediate'
  const wantLevel  = (skill) => user.wantLevels?.[skill] ?? 'Any level'

  const requestBtnLabel = justSent || existing ? 'Request sent ✓' : 'Request a swap'

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-body">
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ background: user.color }}>
              {user.initials}
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-meta">{user.location} · Joined {user.joined}</p>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-val">{user.swaps}</div>
              <div className="profile-stat-lbl">Swaps done</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-val">{user.rating || '—'}</div>
              <div className="profile-stat-lbl">Rating</div>
            </div>
          </div>

          <div className="profile-section-lbl">Offering</div>
          {user.offer.map((skill) => (
            <div key={skill} className="profile-skill-row">
              <div className="profile-dot" style={{ background: '#298C6E' }} />
              <span className="profile-skill-name">{skill}</span>
              <span className="profile-skill-lvl">{offerLevel(skill)}</span>
            </div>
          ))}

          <div className="profile-section-lbl" style={{ marginTop: '16px' }}>Looking for</div>
          {user.want.map((skill) => (
            <div key={skill} className="profile-skill-row">
              <div className="profile-dot" style={{ background: '#F4A44A' }} />
              <span className="profile-skill-name">{skill}</span>
              <span className="profile-skill-lvl">{wantLevel(skill)}</span>
            </div>
          ))}
        </aside>

        <main className="profile-main">
          <div className="profile-main-header">
            <div>
              <h1>{user.name}</h1>
              <p className="profile-role">
                {user.role} · <span className="profile-avail">{user.availability}</span>
              </p>
            </div>
            {isOwnProfile ? (
              <button className="btn-request" onClick={() => navigate('/settings')}>
                Edit profile
              </button>
            ) : (
              <button
                className={`btn-request ${justSent || existing ? 'btn-sent' : ''}`}
                onClick={() => (justSent || existing ? null : setModalOpen(true))}
              >
                {requestBtnLabel}
              </button>
            )}
          </div>

          <div className="profile-card">
            <div className="profile-card-lbl">About</div>
            <p className="profile-bio">{user.bio}</p>
          </div>

          <div className="profile-card">
            <div className="profile-card-lbl">Looking to learn</div>
            <div className="profile-want-grid">
              {user.want.map((skill) => (
                <div key={skill} className="profile-want-card">
                  <div
                    className="profile-want-icon"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B26B16', fontWeight: 700 }}
                  >
                    {skill[0]}
                  </div>
                  <div className="profile-want-name">{skill}</div>
                  <div className="profile-want-lvl">
                    {wantLevel(skill)} · Flexible schedule
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-lbl">Reviews</div>
            {user.reviews.length === 0 ? (
              <p className="profile-bio">No reviews yet.</p>
            ) : user.reviews.map((review, i) => (
              <div key={i} className="review-item">
                <div className="review-top">
                  <div className="review-avatar">{review.initials}</div>
                  <span className="review-name">{review.name}</span>
                  <span className="review-stars">{'★'.repeat(review.rating)}</span>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      {modalOpen && (
        <RequestSwapModal
          recipient={user}
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}