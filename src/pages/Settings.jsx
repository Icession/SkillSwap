import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import './Settings.css'

const OFFER_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const WANT_LEVELS  = ['Beginner', 'Intermediate', 'Advanced', 'Any level']
const AVAILABILITY = ['Available Now', 'Busy this week', 'Away']
const COLORS = [
  '#298C6E', '#1F6F57', '#2F7D8C', '#3A6EA5', '#4F6BED', '#6C5CE7',
  '#9C5C90', '#C0392B', '#D35400', '#E08A4B', '#B26B16', '#5A8F3C',
  '#7A8C29', '#5D4037', '#566573', '#1F2D27',
]

export default function Settings() {
  const navigate = useNavigate()
  const { currentUser, updateProfile, logout, changePassword, deleteAccount } = useApp()

  const [form, setForm] = useState({
    name: currentUser.name,
    role: currentUser.role,
    location: currentUser.location,
    bio: currentUser.bio,
  })
  const [availability, setAvailability] = useState(currentUser.availability || 'Available Now')
  const [hours, setHours] = useState(currentUser.hoursPerWeek ?? '')
  const [avatarColor, setAvatarColor] = useState(currentUser.color || '#298C6E')
  const [offer, setOffer] = useState(currentUser.offer)
  const [want, setWant]   = useState(currentUser.want)
  const [offerLevels, setOfferLevels] = useState(currentUser.offerLevels || {})
  const [wantLevels, setWantLevels]   = useState(currentUser.wantLevels || {})
  const [newOffer, setNewOffer] = useState('')
  const [newWant, setNewWant]   = useState('')
  const [saved, setSaved] = useState(false)

  // password
  const [pw, setPw]   = useState('')
  const [pw2, setPw2] = useState('')
  const [pwMsg, setPwMsg]   = useState(null)
  const [pwBusy, setPwBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // delete account
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [delText, setDelText] = useState('')
  const [delBusy, setDelBusy] = useState(false)
  const [delErr, setDelErr] = useState(null)

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
    updateProfile({
      ...form, initials, offer, want, offerLevels, wantLevels,
      availability,
      hoursPerWeek: hours === '' ? null : Number(hours),
      avatarColor,
    })
    setSaved(true)
  }

  const handlePassword = async () => {
    if (pw.length < 6) { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return }
    if (pw !== pw2)    { setPwMsg({ type: 'error', text: "Passwords don't match." }); return }
    setPwBusy(true); setPwMsg(null)
    const res = await changePassword(pw)
    setPwBusy(false)
    if (res?.error) setPwMsg({ type: 'error', text: res.error })
    else { setPwMsg({ type: 'ok', text: 'Password updated ✓' }); setPw(''); setPw2('') }
  }

  const handleDelete = async () => {
    if (delText !== 'DELETE') return
    setDelBusy(true); setDelErr(null)
    const res = await deleteAccount()
    setDelBusy(false)
    if (res?.error) { setDelErr(res.error); return }
    navigate('/')
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
            <div className="set-avatar" style={{ background: avatarColor }}>
              {form.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="set-avatar-meta">{form.location || 'Add your location'} · Joined {currentUser.joined}</div>
          </div>

          <label className="set-label">Full name</label>
          <input className="set-input" value={form.name} onChange={(e) => set('name', e.target.value)} />

          <label className="set-label">Headline / role</label>
          <input className="set-input" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. UI Designer" />

          <label className="set-label">Location</label>
          <input className="set-input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />

          <label className="set-label">About</label>
          <textarea className="set-textarea" rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />

          <label className="set-label">Availability</label>
          <select className="set-input" value={availability} onChange={(e) => { setAvailability(e.target.value); setSaved(false) }}>
            {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <label className="set-label">Hours per week you can commit</label>
          <input className="set-input" type="number" min="0" max="80" value={hours}
            onChange={(e) => { setHours(e.target.value); setSaved(false) }} placeholder="e.g. 5" />

          <label className="set-label">Avatar color</label>
          <div className="set-swatches">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`set-swatch ${avatarColor.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => { setAvatarColor(c); setSaved(false) }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
          <div className="set-custom-row">
            <input
              type="color"
              className="set-color-input"
              value={avatarColor}
              onChange={(e) => { setAvatarColor(e.target.value); setSaved(false) }}
              aria-label="Custom avatar color"
            />
            <span className="set-custom-hint">Or pick any custom color</span>
          </div>
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

        <div className="set-card">
          <div className="set-card-lbl">Account</div>
          <p className="set-account-hint">Change the password you use to sign in.</p>
          <div className="set-pw-grid">
            <div className="set-pw-col">
              <label className="set-label">New password</label>
              <input className="set-input" type={showPw ? 'text' : 'password'} value={pw}
                onChange={(e) => { setPw(e.target.value); setPwMsg(null) }} placeholder="At least 6 characters" />
            </div>
            <div className="set-pw-col">
              <label className="set-label">Confirm password</label>
              <input className="set-input" type={showPw ? 'text' : 'password'} value={pw2}
                onChange={(e) => { setPw2(e.target.value); setPwMsg(null) }} placeholder="Re-enter password" />
            </div>
          </div>
          <label className="set-pw-show">
            <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
            Show password
          </label>
          {pwMsg && (
            <div className={`set-msg ${pwMsg.type === 'error' ? 'set-msg-error' : 'set-msg-ok'}`}>{pwMsg.text}</div>
          )}
          <button className="set-pw-btn" onClick={handlePassword} disabled={pwBusy}>
            {pwBusy ? 'Updating…' : 'Update password'}
          </button>
        </div>

        <div className="set-card set-danger">
          <div className="set-card-lbl set-danger-lbl">Danger zone</div>
          <p className="set-danger-text">
            Permanently delete your account, profile, swaps, and messages. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <button className="set-danger-btn" onClick={() => setConfirmDelete(true)}>Delete account</button>
          ) : (
            <div className="set-danger-confirm">
              <label className="set-label">Type <strong>DELETE</strong> to confirm</label>
              <input
                className="set-input"
                value={delText}
                onChange={(e) => { setDelText(e.target.value); setDelErr(null) }}
                placeholder="DELETE"
              />
              {delErr && <div className="set-msg set-msg-error">{delErr}</div>}
              <div className="set-danger-actions">
                <button className="set-cancel" onClick={() => { setConfirmDelete(false); setDelText(''); setDelErr(null) }}>
                  Cancel
                </button>
                <button className="set-danger-btn" disabled={delText !== 'DELETE' || delBusy} onClick={handleDelete}>
                  {delBusy ? 'Deleting…' : 'Delete my account permanently'}
                </button>
              </div>
            </div>
          )}
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