import { useNavigate } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="nf">
      <div className="nf-card">
        <div className="nf-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <button className="nf-btn" onClick={() => navigate('/')}>Back to home</button>
      </div>
    </div>
  )
}