import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { USERS } from '../data'
import './Profile.css'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const user = USERS.find((u) => u.id === parseInt(id))

  const [swapSent, setSwapSent] = useState(false)
  const [prevId, setPrevId] = useState(id)

  if (id !== prevId) {
    setPrevId(id)
    setSwapSent(false)
  }

  useEffect(() => {
    if (!user) navigate('/feed')
  }, [user, navigate])

  if (!user) return null

  const offerLevels = { 0: 'Advance', 1: 'Advance', 2: 'Intermediate' }
  const wantLevels  = { 0: 'Beginner', 1: 'Any level' }

  return (
    <div className="profile-page">
      <Navbar showBack />

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
              <div className="profile-stat-val">{user.rating}</div>
              <div className="profile-stat-lbl">Rating</div>
            </div>
          </div>

          <div className="profile-section-lbl">Offering</div>
          {user.offer.map((skill, i) => (
            <div key={skill} className="profile-skill-row">
              <div className="profile-dot" style={{ background: i === 2 ? '#B3DDD0' : '#298C6E' }} />
              <span className="profile-skill-name">{skill}</span>
              <span className="profile-skill-lvl">{offerLevels[i] ?? 'Intermediate'}</span>
            </div>
          ))}

          <div className="profile-section-lbl" style={{ marginTop: '16px' }}>Looking for</div>
          {user.want.map((skill, i) => (
            <div key={skill} className="profile-skill-row">
              <div className="profile-dot" style={{ background: '#F4A44A' }} />
              <span className="profile-skill-name">{skill}</span>
              <span className="profile-skill-lvl">{wantLevels[i] ?? 'Any level'}</span>
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
            <button
              className={`btn-request ${swapSent ? 'btn-sent' : ''}`}
              onClick={() => setSwapSent(true)}
            >
              {swapSent ? 'Request sent ✓' : 'Request a swap'}
            </button>
          </div>

          <div className="profile-card">
            <div className="profile-card-lbl">About</div>
            <p className="profile-bio">{user.bio}</p>
          </div>

          <div className="profile-card">
            <div className="profile-card-lbl">Looking to learn</div>
            <div className="profile-want-grid">
              {user.want.map((skill, i) => (
                <div key={skill} className="profile-want-card">
                  <div className="profile-want-icon" />
                  <div className="profile-want-name">{skill}</div>
                  <div className="profile-want-lvl">
                    {wantLevels[i] ?? 'Any level'} · Flexible schedule
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-lbl">Reviews</div>
            {user.reviews.map((review, i) => (
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
    </div>
  )
}