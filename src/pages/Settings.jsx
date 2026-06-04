import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import './Settings.css'

const OFFER_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const WANT_LEVELS  = ['Beginner', 'Intermediate', 'Advanced', 'Any level']

export default function Settings() {
  const navigate = useNavigate()
  const { currentUser, updateProfile, logout } = useApp()

  const [form, setForm] = useState({
    name: currentUser.name,
    role: currentUser.role,
    location: currentUser.location,
    bio: currentUser.bio,
  })
  const [offer, setOffer] = useState(currentUser.offer)
  const [want, setWant]   = useState(currentUser.want)
  const [offerLevels, setOfferLevels] = useState(currentUser.offerLevels || {})
  const [wantLevels, setWantLevels]   = useState(currentUser.wantLevels || {})
  const [newOffer, setNewOffer] = useState('')
  const [newWant, setNewWant]   = useState('')
  const [saved, setSaved] = useState(false)

  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); setSaved(false) }

  const addSkill = (value, setValue, list, setList, levels, setLevels, defaultLevel) => {
    const t = value.trim()
    if (t && !list.includes(t)) {
      setList([...list, t])
      setLevels({ ...levels, [t]: defaultLevel })
    }
    setValue('')
    setSaved(false)
  }

  const removeSkill = (skill, list, setList, levels, setLevels) => {
    setList(list.filter((s) => s !== skill))
    const next = { ...levels }
    delete next[skill]
    setLevels(next)
    setSaved(false)
  }

  const changeLevel = (skill, value, levels, setLevels) => {
    setLevels({ ...levels, [skill]: value })
    setSaved(false)
  }

  const handleSave = () => {
    const initials = form.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    updateProfile({ ...form, initials, offer, want, offerLevels, wantLevels })
    setSaved(true)
  }

  return (
    <div className="set-page">
      <Navbar />
      <div className="set-wrap">
        <h1 className="set-heading">Settings</h1>
        <p className="set-sub">Update your profile, skills, and account.</p>

        <div className="set-card">
          <div className="set-card-lbl">Profile</div>
          <div className="set-avatar-row">
            <div className="set-avatar" style={{ background: currentUser.color }}>
              {form.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="set-avatar-meta">{currentUser.location || 'Add your location'} · Joined {currentUser.joined}</div>
          </div>

          <label className="set-label">Full name</label>
          <input className="set-input" value={form.name} onChange={(e) => set('name', e.target.value)} />

          <label className="set-label">Headline / role</label>
          <input className="set-input" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. UI Designer" />

          <label className="set-label">Location</label>
          <input className="set-input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />

          <label className="set-label">About</label>
          <textarea className="set-textarea" rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>

        <div className="set-card">
          <div className="set-card-lbl">Skills you offer</div>
          {offer.length === 0 && <div className="set-chip-empty">No skills yet</div>}
          {offer.map((skill) => (
            <div key={skill} className="set-skill-row">
              <span className="set-skill-name set-skill-offer">{skill}</span>
              <select
                className="set-level-select"
                value={offerLevels[skill] || 'Intermediate'}
                onChange={(e) => changeLevel(skill, e.target.value, offerLevels, setOfferLevels)}
              >
                {OFFER_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <span className="set-skill-x" onClick={() => removeSkill(skill, offer, setOffer, offerLevels, setOfferLevels)}>✕</span>
            </div>
          ))}
          <div className="set-add-row">
            <input value={newOffer} onChange={(e) => setNewOffer(e.target.value)} placeholder="Add a skill you can teach..."
              onKeyDown={(e) => e.key === 'Enter' && addSkill(newOffer, setNewOffer, offer, setOffer, offerLevels, setOfferLevels, 'Intermediate')} />
            <button onClick={() => addSkill(newOffer, setNewOffer, offer, setOffer, offerLevels, setOfferLevels, 'Intermediate')}>+ Add</button>
          </div>

          <div className="set-card-lbl" style={{ marginTop: '24px' }}>Skills you want to learn</div>
          {want.length === 0 && <div className="set-chip-empty">No skills yet</div>}
          {want.map((skill) => (
            <div key={skill} className="set-skill-row">
              <span className="set-skill-name set-skill-want">{skill}</span>
              <select
                className="set-level-select"
                value={wantLevels[skill] || 'Any level'}
                onChange={(e) => changeLevel(skill, e.target.value, wantLevels, setWantLevels)}
              >
                {WANT_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <span className="set-skill-x" onClick={() => removeSkill(skill, want, setWant, wantLevels, setWantLevels)}>✕</span>
            </div>
          ))}
          <div className="set-add-row">
            <input value={newWant} onChange={(e) => setNewWant(e.target.value)} placeholder="Add a skill you want to learn..."
              onKeyDown={(e) => e.key === 'Enter' && addSkill(newWant, setNewWant, want, setWant, wantLevels, setWantLevels, 'Any level')} />
            <button onClick={() => addSkill(newWant, setNewWant, want, setWant, wantLevels, setWantLevels, 'Any level')}>+ Add</button>
          </div>
        </div>

        <div className="set-actions">
          <button className="set-save" onClick={handleSave}>{saved ? 'Saved ✓' : 'Save changes'}</button>
          <button className="set-view" onClick={() => navigate(`/profile/${currentUser.id}`)}>View my profile</button>
          <button className="set-logout" onClick={() => { logout(); navigate('/login') }}>Log out</button>
        </div>
      </div>
    </div>
  )
}