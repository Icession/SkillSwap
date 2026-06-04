import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RequestSwapModal from '../components/RequestSwapModal'
import { useApp } from '../context/AppContext'
import { getCategory } from '../data/seed'
import './SkillFeed.css'

const CATEGORIES     = ['All Skills', 'Design', 'Technology', 'Language', 'Business', 'Arts']
const AVAILABILITIES = ['Anytime', 'Weekdays', 'Weekends']
const LEVELS         = ['All levels', 'Beginner', 'Intermediate', 'Advance']

export default function SkillFeed() {
  const navigate = useNavigate()
  const { users, currentUser, swaps, createSwap } = useApp()

  const [activeCategory,     setActiveCategory]     = useState('All Skills')
  const [activeAvailability, setActiveAvailability] = useState('Anytime')
  const [activeLevel,        setActiveLevel]        = useState('All levels')
  const [searchQuery,        setSearchQuery]        = useState('')
  const [swapTarget,         setSwapTarget]         = useState(null)

  // Everyone except yourself — you can't swap with yourself.
  const others = useMemo(
    () => users.filter((u) => String(u.id) !== String(currentUser?.id)),
    [users, currentUser]
  )

  // Real category counts, derived from the people in the feed.
  const catCounts = useMemo(() => {
    const counts = { 'All Skills': others.length }
    for (const cat of CATEGORIES.slice(1)) {
      counts[cat] = others.filter((u) =>
        u.offer.some((s) => getCategory(s) === cat)
      ).length
    }
    return counts
  }, [others])

  const filteredUsers = others.filter((u) => {
    const q = searchQuery.trim().toLowerCase()

    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.offer.some((s) => s.toLowerCase().includes(q)) ||
      u.want.some((s)  => s.toLowerCase().includes(q))

    const matchesCategory =
      activeCategory === 'All Skills' ||
      u.offer.some((s) => getCategory(s) === activeCategory)

    const matchesAvailability =
      activeAvailability === 'Anytime' ||
      u.availability.toLowerCase().includes(activeAvailability.toLowerCase())

    const matchesLevel =
      activeLevel === 'All levels' || u.level === activeLevel

    return matchesSearch && matchesCategory && matchesAvailability && matchesLevel
  })

  // Have you already sent this person a pending/active request?
  const hasRequest = (userId) =>
    swaps.some(
      (s) => s.requesterId === currentUser?.id &&
        String(s.recipientId) === String(userId) &&
        (s.status === 'Pending' || s.status === 'Active')
    )

  const handleSubmit = ({ offerSkill, wantSkill, message }) => {
    createSwap({ recipientId: swapTarget.id, offerSkill, wantSkill, message })
    setSwapTarget(null)
  }

  return (
    <div className="feed-page">
      <Navbar />

      <div className="feed-body">
        <aside className="feed-sidebar">
          <div className="sb-section-lbl">Category</div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className={`sb-item ${activeCategory === cat ? 'sb-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              <span className="sb-count">{catCounts[cat] ?? 0}</span>
            </div>
          ))}

          <div className="sb-section-lbl">Availability</div>
          {AVAILABILITIES.map((av) => (
            <div
              key={av}
              className={`sb-item ${activeAvailability === av ? 'sb-active' : ''}`}
              onClick={() => setActiveAvailability(av)}
            >
              {av}
            </div>
          ))}

          <div className="sb-section-lbl">Level</div>
          {LEVELS.map((lv) => (
            <div
              key={lv}
              className={`sb-item ${activeLevel === lv ? 'sb-active' : ''}`}
              onClick={() => setActiveLevel(lv)}
            >
              {lv}
            </div>
          ))}
        </aside>

        <main className="feed-main">
          <div className="feed-main-header">
            <h2>{filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} you can swap with</h2>
            <input
              type="text"
              className="feed-search"
              placeholder="Search for skills or people.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="feed-empty">No matches found. Try adjusting your filters.</div>
          ) : (
            <div className="feed-grid">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="skill-card"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div className="skill-card-top">
                    <div className="skill-avatar" style={{ background: user.color }}>
                      {user.initials}
                    </div>
                    <div>
                      <div className="skill-name">{user.name}</div>
                      <div className="skill-location">{user.location}</div>
                    </div>
                  </div>

                  <div className="skill-meta">
                    <span>{user.rating ? `★ ${user.rating}` : 'New member'}</span>
                    <span className="skill-meta-dot">·</span>
                    <span>{user.swaps} {user.swaps === 1 ? 'swap' : 'swaps'}</span>
                    <span className="skill-meta-dot">·</span>
                    <span>{user.level}</span>
                  </div>

                  <div className="skill-skillset">
                    <span className="skill-set-lbl">Offers</span>
                    <div className="skill-badges">
                      {user.offer.map((s) => (
                        <span key={s} className="badge badge-offer">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="skill-skillset">
                    <span className="skill-set-lbl">Wants</span>
                    <div className="skill-badges">
                      {user.want.map((s) => (
                        <span key={s} className="badge badge-want">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="skill-card-footer">
                    <span className="skill-avail">{user.availability}</span>
                    {hasRequest(user.id) ? (
                      <button className="btn-swap btn-swap-sent" disabled>Request sent ✓</button>
                    ) : (
                      <button
                        className="btn-swap"
                        onClick={(e) => { e.stopPropagation(); setSwapTarget(user) }}
                      >
                        Request Swap
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {swapTarget && (
        <RequestSwapModal
          recipient={swapTarget}
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  )
}