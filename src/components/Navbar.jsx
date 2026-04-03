import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ showBack = false }) {
  const navigate = useNavigate()
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
    sessionStorage.clear()
    navigate('/login')
  }

  const handleProfile = () => {
    setDropdownOpen(false)
    navigate('/profile/1')
  }

  const handleSettings = () => {
    setDropdownOpen(false)
    navigate('/settings')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        {showBack && (
          <button className="nav-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}
        <div className="nav-logo" onClick={() => navigate('/feed')}>
          <div className="nav-logo-mark">S</div>
          <span className="nav-logo-name">SkillSwap</span>
        </div>
      </div>

      <div className="nav-links">
        <span className="nav-link nav-link-active" onClick={() => navigate('/feed')}>Discover</span>
        <span className="nav-link" onClick={() => navigate('/swaps')}>My Swaps</span>
        <span className="nav-link" onClick={() => navigate('/messages')}>Messages</span>
        <span className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</span>
      </div>

      <div className="nav-right" ref={dropdownRef}>
        <div
          className={`nav-avatar ${dropdownOpen ? 'nav-avatar-active' : ''}`}
          onClick={() => setDropdownOpen((prev) => !prev)}
          title="Your account"
        >
          JC
        </div>

        {dropdownOpen && (
          <div className="nav-dropdown">
            <div className="nav-dropdown-header">
              <div className="nav-dropdown-avatar">JC</div>
              <div>
                <div className="nav-dropdown-name">Josh Carper</div>
                <div className="nav-dropdown-email">josh@gmail.com</div>
              </div>
            </div>

            <div className="nav-dropdown-divider" />

            <button className="nav-dropdown-item" onClick={handleProfile}>
              <span className="nav-dropdown-icon">👤</span>
              View Profile
            </button>
            <button className="nav-dropdown-item" onClick={handleSettings}>
              <span className="nav-dropdown-icon">⚙️</span>
              Settings
            </button>

            <div className="nav-dropdown-divider" />

            <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
              <span className="nav-dropdown-icon">🚪</span>
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}