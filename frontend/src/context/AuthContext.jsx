// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }

        return
      }

      try {
        const res = await api.get('/auth/me')

        if (isMounted) {
          setUser(res.data)
        }
      } catch (err) {
        console.error('Auth check failed:', err)

        const status = err.response?.status

        // نحذف التوكن فقط إذا كان غير صالح فعلاً
        if (status === 401 || status === 403) {
          localStorage.removeItem('token')

          if (isMounted) {
            setUser(null)
          }

          return
        }

        // أخطاء مؤقتة: لا نحذف التوكن
        // مثل: reload سريع، انقطاع اتصال، backend تأخر، request canceled
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)