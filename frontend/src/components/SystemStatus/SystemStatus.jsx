import React, { useContext } from 'react'
import { AppContext } from '../../App'
import './SystemStatus.css'

const SystemStatus = () => {
  const { systemStatus, globalStats, lastUpdate, error, actions } = useContext(AppContext)

  const getStatusInfo = () => {
    switch (systemStatus) {
      case 'healthy':
        return { color: '#10b981', text: 'System Healthy', icon: '✅' }
      case 'unhealthy':
        return { color: '#ef4444', text: 'System Unhealthy', icon: '❌' }
      case 'checking':
        return { color: '#f59e0b', text: 'Checking Status', icon: '⏳' }
      default:
        return { color: '#6b7280', text: 'Unknown Status', icon: '❓' }
    }
  }

  const formatLastUpdate = (date) => {
    if (!date) return 'Never updated'
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="system-status-bar">
      <div className="status-left">
        <div 
          className="status-indicator"
          style={{ backgroundColor: statusInfo.color }}
        ></div>
        <span className="status-text">
          {statusInfo.icon} {statusInfo.text}
        </span>
        
        {globalStats && (
          <>
            <span className="status-divider">|</span>
            <div className="status-item">
              <span className="label">Shards:</span>
              <span className="value">{globalStats.shards?.total_shards || 0}</span>
            </div>
            <div className="status-item">
              <span className="label">Users:</span>
              <span className="value">{globalStats.users?.total_users || 0}</span>
            </div>
            <div className="status-item">
              <span className="label">Strategy:</span>
              <span className="value">{globalStats.shards?.current_strategy || 'Unknown'}</span>
            </div>
          </>
        )}
      </div>

      <div className="status-right">
        <div className="last-update">
          Updated: {formatLastUpdate(lastUpdate)}
        </div>
        
        {error && (
          <button 
            className="error-alert"
            onClick={() => actions.clearError()}
            title={`Error: ${error.message}`}
          >
            ⚠️ Error
          </button>
        )}
        
        <button 
          className="refresh-btn"
          onClick={actions.refreshData}
          title="Refresh data"
          disabled={systemStatus !== 'healthy'}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  )
}

export default SystemStatus