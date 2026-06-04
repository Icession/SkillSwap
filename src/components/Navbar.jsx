import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout, pendingIncoming, unreadCount } = useApp()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

  const handleProfile = () => {
    setDropdownOpen(false)
    navigate(`/profile/${currentUser?.id}`)
  }

  const handleSettings = () => {
    setDropdownOpen(false)
    navigate('/settings')
  }

  const isActive = (path) => location.pathname === path

  const links = [
    { label: 'Discover', path: '/feed' },
    { label: 'My Swaps', path: '/swaps', badge: pendingIncoming },
    { label: 'Messages', path: '/messages', badge: unreadCount },
    { label: 'Dashboard', path: '/dashboard' },
  ]

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-logo" onClick={() => navigate('/feed')}>
          <div className="nav-logo-mark">S</div>
          <span className="nav-logo-name">SkillSwap</span>
        </div>
      </div>

      <div className="nav-links">
        {links.map((link) => (
          <span
            key={link.path}
            className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
            {link.badge > 0 && <span className="nav-link-badge">{link.badge}</span>}
          </span>
        ))}
      </div>

      <div className="nav-right" ref={dropdownRef}>
        <div
          className={`nav-avatar ${dropdownOpen ? 'nav-avatar-active' : ''}`}
          style={{ background: currentUser?.color }}
          onClick={() => setDropdownOpen((prev) => !prev)}
          title="Your account"
        >
          {currentUser?.initials || '?'}
        </div>

        {dropdownOpen && (
          <div className="nav-dropdown">
            <div className="nav-dropdown-header">
              <div className="nav-dropdown-avatar" style={{ background: currentUser?.color }}>
                {currentUser?.initials}
              </div>
              <div>
                <div className="nav-dropdown-name">{currentUser?.name}</div>
                <div className="nav-dropdown-email">{currentUser?.location || 'SkillSwap member'}</div>
              </div>
            </div>

            <div className="nav-dropdown-divider" />

            <button className="nav-dropdown-item" onClick={handleProfile}>
              <span className="nav-dropdown-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              View Profile
            </button>
            <button className="nav-dropdown-item" onClick={handleSettings}>
              <span className="nav-dropdown-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              Settings
            </button>

            <div className="nav-dropdown-divider" />

            <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
              <span className="nav-dropdown-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}