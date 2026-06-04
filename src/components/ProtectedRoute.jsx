import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Gate for authenticated pages. Waits while the session resolves, then either
// renders the page or bounces to /login.
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useApp()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#8AA09A', fontSize: 14,
      }}>
        Loading…
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  return children
}