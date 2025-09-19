import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/check', {
        withCredentials: true
      })
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/auth/login', { email, password }, {
        withCredentials: true
      })
      setUser(response.data.user)
      navigate('/dashboard')
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await axios.post('/api/auth/logout', null, {
        withCredentials: true
      })
      setUser(null)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, login, logout, checkAuth }
}
