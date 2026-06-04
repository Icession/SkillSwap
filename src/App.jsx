import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RegisterSkills from './pages/auth/RegisterSkills'
import RegisterAvailability from './pages/auth/RegisterAvailability'
import SkillFeed from './pages/SkillFeed'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import MySwaps from './pages/MySwaps'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                      element={<Landing />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/register"              element={<Register />} />
          <Route path="/register/skills"       element={<RegisterSkills />} />
          <Route path="/register/availability" element={<RegisterAvailability />} />

          <Route path="/feed"        element={<ProtectedRoute><SkillFeed /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/swaps"       element={<ProtectedRoute><MySwaps /></ProtectedRoute>} />
          <Route path="/messages"    element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}