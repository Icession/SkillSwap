import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import './Dashboard.css'

const STATUS_FILTERS = ['All', 'Pending', 'Active', 'Done']

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, mySwaps, pendingIncoming, getUser } = useApp()
  const [statusFilter, setStatusFilter] = useState('All')

  const counts = useMemo(() => ({
    active: mySwaps.filter((s) => s.status === 'Active').length,
    done:   mySwaps.filter((s) => s.status === 'Done').length,
  }), [mySwaps])

  const filtered =
    statusFilter === 'All' ? mySwaps : mySwaps.filter((s) => s.status === statusFilter)

  const navItems = [
    { label: 'Overview',   path: '/dashboard' },
    { label: 'My Swaps',   path: '/swaps' },
    { label: 'Messages',   path: '/messages' },
    { label: 'My Profile', path: `/profile/${currentUser.id}` },
    { label: 'Settings',   path: '/settings' },
  ]

  const otherParty = (swap) =>
    getUser(swap.requesterId === currentUser.id ? swap.recipientId : swap.requesterId)

  const statusClass = (s) =>
    s === 'Pending' ? 'status-pending' : s === 'Active' ? 'status-active' : 'status-done'

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-body">
        <aside className="dash-sidebar">
          <div className="dash-brand">
            <div className="dash-brand-mark">S</div>
            <span className="dash-brand-name">SkillSwap</span>
          </div>

          <nav className="dash-nav">
            {navItems.map((item, i) => (
              <div
                key={item.label}
                className={`dash-nav-item ${i === 0 ? 'dash-nav-active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {i === 0 && <div className="dash-nav-pip" />}
                {item.label}
              </div>
            ))}
          </nav>

          <div className="dash-user">
            <div className="dash-user-lbl">Signed in as</div>
            <div className="dash-user-name">{currentUser.name}</div>
          </div>
        </aside>

        <main className="dash-main">
          <h1 className="dash-heading">Your activity</h1>

          <div className="dash-stats">
            <div className="dash-stat-card">
              <div className="dash-stat-val">{counts.active}</div>
              <div className="dash-stat-lbl">Active swaps</div>
              <div className="dash-stat-delta" style={{ color: '#298C6E' }}>
                {counts.active > 0 ? 'In progress' : 'None yet'}
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-val">{pendingIncoming}</div>
              <div className="dash-stat-lbl">Pending requests</div>
              <div className="dash-stat-delta" style={{ color: pendingIncoming > 0 ? '#F4A44A' : '#8AA09A' }}>
                {pendingIncoming > 0 ? 'Needs your response' : 'All caught up'}
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-val">{counts.done}</div>
              <div className="dash-stat-lbl">Completed swaps</div>
              <div className="dash-stat-delta" style={{ color: '#298C6E' }}>
                {counts.done > 0 ? 'Nicely done' : 'None yet'}
              </div>
            </div>
          </div>

          <div className="dash-table-header">
            <h2 className="dash-subheading">Your swaps</h2>
            <div className="dash-filter-row">
              {STATUS_FILTERS.map((f) => (
                <span
                  key={f}
                  className={`dash-filter-chip ${statusFilter === f ? 'dash-filter-active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="dash-empty">
              {statusFilter === 'All'
                ? "You haven't made any swaps yet. Head to Discover to find someone to learn from."
                : `No ${statusFilter.toLowerCase()} swaps.`}
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Skill Exchange</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((swap) => {
                    const other = otherParty(swap)
                    return (
                      <tr key={swap.id}>
                        <td className="td-name">{other?.name || 'Unknown'}</td>
                        <td className="td-exchange">{swap.offerSkill} ↔ {swap.wantSkill}</td>
                        <td>
                          <span className={`status-pill ${statusClass(swap.status)}`}>{swap.status}</span>
                        </td>
                        <td className="td-date">{fmtDate(swap.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}