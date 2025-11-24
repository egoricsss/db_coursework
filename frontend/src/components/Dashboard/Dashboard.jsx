import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { 
  Database, 
  Users, 
  Cpu, 
  Activity 
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [shardsInfo, setShardsInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, shardsData] = await Promise.all([
        apiService.getUserStats(),
        apiService.getShardsInfo()
      ])
      setStats(statsData)
      setShardsInfo(shardsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка данных...</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Обзор системы шардирования</h1>
        <p>Мониторинг состояния кластера PostgreSQL</p>
      </header>

      <div className="stats-grid">
        <StatCard
          icon={<Database size={24} />}
          title="Всего шардов"
          value={shardsInfo?.total_shards || 0}
          color="#3b82f6"
        />
        <StatCard
          icon={<Users size={24} />}
          title="Всего пользователей"
          value={stats?.total_users || 0}
          color="#10b981"
        />
        <StatCard
          icon={<Cpu size={24} />}
          title="Текущая стратегия"
          value={stats?.strategy || 'hash'}
          color="#f59e0b"
        />
        <StatCard
          icon={<Activity size={24} />}
          title="Статус системы"
          value="Активна"
          color="#ef4444"
        />
      </div>

      <div className="dashboard-content">
        <div className="shards-distribution">
          <h3>Распределение пользователей по шардам</h3>
          <div className="distribution-chart">
            {stats?.users_per_shard && Object.entries(stats.users_per_shard).map(([shard, count]) => (
              <div key={shard} className="shard-bar">
                <div className="shard-info">
                  <span>{shard}</span>
                  <span>{count} пользователей</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(count / stats.total_users) * 100}%`,
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
            <InfoItem label="Текущая стратегия" value={stats?.strategy} />
            <InfoItem label="Всего операций" value="Загрузка..." />
            <InfoItem label="Среднее время ответа" value="Загрузка..." />
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