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

  useEffect(() => {
    const storedTokens = localStorage.getItem('authTokens')
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens))
    }
    setLoading(false)
  }, [])

  // ✅ Login
const login = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/auth', {
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
    // Detect Cognito unconfirmed user
    if (error.message.includes("User is not confirmed")) {
      throw { type: "UserNotConfirmed", message: "Please confirm your account before signing in." }
    }
    throw error
  }
}


// ✅ Register (Username = email)
const register = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email,
        password,
        email,
      }),
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


  // ✅ Confirm user
  const confirm = async (username: string, code: string) => {
    try {
      const response = await fetch('/api/confirm', {
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

  // ✅ Logout
  const logout = () => {
    setTokens(null)
    localStorage.removeItem('authTokens')
  }

  const value: AuthContextType = {
    tokens,
    login,
    register,
    confirm,
    logout,
    isAuthenticated: !!tokens,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
