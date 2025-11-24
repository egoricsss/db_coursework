import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import './Monitoring.css'

const Monitoring = () => {
  const { api } = useContext(AppContext)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('1h')

  // Load metrics only when component mounts or timeRange changes
  useEffect(() => {
    let isMounted = true
    let intervalId

    const loadMetrics = async () => {
      if (!isMounted) return
      
      try {
        const response = await api.getMetrics()
        if (isMounted) {
          setMetrics(response.data)
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading metrics:', error)
          setLoading(false)
        }
      }
    }

    // Initial load
    loadMetrics()

    // Set up interval only if component is still mounted
    if (isMounted) {
      intervalId = setInterval(loadMetrics, 15000) // 15 seconds
    }

    // Cleanup function
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [api, timeRange]) // Only depend on api and timeRange

  if (loading) {
    return (
      <div className="monitoring">
        <div className="loading">Загрузка метрик...</div>
      </div>
    )
  }

  return (
    <div className="monitoring">
      <header className="page-header">
        <h1>Мониторинг производительности</h1>
        <p>Real-time performance metrics and sharding statistics</p>
      </header>

      <div className="monitoring-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Shard Statistics */}
        <div className="metric-card large">
          <h3>Shard Statistics</h3>
          <div className="shards-metrics">
            {metrics?.shard_statistics && Object.entries(metrics.shard_statistics).map(([shard, stats]) => (
              <div key={shard} className="shard-metric-item">
                <div className="shard-header">
                  <span className="shard-name">{shard}</span>
                  <span className="shard-status active">Active</span>
                </div>
                <div className="shard-stats">
                  <div className="stat">
                    <span className="label">Users:</span>
                    <span className="value">{stats.user_count}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Size:</span>
                    <span className="value">{stats.db_size_mb} MB</span>
                  </div>
                  <div className="stat">
                    <span className="label">Usage:</span>
                    <span className="value">
                      {Math.round((stats.user_count / 1000) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${Math.min((stats.user_count / 1000) * 100, 100)}%`,
                      backgroundColor: getUsageColor((stats.user_count / 1000) * 100)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="metric-card">
          <h3>Performance by Strategy</h3>
          <div className="performance-metrics">
            {metrics?.performance_metrics && Object.entries(metrics.performance_metrics).map(([strategy, data]) => (
              <div key={strategy} className="strategy-metric">
                <div className="strategy-header">
                  <span className="strategy-name">{strategy.toUpperCase()}</span>
                  <span className={`status ${getPerformanceStatus(data.average_time_ms)}`}>
                    {getPerformanceStatus(data.average_time_ms).toUpperCase()}
                  </span>
                </div>
                <div className="strategy-stats">
                  <div className="stat">
                    <span className="label">Operations:</span>
                    <span className="value">{data.total_operations}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Avg Time:</span>
                    <span className="value">{data.average_time_ms} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="metric-card">
          <h3>System Overview</h3>
          <div className="system-metrics">
            <div className="system-metric">
              <span className="label">Current Strategy:</span>
              <span className="value">{metrics?.current_strategy || 'Unknown'}</span>
            </div>
            <div className="system-metric">
              <span className="label">Total Shards:</span>
              <span className="value">{metrics?.shard_statistics ? Object.keys(metrics.shard_statistics).length : 0}</span>
            </div>
            <div className="system-metric">
              <span className="label">Total Users:</span>
              <span className="value">
                {metrics?.shard_statistics ? 
                  Object.values(metrics.shard_statistics).reduce((sum, stats) => sum + stats.user_count, 0) : 0
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
const getUsageColor = (usage) => {
  if (usage < 70) return '#10b981'
  if (usage < 90) return '#f59e0b'
  return '#ef4444'
}

const getPerformanceStatus = (avgTime) => {
  if (avgTime < 50) return 'excellent'
  if (avgTime < 100) return 'good'
  if (avgTime < 200) return 'fair'
  return 'poor'
}

export default Monitoring