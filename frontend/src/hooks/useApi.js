// src/hooks/useApi.js
import { useState, useCallback, useRef } from 'react'
import { apiService } from '../api'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const executeRequest = useCallback(async (apiCall, ...args) => {
    // Отменяем предыдущий запрос если он есть
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall(...args)
      return result
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Более детальная обработка ошибок
        let errorMessage = 'Unknown error occurred'
        
        if (err.message?.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.'
        } else if (err.message?.includes('timeout')) {
          errorMessage = 'Request timeout. Server is taking too long to respond.'
        } else if (err.status === 404) {
          errorMessage = 'Endpoint not found. Please check the API URL.'
        } else if (err.data?.detail) {
          errorMessage = err.data.detail
        } else if (err.message) {
          errorMessage = err.message
        }
        
        setError({
          message: errorMessage,
          details: err,
          timestamp: new Date()
        })
      }
      throw err
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    loading,
    error,
    executeRequest,
    clearError
  }
}

// Хук для работы с пользователями
export const useUsers = () => {
  const { loading, error, executeRequest, clearError } = useApi()

  const createUser = useCallback(async (userData) => {
    return executeRequest(apiService.createUser, userData)
  }, [executeRequest])

  const getUser = useCallback(async (userId) => {
    return executeRequest(apiService.getUser, userId)
  }, [executeRequest])

  const getUsersByShardKey = useCallback(async (shardKey) => {
    return executeRequest(apiService.getUsersByShardKey, shardKey)
  }, [executeRequest])

  return {
    loading,
    error,
    createUser,
    getUser,
    getUsersByShardKey,
    clearError
  }
}

// Хук для работы с шардами
export const useShards = () => {
  const { loading, error, executeRequest, clearError } = useApi()

  const getShardsInfo = useCallback(async () => {
    return executeRequest(apiService.getShardsInfo)
  }, [executeRequest])

  const getUserStats = useCallback(async () => {
    return executeRequest(apiService.getUserStats)
  }, [executeRequest])

  return {
    loading,
    error,
    getShardsInfo,
    getUserStats,
    clearError
  }
}

// Хук для работы со стратегиями
export const useStrategies = () => {
  const { loading, error, executeRequest, clearError } = useApi()

  const setStrategy = useCallback(async (strategyName) => {
    return executeRequest(apiService.setStrategy, strategyName)
  }, [executeRequest])

  const getCurrentStrategy = useCallback(async () => {
    return executeRequest(apiService.getCurrentStrategy)
  }, [executeRequest])

  return {
    loading,
    error,
    setStrategy,
    getCurrentStrategy,
    clearError
  }
}

// Хук для мониторинга
export const useMonitoring = () => {
  const { loading, error, executeRequest, clearError } = useApi()

  const getMetrics = useCallback(async () => {
    return executeRequest(apiService.getMetrics)
  }, [executeRequest])

  return {
    loading,
    error,
    getMetrics,
    clearError
  }
}

// Хук для проверки здоровья системы
export const useHealth = () => {
  const { loading, error, executeRequest, clearError } = useApi()

  const healthCheck = useCallback(async (retries = 3) => {
    const check = async (attempts) => {
      try {
        const result = await executeRequest(apiService.healthCheck)
        return result
      } catch (err) {
        if (attempts > 0) {
          console.log(`Retrying health check... (${attempts} attempts left)`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          return check(attempts - 1)
        }
        throw err
      }
    }

    return check(retries)
  }, [executeRequest])

  return {
    loading,
    error,
    healthCheck,
    clearError
  }
}

// Хук для глобальных данных приложения
export const useAppData = () => {
  const [globalStats, setGlobalStats] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  
  const { loading, error, executeRequest, clearError } = useApi()
  const { getShardsInfo, getUserStats } = useShards()

  const loadGlobalStats = useCallback(async () => {
    try {
      const [shardsData, userStats] = await Promise.all([
        executeRequest(getShardsInfo),
        executeRequest(getUserStats)
      ])

      setGlobalStats({
        shards: shardsData,
        users: userStats,
        lastUpdated: new Date()
      })
      setLastUpdate(new Date())
      return { shards: shardsData, users: userStats }
    } catch (err) {
      throw err
    }
  }, [executeRequest, getShardsInfo, getUserStats])

  return {
    globalStats,
    lastUpdate,
    loading,
    error,
    loadGlobalStats,
    clearError
  }
}