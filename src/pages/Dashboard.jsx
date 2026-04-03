import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { SWAP_REQUESTS } from '../data'
import './Dashboard.css'

const STATS = [
  { value: '1,450', label: 'Total users',    delta: '+12% this month', deltaColor: '#298C6E' },
  { value: '350',   label: 'Active swaps',   delta: '+8% this month',  deltaColor: '#298C6E' },
  { value: '93',    label: 'Pending request',delta: 'Review needed',   deltaColor: '#F4A44A' },
]

const SIDEBAR_LINKS = ['Dashboard', 'Users', 'Swaps', 'Skills', 'Reports']

export default function Dashboard() {
  const [activeLink, setActiveLink] = useState('Dashboard')

  const [swapRequests, setSwapRequests] = useState([])

  const [statusFilter, setStatusFilter] = useState('All')

  const filteredRequests =
    statusFilter === 'All'
      ? swapRequests
      : swapRequests.filter((r) => r.status === statusFilter)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSwapRequests(SWAP_REQUESTS)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log('Active section:', activeLink)
  }, [activeLink])

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'status-pending'
    if (status === 'Active')  return 'status-active'
    return 'status-done'
  }

  return (
    <div className="dash-page">
      <Navbar showBack />

      <div className="dash-body">
        <aside className="dash-sidebar">
          <div className="dash-brand">
            <div className="dash-brand-mark">S</div>
            <span className="dash-brand-name">SkillSwap</span>
          </div>

          <nav className="dash-nav">
            {SIDEBAR_LINKS.map((link) => (
              <div
                key={link}
                className={`dash-nav-item ${activeLink === link ? 'dash-nav-active' : ''}`}
                onClick={() => setActiveLink(link)}
              >
                {activeLink === link && <div className="dash-nav-pip" />}
                {link}
              </div>
            ))}
          </nav>

          <div className="dash-user">
            <div className="dash-user-lbl">User</div>
            <div className="dash-user-name">Maria Sanchez</div>
          </div>
        </aside>

        <main className="dash-main">
          <h1 className="dash-heading">Overview</h1>

          <div className="dash-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="dash-stat-card">
                <div className="dash-stat-val">{stat.value}</div>
                <div className="dash-stat-lbl">{stat.label}</div>
                <div className="dash-stat-delta" style={{ color: stat.deltaColor }}>
                  {stat.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="dash-table-header">
            <h2 className="dash-subheading">Recent Swap Request</h2>
            <div className="dash-filter-row">
              {['All', 'Pending', 'Active', 'Done'].map((f) => (
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

          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Skill Exchange</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((row) => (
                  <tr key={row.id}>
                    <td className="td-name">{row.requester}</td>
                    <td className="td-exchange">{row.exchange}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="td-date">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}