import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Settings, 
  BarChart3 
} from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { path: '/shards', icon: Database, label: 'Шарды' },
    { path: '/users', icon: Users, label: 'Пользователи' },
    { path: '/strategies', icon: Settings, label: 'Стратегии' },
    { path: '/monitoring', icon: BarChart3, label: 'Мониторинг' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sharding Manager</h2>
          <span className="subtitle">PostgreSQL</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout