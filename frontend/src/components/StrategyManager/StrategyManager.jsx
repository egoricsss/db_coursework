import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import { useStrategies } from '../../hooks/useApi'
import './StrategyManager.css'

const StrategyManager = () => {
  const { globalStats } = useContext(AppContext)
  const [currentStrategy, setCurrentStrategy] = useState('')
  const [changeHistory, setChangeHistory] = useState([])
  
  // Используем кастомные хуки для работы со стратегиями
  const { 
    loading, 
    error, 
    setStrategy, 
    getCurrentStrategy, 
    clearError 
  } = useStrategies()

  useEffect(() => {
    loadCurrentStrategy()
    loadChangeHistory()
  }, [])

  const loadCurrentStrategy = async () => {
    try {
      const response = await getCurrentStrategy()
      setCurrentStrategy(response.current_strategy || response.name || 'hash')
    } catch (error) {
      console.error('Error loading strategy:', error)
    }
  }

  const loadChangeHistory = () => {
    // Mock history - in real app this would come from API
    const history = [
      { id: 1, from: 'hash', to: 'range', timestamp: new Date(Date.now() - 3600000), user: 'system' },
      { id: 2, from: 'range', to: 'list', timestamp: new Date(Date.now() - 7200000), user: 'admin' },
      { id: 3, from: 'list', to: 'hash', timestamp: new Date(Date.now() - 10800000), user: 'system' }
    ]
    setChangeHistory(history)
  }

  const changeStrategy = async (newStrategy) => {
    if (newStrategy === currentStrategy) return
    
    try {
      await setStrategy(newStrategy)
      setCurrentStrategy(newStrategy)
      
      // Add to change history
      setChangeHistory(prev => [{
        id: Date.now(),
        from: currentStrategy,
        to: newStrategy,
        timestamp: new Date(),
        user: 'admin'
      }, ...prev])
      
      clearError()
    } catch (error) {
      console.error('Error changing strategy:', error)
      // Ошибка уже обрабатывается в хуке
    }
  }

  const getStrategyInfo = (strategy) => {
    const strategies = {
      hash: {
        name: 'Hash Sharding',
        description: 'Uniform distribution based on hash function',
        bestFor: ['Uniform data distribution', 'Random access patterns', 'Any key type'],
        performance: 'Excellent for point queries',
        limitations: ['No range queries', 'Complex resharding']
      },
      range: {
        name: 'Range Sharding', 
        description: 'Distribution based on value ranges',
        bestFor: ['Numeric/date keys', 'Range queries', 'Sequential access'],
        performance: 'Excellent for range queries',
        limitations: ['Potential hot spots', 'Numeric keys only']
      },
      list: {
        name: 'List Sharding',
        description: 'Distribution based on categories or lists',
        bestFor: ['Categorical data', 'Geographic distribution', 'Logical grouping'],
        performance: 'Good for category-based queries',
        limitations: ['Uneven distribution', 'Fixed categories']
      },
      directory: {
        name: 'Directory Sharding',
        description: 'Uses lookup table for shard mapping',
        bestFor: ['Flexible shard mapping', 'Frequent rebalancing', 'Complex relationships'],
        performance: 'Good for flexible distribution',
        limitations: ['Lookup overhead', 'Single point of failure']
      }
    }
    return strategies[strategy] || {}
  }

  return (
    <div className="strategy-manager">
      <header className="page-header">
        <h1>Sharding Strategy Manager</h1>
        <p>Configure and manage data distribution strategies across PostgreSQL shards</p>
      </header>

      {/* Отображение ошибок из хука */}
      {error && (
        <div className="error-message">
          <span>Error: {error.message}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Current Strategy */}
      <div className="current-strategy-section">
        <h2>Current Strategy</h2>
        <div className="current-strategy-card">
          <div className="strategy-badge">
            <span className="strategy-name">{currentStrategy.toUpperCase()}</span>
            <span className="status active">Active</span>
          </div>
          <div className="strategy-details">
            <h3>{getStrategyInfo(currentStrategy).name}</h3>
            <p>{getStrategyInfo(currentStrategy).description}</p>
          </div>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="strategy-selection">
        <h2>Available Strategies</h2>
        <div className="strategies-grid">
          {['hash', 'range', 'list', 'directory'].map((strategy) => (
            <div 
              key={strategy} 
              className={`strategy-card ${currentStrategy === strategy ? 'active' : ''}`}
            >
              <div className="strategy-header">
                <h3>{getStrategyInfo(strategy).name}</h3>
                {currentStrategy === strategy && (
                  <span className="active-indicator">Active</span>
                )}
              </div>
              
              <p className="strategy-description">
                {getStrategyInfo(strategy).description}
              </p>

              <div className="strategy-features">
                <div className="feature-list">
                  <strong>Best for:</strong>
                  <ul>
                    {getStrategyInfo(strategy).bestFor.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="performance">
                  <strong>Performance:</strong>
                  <span>{getStrategyInfo(strategy).performance}</span>
                </div>
                <div className="limitations">
                  <strong>Limitations:</strong>
                  <ul>
                    {getStrategyInfo(strategy).limitations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => changeStrategy(strategy)}
                disabled={currentStrategy === strategy || loading}
                className={`select-btn ${currentStrategy === strategy ? 'active' : ''}`}
              >
                {currentStrategy === strategy ? 'Currently Active' : 
                 loading ? 'Changing...' : 'Select Strategy'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      {globalStats && (
        <div className="performance-metrics">
          <h2>Performance Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>Response Time</h4>
              <div className="metric-value">
                {globalStats.metrics?.average_response_time?.[currentStrategy] || 'N/A'}
              </div>
            </div>
            <div className="metric-card">
              <h4>Success Rate</h4>
              <div className="metric-value">
                {globalStats.metrics?.success_rate?.[currentStrategy] || 'N/A'}
              </div>
            </div>
            <div className="metric-card">
              <h4>Operations</h4>
              <div className="metric-value">
                {globalStats.metrics?.operations?.[currentStrategy]?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change History */}
      <div className="change-history">
        <h2>Change History</h2>
        <div className="history-list">
          {changeHistory.map((change) => (
            <div key={change.id} className="history-item">
              <div className="change-info">
                <span className="from-strategy">{change.from}</span>
                <span className="arrow">→</span>
                <span className="to-strategy">{change.to}</span>
              </div>
              <div className="change-meta">
                <span className="timestamp">
                  {change.timestamp.toLocaleString()}
                </span>
                <span className="user">by {change.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="strategy-comparison">
        <h2>Strategy Comparison</h2>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Data Distribution</th>
                <th>Query Performance</th>
                <th>Scalability</th>
                <th>Complexity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hash</td>
                <td>Uniform</td>
                <td>Excellent point queries</td>
                <td>Good</td>
                <td>Low</td>
              </tr>
              <tr>
                <td>Range</td>
                <td>Sequential</td>
                <td>Excellent range queries</td>
                <td>Medium</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>List</td>
                <td>Categorical</td>
                <td>Good for categories</td>
                <td>Medium</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>Directory</td>
                <td>Flexible</td>
                <td>Good with caching</td>
                <td>High</td>
                <td>High</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StrategyManager