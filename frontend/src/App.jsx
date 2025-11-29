import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useHealth, useAppData } from './hooks/useApi'
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
  
  const { healthCheck, error: healthError } = useHealth()
  const { globalStats, lastUpdate, loading, error, loadGlobalStats, clearError } = useAppData()

  // Health check with retry logic
  const checkSystemHealth = useCallback(async () => {
    try {
      const result = await healthCheck(3)
      if (result.status === 'healthy') {
        setSystemStatus('healthy')
        clearError()
        return true
      }
      throw new Error('Backend not healthy')
    } catch (error) {
      setSystemStatus('unhealthy')
      return false
    }
  }, [healthCheck, clearError])

  // Load global statistics
  const refreshGlobalStats = useCallback(async () => {
    if (systemStatus !== 'healthy') return
    await loadGlobalStats()
  }, [systemStatus, loadGlobalStats])

  // Initialize application
  useEffect(() => {
    let intervalId

    const initializeApp = async () => {
      const isHealthy = await checkSystemHealth()
      if (isHealthy) {
        await refreshGlobalStats()
        // Set up periodic refresh every 30 seconds
        intervalId = setInterval(refreshGlobalStats, 30000)
      }
    }

    initializeApp()

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [checkSystemHealth, refreshGlobalStats])

  // Global actions
  const actions = useMemo(() => ({
    refreshData: refreshGlobalStats,
    retryConnection: async () => {
      setSystemStatus('checking')
      const isHealthy = await checkSystemHealth()
      if (isHealthy) await refreshGlobalStats()
    },
    clearError: () => {
      clearError()
      if (healthError) clearError()
    }
  }), [refreshGlobalStats, checkSystemHealth, clearError, healthError])

  // Context value
  const contextValue = useMemo(() => ({
    systemStatus,
    globalStats,
    loading,
    error: error || healthError,
    lastUpdate,
    actions
  }), [systemStatus, globalStats, loading, error, healthError, lastUpdate, actions])

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