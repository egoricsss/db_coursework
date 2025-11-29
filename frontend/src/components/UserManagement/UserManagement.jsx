import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Mail, Key } from 'lucide-react'
import { useUsers } from '../../hooks/useApi'
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [searchKey, setSearchKey] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    shard_key: ''
  })

  const { 
    loading, 
    error, 
    createUser, 
    getUsersByShardKey, 
    clearError 
  } = useUsers()

  // Загрузка пользователей при изменении searchKey
  useEffect(() => {
    if (searchKey) {
      loadUsersByKey(searchKey)
    } else {
      setUsers([]) // Очищаем список если поисковый ключ пустой
    }
  }, [searchKey])

  const loadUsersByKey = async (shardKey) => {
    try {
      const data = await getUsersByShardKey(shardKey)
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await createUser(newUser)
      setShowCreateForm(false)
      setNewUser({ username: '', email: '', full_name: '', shard_key: '' })
      
      // Обновляем список если есть активный поиск
      if (searchKey) {
        await loadUsersByKey(searchKey)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      // Ошибка уже обрабатывается в хуке, можно показать дополнительное уведомление
    }
  }

  const handleInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="user-management">
      <header className="page-header">
        <h1>Управление пользователями</h1>
        <p>Создание и поиск пользователей в системе шардирования</p>
      </header>

      {/* Отображение ошибок из хука */}
      {error && (
        <div className="error-message">
          <span>Ошибка: {error.message}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="user-actions">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Введите ключ шардирования для поиска..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button 
          className="create-user-btn"
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
        >
          <Plus size={20} />
          {loading ? 'Загрузка...' : 'Создать пользователя'}
        </button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Создание нового пользователя</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <User size={16} />
                <input
                  type="text"
                  placeholder="Имя пользователя"
                  value={newUser.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Полное имя (опционально)"
                  value={newUser.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <Key size={16} />
                <input
                  type="text"
                  placeholder="Ключ шардирования"
                  value={newUser.shard_key}
                  onChange={(e) => handleInputChange('shard_key', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-list">
        {loading ? (
          <div className="loading">Поиск пользователей...</div>
        ) : users.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя пользователя</th>
                <th>Email</th>
                <th>Полное имя</th>
                <th>Ключ шардирования</th>
                <th>Шард</th>
                <th>Дата создания</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.full_name || '-'}</td>
                  <td>{user.shard_key}</td>
                  <td>
                    <span className="shard-badge">{user.shard_name}</span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : searchKey ? (
          <div className="no-users">
            Пользователи с ключом "{searchKey}" не найдены
          </div>
        ) : (
          <div className="no-users">
            Введите ключ шардирования для поиска пользователей
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement