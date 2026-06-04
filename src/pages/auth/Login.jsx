import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isFormValid = email.trim() !== '' && password.trim() !== ''

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSignIn = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    const result = await login(email, password)
    if (result.error) { setError(result.error); return }
    navigate('/feed')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="logo-mark">S</div>
          <span className="logo-name">SkillSwap</span>
        </div>
        <div className="auth-hero">
          <h2>Trade for what you know for what you need</h2>
          <p>Connect with students and professionals nearby. Exchange skills with no money — just time and knowledge.</p>
          <div className="pill-row">
            <span className="pill">UI Design</span>
            <span className="pill">Spanish</span>
            <span className="pill">Communication</span>
            <span className="pill">Photography</span>
            <span className="pill">Painting</span>
          </div>
        </div>
        <div className="auth-footnote">1,284 skills shared · Cebu &amp; beyond</div>
      </div>
      <div className="auth-right">
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to continue to SkillSwap</p>
        {error && <div className="error-msg">{error}</div>}
        <label>Email address</label>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <div className="input-with-toggle">
          <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</span>
        </div>
        <button className="btn-primary" onClick={handleSignIn} disabled={!isFormValid} style={{ opacity: isFormValid ? 1 : 0.5 }}>Sign in</button>
        <div className="divider"><hr /><span>or</span><hr /></div>
        <button className="btn-ghost" onClick={() => navigate('/register')}>Create an account</button>
        <p className="forgot">Forgot your password?</p>
      </div>
    </div>
  )
}