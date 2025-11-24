import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import './styles/global.css'

// Components
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import ShardInfo from './components/ShardInfo/ShardInfo'
import UserManagement from './components/UserManagement/UserManagement'
import StrategyManager from './components/StrategyManager/StrategyManager'
import Monitoring from './components/Monitoring/Monitoring'
import SystemStatus from './components/SystemStatus/SystemStatus'

// Context for global state
export const AppContext = React.createContext()

function App() {
  const [systemStatus, setSystemStatus] = useState('checking')
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // API configuration with useMemo to prevent recreating on every render
  const axiosInstance = useMemo(() => axios.create({
    baseURL: '',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  }), [])

  // API methods with useMemo
  const api = useMemo(() => ({
    // Health
    healthCheck: () => axiosInstance.get('/api/v1/health'),

    // Users
    createUser: (userData) => axiosInstance.post('/api/v1/users/', userData),
    getUser: (userId) => axiosInstance.get(`/api/v1/users/${userId}`),
    getUsersByShardKey: (shardKey) => axiosInstance.get(`/api/v1/users/by-key/${shardKey}`),

    // Shards
    getShardsInfo: () => axiosInstance.get('/api/v1/shards/info'),
    getUserStats: () => axiosInstance.get('/api/v1/stats/users'),

    // Strategies
    setStrategy: (strategyName) => axiosInstance.put(`/api/v1/strategy/${strategyName}`),
    getCurrentStrategy: () => axiosInstance.get('/api/v1/strategy/current'),

    // Monitoring
    getMetrics: () => axiosInstance.get('/api/v1/monitoring/metrics')
  }), [axiosInstance])

  // Health check with retry logic
  const checkHealth = useCallback(async (retries = 3) => {
    try {
      const response = await api.healthCheck()
      if (response.data.status === 'healthy') {
        setSystemStatus('healthy')
        setError(null)
        return true
      }
      throw new Error('Backend not healthy')
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying health check... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return checkHealth(retries - 1)
      }
      setSystemStatus('unhealthy')
      return false
    }
  }, [api])

  // Load global statistics - only shards and basic info
  const loadGlobalStats = useCallback(async () => {
    if (systemStatus !== 'healthy') return
    
    setLoading(true)
    try {
      const [shardsData, userStats] = await Promise.all([
        api.getShardsInfo(),
        api.getUserStats()
      ])

      setGlobalStats({
        shards: shardsData.data,
        users: userStats.data,
        lastUpdated: new Date()
      })
      setLastUpdate(new Date())
      setError(null)
    } catch (error) {
      console.error('Failed to load global stats:', error)
      setError({
        message: 'Failed to load system data',
        details: error.message
      })
    } finally {
      setLoading(false)
    }
  }, [systemStatus, api])

  // Initialize application - runs only once
  useEffect(() => {
    let intervalId

    const initializeApp = async () => {
      const isHealthy = await checkHealth()
      if (isHealthy) {
        await loadGlobalStats()
        // Set up periodic refresh every 30 seconds
        intervalId = setInterval(loadGlobalStats, 30000)
      }
    }

    initializeApp()

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [checkHealth, loadGlobalStats]) // Dependencies are stable due to useCallback

  // Global actions
  const actions = {
    refreshData: loadGlobalStats,
    retryConnection: () => {
      setSystemStatus('checking')
      checkHealth().then(isHealthy => {
        if (isHealthy) loadGlobalStats()
      })
    },
    clearError: () => setError(null)
  }

  // Context value
  const contextValue = useMemo(() => ({
    systemStatus,
    globalStats,
    loading,
    error,
    lastUpdate,
    api,
    actions
  }), [systemStatus, globalStats, loading, error, lastUpdate, api, actions])

  // Render loading state
  if (systemStatus === 'checking') {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-spinner-large"></div>
          <h1>Sharding Manager</h1>
          <p>Initializing system connection...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (systemStatus === 'unhealthy') {
    return (
      <div className="app-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h1>System Unavailable</h1>
          <p>Unable to connect to the backend service.</p>
          <div className="error-details">
            <p>Please ensure that:</p>
            <ul>
              <li>Backend service is running on port 8000</li>
              <li>Database containers are healthy</li>
              <li>Network connectivity is available</li>
            </ul>
          </div>
          <button 
            className="retry-button"
            onClick={actions.retryConnection}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="app">
          <SystemStatus />
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shards" element={<ShardInfo />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/strategies" element={<StrategyManager />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AppContext.Provider>
  )
}

export default App