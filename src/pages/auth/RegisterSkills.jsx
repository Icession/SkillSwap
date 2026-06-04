import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const DEFAULT_OFFER = ['UI Design', 'Figma', 'Photography', 'Illustration', 'Copywriting', 'React', 'Python', 'Spanish']
const DEFAULT_WANT  = ['Photography', 'Calligraphy', 'UI Design', 'Python', 'Video Editing', 'Excel', 'Japanese']

export default function RegisterSkills() {
  const navigate = useNavigate()
  const [offerList, setOfferList] = useState(DEFAULT_OFFER)
  const [wantList,  setWantList]  = useState(DEFAULT_WANT)
  const [offering,  setOffering]  = useState([])
  const [wanting,   setWanting]   = useState([])
  const [customOffer, setCustomOffer] = useState('')
  const [customWant,  setCustomWant]  = useState('')

  const isFormValid = offering.length > 0 && wanting.length > 0

  useEffect(() => { console.log('Offering:', offering) }, [offering])
  useEffect(() => { console.log('Wanting:',  wanting)  }, [wanting])

  const toggleChip = (item, selected, setSelected) =>
    setSelected((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item])

  const addCustom = (value, setValue, list, setList, selected, setSelected) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (!list.includes(trimmed)) setList((prev) => [...prev, trimmed])
    if (!selected.includes(trimmed)) setSelected((prev) => [...prev, trimmed])
    setValue('')
  }

  const handleContinue = () => {
    sessionStorage.setItem('register_step2', JSON.stringify({ offering, wanting }))
    navigate('/register/availability')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-logo"><div className="logo-mark">S</div><span className="logo-name">SkillSwap</span></div>
        <div className="auth-hero"><h2>You're one step away from your first swap</h2><p>Join hundreds of students and professionals exchanging skills — no money, just knowledge.</p></div>
        <div className="steps-list">
          <div className="step-item"><div className="step-num done">✓</div><div className="step-text"><strong>Basic info</strong><span>Name, email, and location</span></div></div>
          <div className="step-item"><div className="step-num active">2</div><div className="step-text"><strong>Your skills</strong><span>What you offer and want to learn</span></div></div>
          <div className="step-item"><div className="step-num dim">3</div><div className="step-text"><strong>Availability</strong><span>When you're free to swap</span></div></div>
        </div>
        <div className="auth-footnote">Free forever · No credit card needed</div>
      </div>
      <div className="auth-right">
        <div className="progress-row"><span>Step 2 of 3 — Your skills</span><span>66%</span></div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: '66%' }} /></div>
        <h1>Your skills</h1>
        <p className="auth-sub">Tell us what you can offer and what you want to learn</p>
        <label>What can you offer? <span className="label-hint">{offering.length > 0 ? `${offering.length} selected` : 'select all that apply'}</span></label>
        <div className="chip-group">{offerList.map((s) => <span key={s} className={`chip ${offering.includes(s) ? 'chip-offer-sel' : ''}`} onClick={() => toggleChip(s, offering, setOffering)}>{s}</span>)}</div>
        <div className="add-row">
          <input type="text" placeholder="Add a skill not listed..." value={customOffer} onChange={(e) => setCustomOffer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom(customOffer, setCustomOffer, offerList, setOfferList, offering, setOffering)} />
          <button className="add-btn" onClick={() => addCustom(customOffer, setCustomOffer, offerList, setOfferList, offering, setOffering)}>+ Add</button>
        </div>
        <label style={{ marginTop: '18px' }}>What do you want to learn? <span className="label-hint">{wanting.length > 0 ? `${wanting.length} selected` : 'select all that apply'}</span></label>
        <div className="chip-group">{wantList.map((s) => <span key={s} className={`chip ${wanting.includes(s) ? 'chip-want-sel' : ''}`} onClick={() => toggleChip(s, wanting, setWanting)}>{s}</span>)}</div>
        <div className="add-row">
          <input type="text" placeholder="Add a skill not listed..." value={customWant} onChange={(e) => setCustomWant(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom(customWant, setCustomWant, wantList, setWantList, wanting, setWanting)} />
          <button className="add-btn" onClick={() => addCustom(customWant, setCustomWant, wantList, setWantList, wanting, setWanting)}>+ Add</button>
        </div>
        <button className="btn-primary" onClick={handleContinue} disabled={!isFormValid} style={{ opacity: isFormValid ? 1 : 0.5 }}>Continue →</button>
        <button className="btn-back" onClick={() => navigate('/register')}>← Back</button>
        <p className="signin-link">Already have an account? <span onClick={() => navigate('/login')}>Sign in</span></p>
      </div>
    </div>
  )
}