import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { USERS } from '../data'
import './SkillFeed.css'

const CATEGORIES     = ['All Skills', 'Design', 'Technology', 'Language', 'Business', 'Arts']
const CAT_COUNTS     = { 'All Skills': 147, Design: 35, Technology: 59, Language: 120, Business: 43, Arts: 20 }
const AVAILABILITIES = ['Anytime', 'Weekdays', 'Weekends']
const LEVELS         = ['All levels', 'Beginner', 'Intermediate', 'Advance']

export default function SkillFeed() {
  const navigate = useNavigate()

  const [activeCategory,     setActiveCategory]     = useState('All Skills')
  const [activeAvailability, setActiveAvailability] = useState('Anytime')
  const [activeLevel,        setActiveLevel]        = useState('All levels')
  const [searchQuery,        setSearchQuery]        = useState('')

  const filteredUsers = USERS.filter((u) => {
    const q = searchQuery.trim().toLowerCase()

    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.offer.some((s) => s.toLowerCase().includes(q)) ||
      u.want.some((s)  => s.toLowerCase().includes(q))

    const matchesAvailability =
      activeAvailability === 'Anytime' ||
      u.availability.toLowerCase().includes(activeAvailability.toLowerCase())

    return matchesSearch && matchesAvailability
  })

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
              <span className="sb-count">{CAT_COUNTS[cat]}</span>
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
            <h2>{filteredUsers.length} matches near New York</h2>
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
                <div key={user.id} className="skill-card">
                  <div className="skill-card-top">
                    <div className="skill-avatar" style={{ background: user.color }}>
                      {user.initials}
                    </div>
                    <div>
                      <div className="skill-name">{user.name}</div>
                      <div className="skill-location">{user.location}</div>
                    </div>
                  </div>

                  <div className="skill-badges">
                    <span className="badge badge-offer">Offer: {user.offer[0]}</span>
                    <span className="badge badge-want">Want: {user.want[0]}</span>
                  </div>

                  <div className="skill-card-footer">
                    <span className="skill-avail">{user.availability}</span>
                    <button
                      className="btn-swap"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      Request Swap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}