import React, { useState, useEffect } from 'react'
import { Database, HardDrive, Cpu, MemoryStick, Users, RefreshCw } from 'lucide-react'
import { useShards } from '../../hooks/useApi'
import './ShardInfo.css'

const ShardInfo = () => {
  const [shardsData, setShardsData] = useState(null)
  
  // Используем кастомный хук для шардов
  const { 
    loading, 
    error, 
    getShardsInfo, 
    clearError 
  } = useShards()

  useEffect(() => {
    loadShardsInfo()
  }, [])

  const loadShardsInfo = async () => {
    try {
      const data = await getShardsInfo()
      setShardsData(data)
    } catch (error) {
      console.error('Error loading shards info:', error)
    }
  }

  const handleRefresh = () => {
    loadShardsInfo()
  }

  if (loading && !shardsData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Загрузка информации о шардах...</div>
      </div>
    )
  }

  return (
    <div className="shard-info">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Информация о шардах</h1>
            <p>Детальная информация о каждом шарде в кластере</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="refresh-btn"
          >
            <RefreshCw size={16} />
            {loading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
      </header>

      {/* Отображение ошибок */}
      {error && (
        <div className="error-message">
          <span>Ошибка загрузки данных: {error.message}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="shards-grid">
        {shardsData?.shards && Object.entries(shardsData.shards).map(([shardName, shardInfo]) => (
          <ShardCard 
            key={shardName}
            name={shardName}
            info={shardInfo}
          />
        ))}
        
        {(!shardsData?.shards || Object.keys(shardsData.shards).length === 0) && !loading && (
          <div className="no-shards">
            <Database size={48} />
            <h3>Шарды не найдены</h3>
            <p>Нет доступных шардов для отображения</p>
          </div>
        )}
      </div>

      <div className="cluster-info">
        <h3>Информация о кластере</h3>
        <div className="cluster-stats">
          <div className="cluster-stat">
            <Database size={20} />
            <span>Всего шардов: {shardsData?.total_shards || 0}</span>
          </div>
          <div className="cluster-stat">
            <Cpu size={20} />
            <span>Текущая стратегия: {shardsData?.current_strategy || 'Не указана'}</span>
          </div>
          <div className="cluster-stat">
            <Users size={20} />
            <span>Всего пользователей: {shardsData?.total_users || 0}</span>
          </div>
        </div>
        
        {/* Дополнительная статистика кластера */}
        {shardsData?.shards && (
          <div className="cluster-metrics">
            <h4>Распределение нагрузки</h4>
            <div className="metrics-grid">
              {Object.entries(shardsData.shards).map(([shardName, shardInfo]) => {
                const usagePercent = Math.min((shardInfo.user_count / 1000) * 100, 100)
                return (
                  <div key={shardName} className="metric-item">
                    <span className="shard-name">{shardName}</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${usagePercent}%`,
                          backgroundColor: getUsageColor(usagePercent)
                        }}
                      ></div>
                    </div>
                    <span className="metric-value">{shardInfo.user_count} users</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ShardCard = ({ name, info }) => {
  const getUsageColor = (usage) => {
    if (usage < 70) return '#10b981' // green
    if (usage < 90) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const usagePercent = Math.min((info.user_count / 1000) * 100, 100)
  const isHealthy = usagePercent < 90

  return (
    <div className={`shard-card ${isHealthy ? 'healthy' : 'warning'}`}>
      <div className="shard-header">
        <div className="shard-icon">
          <Database size={24} />
        </div>
        <div className="shard-title">
          <h3>{name.toUpperCase()}</h3>
          <span className="shard-id">ID: {info.id || name}</span>
        </div>
      </div>
      
      <div className="shard-stats">
        <div className="shard-stat">
          <Users size={16} />
          <div className="stat-info">
            <span className="stat-label">Пользователи</span>
            <span className="stat-value">{info.user_count || 0}</span>
          </div>
        </div>
        
        <div className="shard-stat">
          <HardDrive size={16} />
          <div className="stat-info">
            <span className="stat-label">Размер БД</span>
            <span className="stat-value">{info.db_size_mb || 0} MB</span>
          </div>
        </div>
        
        <div className="shard-stat">
          <MemoryStick size={16} />
          <div className="stat-info">
            <span className="stat-label">Использование</span>
            <span className="stat-value">{Math.round(usagePercent)}%</span>
          </div>
        </div>

        {info.connection_count !== undefined && (
          <div className="shard-stat">
            <Cpu size={16} />
            <div className="stat-info">
              <span className="stat-label">Подключения</span>
              <span className="stat-value">{info.connection_count}</span>
            </div>
          </div>
        )}
      </div>

      <div className="usage-section">
        <div className="usage-header">
          <span>Загрузка</span>
          <span>{Math.round(usagePercent)}%</span>
        </div>
        <div className="usage-bar">
          <div 
            className="usage-fill"
            style={{ 
              width: `${usagePercent}%`,
              backgroundColor: getUsageColor(usagePercent)
            }}
          ></div>
        </div>
      </div>

      <div className="shard-status">
        <span className={`status-indicator ${isHealthy ? 'active' : 'warning'}`}></span>
        <span>{isHealthy ? 'Активен' : 'Высокая нагрузка'}</span>
      </div>

      {/* Дополнительная информация о шарде */}
      {info.host && (
        <div className="shard-details">
          <div className="detail-item">
            <span className="detail-label">Хост:</span>
            <span className="detail-value">{info.host}</span>
          </div>
          {info.port && (
            <div className="detail-item">
              <span className="detail-label">Порт:</span>
              <span className="detail-value">{info.port}</span>
            </div>
          )}
          {info.database && (
            <div className="detail-item">
              <span className="detail-label">База данных:</span>
              <span className="detail-value">{info.database}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShardInfo