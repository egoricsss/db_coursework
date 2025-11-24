import axios from 'axios'

// Автоматическое определение базового URL
const getBaseURL = () => {
  if (import.meta.env.MODE === 'development') {
    return '/api/v1'  // Используем прокси в development
  }
  return 'http://localhost:8000/api/v1'  // Прямое подключение в production
}

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Добавляем interceptor для логирования
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  async healthCheck() {
    const response = await this.client.get('/health')
    return response.data
  }

  // Пользователи
  async createUser(userData) {
    const response = await this.client.post('/users/', userData)
    return response.data
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`)
    return response.data
  }

  async getUsersByShardKey(shardKey) {
    const response = await this.client.get(`/users/by-key/${shardKey}`)
    return response.data
  }

  // Шарды
  async getShardsInfo() {
    const response = await this.client.get('/shards/info')
    return response.data
  }

  async getUserStats() {
    const response = await this.client.get('/stats/users')
    return response.data
  }

  // Стратегии
  async setStrategy(strategyName) {
    const response = await this.client.put(`/strategy/${strategyName}`)
    return response.data
  }

  async getCurrentStrategy() {
    const response = await this.client.get('/strategy/current')
    return response.data
  }

  // Мониторинг
  async getMetrics() {
    const response = await this.client.get('/monitoring/metrics')
    return response.data
  }
}

export const apiService = new ApiService()