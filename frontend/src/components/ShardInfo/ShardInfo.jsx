import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { Database, HardDrive, Cpu, MemoryStick } from 'lucide-react'
import './ShardInfo.css'

const ShardInfo = () => {
  const [shardsData, setShardsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShardsInfo()
  }, [])

  const loadShardsInfo = async () => {
    try {
      const data = await apiService.getShardsInfo()
      setShardsData(data)
    } catch (error) {
      console.error('Error loading shards info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка информации о шардах...</div>
  }

  return (
    <div className="shard-info">
      <header className="page-header">
        <h1>Информация о шардах</h1>
        <p>Детальная информация о каждом шарде в кластере</p>
      </header>

      <div className="shards-grid">
        {shardsData?.shards && Object.entries(shardsData.shards).map(([shardName, shardInfo]) => (
          <ShardCard 
            key={shardName}
            name={shardName}
            info={shardInfo}
          />
        ))}
      </div>

      <div className="cluster-info">
        <h3>Информация о кластере</h3>
        <div className="cluster-stats">
          <div className="cluster-stat">
            <Database size={20} />
            <span>Всего шардов: {shardsData?.total_shards}</span>
          </div>
          <div className="cluster-stat">
            <Cpu size={20} />
            <span>Текущая стратегия: {shardsData?.current_strategy}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShardCard = ({ name, info }) => {
  const getUsageColor = (usage) => {
    if (usage < 70) return '#10b981'
    if (usage < 90) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="shard-card">
      <div className="shard-header">
        <Database size={24} />
        <h3>{name.toUpperCase()}</h3>
      </div>
      
      <div className="shard-stats">
        <div className="shard-stat">
          <Users size={16} />
          <span>Пользователи: {info.user_count}</span>
        </div>
        
        <div className="shard-stat">
          <HardDrive size={16} />
          <span>Размер БД: {info.db_size_mb} MB</span>
        </div>
        
        <div className="shard-stat">
          <MemoryStick size={16} />
          <span>Использование: {Math.round((info.user_count / 1000) * 100)}%</span>
        </div>
      </div>

      <div className="usage-bar">
        <div 
          className="usage-fill"
          style={{ 
            width: `${Math.min((info.user_count / 1000) * 100, 100)}%`,
            backgroundColor: getUsageColor((info.user_count / 1000) * 100)
          }}
        ></div>
      </div>

      <div className="shard-status">
        <span className="status-indicator active"></span>
        <span>Активен</span>
      </div>
    </div>
  )
}

export default ShardInfo