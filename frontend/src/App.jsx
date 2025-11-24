import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './styles/global.css'

function App() {
  const [status, setStatus] = useState('loading')
  const [shards, setShards] = useState(null)
  const [strategy, setStrategy] = useState('')

  useEffect(() => {
    checkBackend()
  }, [])

  const checkBackend = async () => {
    try {
      const response = await axios.get('/api/v1/health')
      setStatus('connected')
      
      // Загружаем информацию о шардах
      const shardsResponse = await axios.get('/api/v1/shards/info')
      setShards(shardsResponse.data.shards)
      setStrategy(shardsResponse.data.current_strategy)
    } catch (error) {
      setStatus('error')
      console.error('Backend connection failed:', error)
    }
  }

  const changeStrategy = async (newStrategy) => {
    try {
      await axios.put(`/api/v1/strategy/${newStrategy}`)
      setStrategy(newStrategy)
      alert(`Strategy changed to ${newStrategy}`)
    } catch (error) {
      console.error('Failed to change strategy:', error)
      alert('Error changing strategy')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PostgreSQL Sharding Manager</h1>
        <div className="status">
          <strong>Backend Status:</strong> 
          <span className={`status-indicator ${status}`}>
            {status === 'connected' ? '✅ Connected' : 
             status === 'error' ? '❌ Error' : '⏳ Loading...'}
          </span>
        </div>
      </header>

      {strategy && (
        <div className="strategy-section">
          <h2>Current Sharding Strategy: <code>{strategy}</code></h2>
          <div className="strategy-buttons">
            <button onClick={() => changeStrategy('hash')}>Hash Strategy</button>
            <button onClick={() => changeStrategy('range')}>Range Strategy</button>
            <button onClick={() => changeStrategy('list')}>List Strategy</button>
          </div>
        </div>
      )}

      {shards && (
        <div className="shards-section">
          <h2>Database Shards</h2>
          <div className="shards-grid">
            {Object.entries(shards).map(([shardName, shardInfo]) => (
              <div key={shardName} className="shard-card">
                <h3>{shardName.toUpperCase()}</h3>
                <div className="shard-info">
                  <p><strong>Users:</strong> {shardInfo.user_count}</p>
                  <p><strong>Size:</strong> {shardInfo.db_size_mb} MB</p>
                </div>
                <div className="usage-bar">
                  <div 
                    className="usage-fill"
                    style={{ 
                      width: `${Math.min((shardInfo.user_count / 100) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="error-section">
          <h3>Connection Error</h3>
          <p>Make sure the backend service is running on port 8000</p>
          <button onClick={checkBackend}>Retry Connection</button>
        </div>
      )}
    </div>
  )
}

export default App