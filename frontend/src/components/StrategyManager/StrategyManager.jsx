import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import './StrategyManager.css'

const StrategyManager = () => {
  const { api, globalStats } = useContext(AppContext)
  const [currentStrategy, setCurrentStrategy] = useState('')
  const [loading, setLoading] = useState(false)
  const [changeHistory, setChangeHistory] = useState([])

  useEffect(() => {
    loadCurrentStrategy()
    loadChangeHistory()
  }, [])

  const loadCurrentStrategy = async () => {
    try {
      const response = await api.getCurrentStrategy()
      setCurrentStrategy(response.current_strategy)
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
    
    setLoading(true)
    try {
      await api.setStrategy(newStrategy)
      setCurrentStrategy(newStrategy)
      
      // Add to change history
      setChangeHistory(prev => [{
        id: Date.now(),
        from: currentStrategy,
        to: newStrategy,
        timestamp: new Date(),
        user: 'admin'
      }, ...prev])
      
    } catch (error) {
      console.error('Error changing strategy:', error)
      alert('Failed to change strategy')
    } finally {
      setLoading(false)
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
          {['hash', 'range', 'list'].map((strategy) => (
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
    </div>
  )
}

export default StrategyManager