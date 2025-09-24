'use client'

import { useState, useEffect } from 'react'

interface LocalUser {
  id: string
  email: string
  displayName: string
}

interface LocalAuthState {
  user: LocalUser | null
  loading: boolean
}

export function useLocalAuth() {
  const [authState, setAuthState] = useState<LocalAuthState>({
    user: null,
    loading: true
  })

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          const user = JSON.parse(userStr)
          setAuthState({
            user,
            loading: false
          })
        } else {
          setAuthState({
            user: null,
            loading: false
          })
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setAuthState({
          user: null,
          loading: false
        })
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar no localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setAuthState({
          user: data.user,
          loading: false
        })
        
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName })
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      loading: false
    })
  }

  return {
    user: authState.user,
    loading: authState.loading,
    login,
    register,
    logout
  }
}

