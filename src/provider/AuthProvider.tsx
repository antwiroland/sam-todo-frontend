import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
}

interface AuthContextType {
  tokens: AuthTokens | null
  login: (username: string, password: string) => Promise<void>
  register: (password: string, email: string) => Promise<void>
  confirm: (username: string, code: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_URL || ''
  useEffect(() => {
    const storedTokens = localStorage.getItem('authTokens')
    if (storedTokens) setTokens(JSON.parse(storedTokens))
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    console.log("base url ", API_BASE)
    try {
      const response = await fetch(`https://uy3cysk13j.execute-api.eu-central-1.amazonaws.com/dev/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      const authTokens: AuthTokens = {
        accessToken: data.AuthenticationResult.AccessToken,
        idToken: data.AuthenticationResult.IdToken,
        refreshToken: data.AuthenticationResult.RefreshToken,
      }

      setTokens(authTokens)
      localStorage.setItem('authTokens', JSON.stringify(authTokens))
    } catch (error: any) {
      if (error.message.includes('User is not confirmed')) {
        throw { type: 'UserNotConfirmed', message: 'Please confirm your account before signing in.' }
      }
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch(`https://uy3cysk13j.execute-api.eu-central-1.amazonaws.com/dev/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      console.log('Registration success:', data)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const confirm = async (username: string, code: string) => {
    try {
      const response = await fetch(`https://uy3cysk13j.execute-api.eu-central-1.amazonaws.com/dev/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Confirmation failed')
      }

      const data = await response.json()
      console.log('Confirmation success:', data)
    } catch (error) {
      console.error('Confirmation error:', error)
      throw error
    }
  }

  const logout = () => {
    setTokens(null)
    localStorage.removeItem('authTokens')
  }

  return (
    <AuthContext.Provider
      value={{ tokens, login, register, confirm, logout, isAuthenticated: !!tokens, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
