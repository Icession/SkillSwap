import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const DAYS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const TIMES = [
  '6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM',
]
const createSlot = (id) => ({ id, from: '9:00 AM', to: '5:00 PM', enabled: true })

export default function RegisterAvailability() {
  const navigate = useNavigate()

  const [selectedDays, setSelectedDays] = useState(['Mo', 'Tu', 'We', 'Th', 'Fr'])
  const [slots, setSlots] = useState([createSlot(1), createSlot(2)])
  const [hours, setHours] = useState(2)

  const isFormValid = selectedDays.length > 0 && slots.some((s) => s.enabled)

  const activeSlots = slots.filter((s) => s.enabled)
  const summary =
    selectedDays.length > 0 && activeSlots.length > 0
      ? `Available on ${selectedDays.join(', ')} from ${activeSlots
          .map((s) => `${s.from} – ${s.to}`)
          .join(' and ')}`
      : ''

  useEffect(() => {
    console.log('Availability updated:', { selectedDays, slots })
  }, [selectedDays, slots])

  const toggleDay  = (day) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )

  const toggleSlot = (id) =>
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s))

  const updateSlot = (id, field, value) =>
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))

  const addSlot = () =>
    setSlots((prev) => [...prev, createSlot(Math.max(...prev.map((s) => s.id)) + 1)])

  const removeSlot = (id) =>
    setSlots((prev) => prev.filter((s) => s.id !== id))

  const handleFinish = () => {
    sessionStorage.setItem(
      'register_step3',
      JSON.stringify({ selectedDays, slots: slots.filter((s) => s.enabled), hours })
    )
    navigate('/login')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="logo-mark">S</div>
          <span className="logo-name">SkillSwap</span>
        </div>
        <div className="auth-hero">
          <h2>You're one step away from your first swap</h2>
          <p>Join hundreds of students and professionals exchanging skills — no money, just knowledge.</p>
        </div>
        <div className="steps-list">
          <div className="step-item">
            <div className="step-num done">✓</div>
            <div className="step-text"><strong>Basic info</strong><span>Name, email, and location</span></div>
          </div>
          <div className="step-item">
            <div className="step-num done">✓</div>
            <div className="step-text"><strong>Your skills</strong><span>What you offer and want to learn</span></div>
          </div>
          <div className="step-item">
            <div className="step-num active">3</div>
            <div className="step-text"><strong>Availability</strong><span>When you're free to swap</span></div>
          </div>
        </div>
        <div className="auth-footnote">Free forever · No credit card needed</div>
      </div>

      <div className="auth-right">
        <div className="progress-row">
          <span>Step 3 of 3 — Availability</span>
          <span>99%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '99%' }} />
        </div>

        <h1>Availability</h1>
        <p className="auth-sub">Let others know when you're free to swap skills</p>

        <label>Which days are you available?</label>
        <div className="day-row">
          {DAYS.map((day) => (
            <div
              key={day}
              className={`day-chip ${selectedDays.includes(day) ? 'day-sel' : ''}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </div>
          ))}
        </div>

        <label>What time are you available?</label>
        <div className="slot-list">
          {slots.map((slot) => (
            <div key={slot.id} className={`slot-row ${slot.enabled ? 'slot-active' : ''}`}>
              <div
                className={`slot-check ${slot.enabled ? 'checked' : ''}`}
                onClick={() => toggleSlot(slot.id)}
              >
                {slot.enabled && <span className="check-mark">✓</span>}
              </div>
              <span className="slot-label">From</span>
              <select
                className="time-select"
                value={slot.from}
                disabled={!slot.enabled}
                onChange={(e) => updateSlot(slot.id, 'from', e.target.value)}
              >
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <span className="slot-label">to</span>
              <select
                className="time-select"
                value={slot.to}
                disabled={!slot.enabled}
                onChange={(e) => updateSlot(slot.id, 'to', e.target.value)}
              >
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {slots.length > 1 && (
                <span className="remove-slot" onClick={() => removeSlot(slot.id)}>✕</span>
              )}
            </div>
          ))}
        </div>

        <div className="add-slot" onClick={addSlot}>
          <span className="plus-icon">+</span> Add another time slot
        </div>

        {summary && <div className="avail-summary">{summary}</div>}

        <label>How many hours per week can you commit?</label>
        <div className="hrs-row">
          <input
            type="number"
            min={1}
            max={40}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="hrs-input"
          />
          <span className="hrs-label">hours per week</span>
        </div>

        <button
          className="btn-primary"
          onClick={handleFinish}
          disabled={!isFormValid}
          style={{ opacity: isFormValid ? 1 : 0.5 }}
        >
          Finish &amp; create account →
        </button>
        <button className="btn-back" onClick={() => navigate('/register/skills')}>
          ← Back
        </button>

        <p className="signin-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  )
}