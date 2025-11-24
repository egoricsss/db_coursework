import React, { useContext } from 'react'
import { AppContext } from '../../App'
import './Dashboard.css'

// Иконки для замены lucide-react
const Database = () => <span>🗄️</span>
const Users = () => <span>👥</span>
const Settings = () => <span>⚙️</span>
const Activity = () => <span>📈</span>

const Dashboard = () => {
  const { globalStats, loading } = useContext(AppContext)

  if (loading) {
    return <div className="loading">Загрузка данных...</div>
  }

  if (!globalStats) {
    return <div className="loading">Нет данных для отображения</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Обзор системы шардирования</h1>
        <p>Мониторинг состояния кластера PostgreSQL</p>
      </header>

      <div className="stats-grid">
        <StatCard
          icon={<Database />}
          title="Всего шардов"
          value={globalStats.shards?.total_shards || 0}
          color="#3b82f6"
        />
        <StatCard
          icon={<Users />}
          title="Всего пользователей"
          value={globalStats.users?.total_users || 0}
          color="#10b981"
        />
        <StatCard
          icon={<Settings />}
          title="Текущая стратегия"
          value={globalStats.shards?.current_strategy || 'hash'}
          color="#f59e0b"
        />
        <StatCard
          icon={<Activity />}
          title="Статус системы"
          value="Активна"
          color="#ef4444"
        />
      </div>

      <div className="dashboard-content">
        <div className="shards-distribution">
          <h3>Распределение пользователей по шардам</h3>
          <div className="distribution-chart">
            {globalStats.users?.users_per_shard && Object.entries(globalStats.users.users_per_shard).map(([shard, count]) => (
              <div key={shard} className="shard-bar">
                <div className="shard-info">
                  <span>{shard}</span>
                  <span>{count} пользователей</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(count / globalStats.users.total_users) * 100}%`,
                      backgroundColor: getShardColor(shard)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="system-info">
          <h3>Информация о системе</h3>
          <div className="info-grid">
            <InfoItem label="Текущая стратегия" value={globalStats.shards?.current_strategy || 'Unknown'} />
            <InfoItem label="Всего шардов" value={globalStats.shards?.total_shards || 0} />
            <InfoItem label="Всего пользователей" value={globalStats.users?.total_users || 0} />
            <InfoItem label="Статус базы данных" value="Активна" />
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, title, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
)

const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <span className="info-label">{label}:</span>
    <span className="info-value">{value}</span>
  </div>
)

const getShardColor = (shard) => {
  const colors = {
    shard1: '#3b82f6',
    shard2: '#10b981', 
    shard3: '#f59e0b',
    shard4: '#ef4444'
  }
  return colors[shard] || '#6b7280'
}

export default Dashboard