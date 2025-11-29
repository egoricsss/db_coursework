import axios from 'axios'

// Автоматическое определение базового URL
const getBaseURL = () => {
  // Если указана кастомная переменная окружения
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // В development режиме используем localhost с правильным путем
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:8000'
  }
  
  // В production используем относительный путь
  return ''
}

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Interceptor для логирования запросов
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // Interceptor для обработки ответов
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response.data
      },
      (error) => {
        const errorData = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        }
        console.error('API Response error:', errorData)
        return Promise.reject(errorData)
      }
    )
  }

  // Health
  async healthCheck() {
    return this.client.get('/api/v1/health')
  }

  // Пользователи
  async createUser(userData) {
    return this.client.post('/api/v1/users/', userData)
  }

  async getUser(userId) {
    return this.client.get(`/api/v1/users/${userId}`)
  }

  async getUsersByShardKey(shardKey) {
    return this.client.get(`/api/v1/users/by-key/${shardKey}`)
  }

  // Шарды
  async getShardsInfo() {
    return this.client.get('/api/v1/shards/info')
  }

  async getUserStats() {
    return this.client.get('/api/v1/stats/users')
  }

  // Стратегии
  async setStrategy(strategyName) {
    return this.client.put(`/api/v1/strategy/${strategyName}`)
  }

  async getCurrentStrategy() {
    return this.client.get('/api/v1/strategy/current')
  }

  // Мониторинг
  async getMetrics() {
    return this.client.get('/api/v1/monitoring/metrics')
  }
}

export const apiService = new ApiService()