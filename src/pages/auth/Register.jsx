import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
  })

  const [submitErrors, setSubmitErrors] = useState({})

  const confirmPasswordError =
    form.confirmPassword && form.password !== form.confirmPassword
      ? 'Passwords do not match'
      : ''

  const isFormValid =
    Object.values(form).every((v) => v.trim() !== '') &&
    form.password === form.confirmPassword

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleContinue = () => {
    if (!form.email.includes('@')) {
      setSubmitErrors((prev) => ({ ...prev, email: 'Enter a valid email address' }))
      return
    }
    if (form.password.length < 6) {
      setSubmitErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }))
      return
    }
    sessionStorage.setItem('register_step1', JSON.stringify(form))
    navigate('/register/skills')
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
            <div className="step-num active">1</div>
            <div className="step-text"><strong>Basic info</strong><span>Name, email, and location</span></div>
          </div>
          <div className="step-item">
            <div className="step-num dim">2</div>
            <div className="step-text"><strong>Your skills</strong><span>What you offer and want to learn</span></div>
          </div>
          <div className="step-item">
            <div className="step-num dim">3</div>
            <div className="step-text"><strong>Availability</strong><span>When you're free to swap</span></div>
          </div>
        </div>
        <div className="auth-footnote">Free forever · No credit card needed</div>
      </div>

      <div className="auth-right">
        <div className="progress-row">
          <span>Step 1 of 3 — Basic info</span>
          <span>33%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '33%' }} />
        </div>

        <h1>Create your account</h1>
        <p className="auth-sub">Start by telling us a little bit about yourself</p>

        <div className="field-row">
          <div>
            <label>First name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label>Last name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>
        </div>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {submitErrors.email && <p className="field-error">{submitErrors.email}</p>}

        <div className="field-row">
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            {submitErrors.password && <p className="field-error">{submitErrors.password}</p>}
          </div>
          <div>
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Reconfirm your password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
            />
            {confirmPasswordError && <p className="field-error">{confirmPasswordError}</p>}
          </div>
        </div>

        <label>City / Location</label>
        <input
          type="text"
          placeholder="Enter location"
          value={form.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />

        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!isFormValid}
          style={{ opacity: isFormValid ? 1 : 0.5 }}
        >
          Continue →
        </button>

        <p className="signin-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  )
}