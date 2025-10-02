import { useState } from 'react'
import { useAuth } from "../provider/AuthProvider"
import { useNavigate } from "react-router-dom"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate("/todo") // redirect to TodoPage
    } catch (err: any) {
      if (err.type === "UserNotConfirmed") {
        navigate(`/confirm?username=${encodeURIComponent(username)}`)
      } else {
        setError(err.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Don’t have an account?</p>
            <button
              type="button"
              onClick={() => navigate('/register')} // ✅ navigate to register
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
