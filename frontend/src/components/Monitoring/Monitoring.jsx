import React, { useState, useEffect } from 'react'
import { RefreshCw, Clock, Database, Zap, Users, BarChart3 } from 'lucide-react'
import { useMonitoring, useShards } from '../../hooks/useApi'
import './Monitoring.css'

const Monitoring = () => {
  const [metrics, setMetrics] = useState(null)
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(15000)

  // Используем кастомные хуки
  const { 
    loading, 
    error, 
    getMetrics, 
    clearError 
  } = useMonitoring()

  const { getShardsInfo } = useShards()

  const loadMetricsData = async () => {
    try {
      const metricsData = await getMetrics()
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }

  useEffect(() => {
    loadMetricsData()

    let intervalId
    if (autoRefresh) {
      intervalId = setInterval(loadMetricsData, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh, refreshInterval])

  const handleRefresh = () => {
    loadMetricsData()
  }

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange)
    // В реальном приложении здесь бы менялся параметр запроса к API
  }

  const handleIntervalChange = (interval) => {
    setRefreshInterval(interval)
  }

  if (loading && !metrics) {
    return (
      <div className="monitoring">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>Загрузка метрик...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="monitoring">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Мониторинг производительности</h1>
            <p>Real-time performance metrics and sharding statistics</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-btn"
            >
              <RefreshCw size={16} />
              {loading ? 'Обновление...' : 'Обновить'}
            </button>
          </div>
        </div>
      </header>

      {/* Отображение ошибок */}
      {error && (
        <div className="error-message">
          <span>Ошибка загрузки метрик: {error.message}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="monitoring-controls">
        <div className="control-group">
          <div className="time-range-selector">
            <Clock size={16} />
            <label>Временной диапазон:</label>
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
            >
              <option value="15m">Последние 15 минут</option>
              <option value="1h">Последний час</option>
              <option value="6h">Последние 6 часов</option>
              <option value="24h">Последние 24 часа</option>
            </select>
          </div>

          <div className="auto-refresh-control">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Автообновление
            </label>
            <select 
              value={refreshInterval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={!autoRefresh}
            >
              <option value={5000}>5 секунд</option>
              <option value={15000}>15 секунд</option>
              <option value={30000}>30 секунд</option>
              <option value={60000}>1 минута</option>
            </select>
          </div>
        </div>
      </div>

      <div className="metrics-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <div className="overview-icon">
              <Database size={20} />
            </div>
            <div className="overview-info">
              <span className="overview-value">
                {metrics?.shard_statistics ? Object.keys(metrics.shard_statistics).length : 0}
              </span>
              <span className="overview-label">Всего шардов</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <Users size={20} />
            </div>
            <div className="overview-info">
              <span className="overview-value">
                {metrics?.shard_statistics ? 
                  Object.values(metrics.shard_statistics).reduce((sum, stats) => sum + (stats.user_count || 0), 0) : 0
                }
              </span>
              <span className="overview-label">Всего пользователей</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <Zap size={20} />
            </div>
            <div className="overview-info">
              <span className="overview-value">
                {metrics?.current_strategy || 'Unknown'}
              </span>
              <span className="overview-label">Текущая стратегия</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <BarChart3 size={20} />
            </div>
            <div className="overview-info">
              <span className="overview-value">
                {metrics?.performance_metrics ? 
                  Object.values(metrics.performance_metrics).reduce((sum, data) => sum + (data.total_operations || 0), 0) : 0
                }
              </span>
              <span className="overview-label">Всего операций</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Shard Statistics */}
        <div className="metric-card large">
          <div className="metric-header">
            <h3>Статистика шардов</h3>
            <span className="metric-update">
              Обновлено: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="shards-metrics">
            {metrics?.shard_statistics && Object.entries(metrics.shard_statistics).map(([shard, stats]) => (
              <ShardMetricItem 
                key={shard}
                shard={shard}
                stats={stats}
              />
            ))}
            
            {(!metrics?.shard_statistics || Object.keys(metrics.shard_statistics).length === 0) && (
              <div className="no-data">
                <Database size={32} />
                <p>Нет данных о шардах</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="metric-card">
          <div className="metric-header">
            <h3>Производительность по стратегиям</h3>
          </div>
          <div className="performance-metrics">
            {metrics?.performance_metrics && Object.entries(metrics.performance_metrics).map(([strategy, data]) => (
              <StrategyMetric 
                key={strategy}
                strategy={strategy}
                data={data}
              />
            ))}
            
            {(!metrics?.performance_metrics || Object.keys(metrics.performance_metrics).length === 0) && (
              <div className="no-data">
                <BarChart3 size={24} />
                <p>Нет данных о производительности</p>
              </div>
            )}
          </div>
        </div>

        {/* System Metrics */}
        <div className="metric-card">
          <div className="metric-header">
            <h3>Обзор системы</h3>
          </div>
          <div className="system-metrics">
            <SystemMetric 
              label="Текущая стратегия"
              value={metrics?.current_strategy || 'Неизвестно'}
            />
            <SystemMetric 
              label="Всего шардов"
              value={metrics?.shard_statistics ? Object.keys(metrics.shard_statistics).length : 0}
            />
            <SystemMetric 
              label="Всего пользователей"
              value={metrics?.shard_statistics ? 
                Object.values(metrics.shard_statistics).reduce((sum, stats) => sum + (stats.user_count || 0), 0) : 0
              }
            />
            <SystemMetric 
              label="Среднее время ответа"
              value={metrics?.performance_metrics ? 
                `${getAverageResponseTime(metrics.performance_metrics)} мс` : 'N/A'
              }
            />
            <SystemMetric 
              label="Статус системы"
              value="Стабильный"
              status="healthy"
            />
          </div>
        </div>

        {/* Response Time Trends */}
        {metrics?.response_times && (
          <div className="metric-card large">
            <div className="metric-header">
              <h3>График времени ответа</h3>
            </div>
            <div className="response-time-chart">
              <div className="chart-placeholder">
                <BarChart3 size={48} />
                <p>График времен ответа</p>
                <span>Здесь будет отображаться график времени ответа по стратегиям</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Компонент для отображения метрики шарда
const ShardMetricItem = ({ shard, stats }) => {
  const usagePercent = Math.min(((stats.user_count || 0) / 1000) * 100, 100)

  return (
    <div className="shard-metric-item">
      <div className="shard-header">
        <span className="shard-name">{shard}</span>
        <span className={`shard-status ${usagePercent < 90 ? 'active' : 'warning'}`}>
          {usagePercent < 90 ? 'Активен' : 'Высокая нагрузка'}
        </span>
      </div>
      <div className="shard-stats">
        <div className="stat">
          <span className="label">Пользователи:</span>
          <span className="value">{stats.user_count || 0}</span>
        </div>
        <div className="stat">
          <span className="label">Размер:</span>
          <span className="value">{stats.db_size_mb || 0} MB</span>
        </div>
        <div className="stat">
          <span className="label">Использование:</span>
          <span className="value">{Math.round(usagePercent)}%</span>
        </div>
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
  )
}

// Компонент для отображения метрики стратегии
const StrategyMetric = ({ strategy, data }) => {
  return (
    <div className="strategy-metric">
      <div className="strategy-header">
        <span className="strategy-name">{strategy.toUpperCase()}</span>
        <span className={`status ${getPerformanceStatus(data.average_time_ms)}`}>
          {getPerformanceStatus(data.average_time_ms)}
        </span>
      </div>
      <div className="strategy-stats">
        <div className="stat">
          <span className="label">Операции:</span>
          <span className="value">{data.total_operations || 0}</span>
        </div>
        <div className="stat">
          <span className="label">Среднее время:</span>
          <span className="value">{data.average_time_ms || 0} мс</span>
        </div>
        <div className="stat">
          <span className="label">Успешные:</span>
          <span className="value">
            {data.success_rate ? `${(data.success_rate * 100).toFixed(1)}%` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Компонент для отображения системной метрики
const SystemMetric = ({ label, value, status }) => {
  return (
    <div className="system-metric">
      <span className="label">{label}:</span>
      <span className={`value ${status || ''}`}>{value}</span>
    </div>
  )
}

// Вспомогательные функции
const getUsageColor = (usage) => {
  if (usage < 70) return '#10b981'
  if (usage < 90) return '#f59e0b'
  return '#ef4444'
}

const getPerformanceStatus = (avgTime) => {
  if (!avgTime) return 'unknown'
  if (avgTime < 50) return 'excellent'
  if (avgTime < 100) return 'good'
  if (avgTime < 200) return 'fair'
  return 'poor'
}

const getAverageResponseTime = (performanceMetrics) => {
  if (!performanceMetrics) return 0
  const strategies = Object.values(performanceMetrics)
  const totalTime = strategies.reduce((sum, data) => sum + (data.average_time_ms || 0), 0)
  return strategies.length > 0 ? Math.round(totalTime / strategies.length) : 0
}

export default Monitoring