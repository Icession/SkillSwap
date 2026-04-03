import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterSkills from './pages/RegisterSkills'
import RegisterAvailability from './pages/RegisterAvailability'
import SkillFeed from './pages/SkillFeed'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                       element={<Navigate to="/login" />} />
        <Route path="/login"                  element={<Login />} />
        <Route path="/register"               element={<Register />} />
        <Route path="/register/skills"        element={<RegisterSkills />} />
        <Route path="/register/availability"  element={<RegisterAvailability />} />
        <Route path="/feed"                   element={<SkillFeed />} />
        <Route path="/profile/:id"            element={<Profile />} />
        <Route path="/dashboard"              element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}