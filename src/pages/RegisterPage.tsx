import { useState } from 'react'
import { useAuth } from "../provider/AuthProvider"
import { useNavigate } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(email, password) 
      alert("Registration successful! Please confirm your email before logging in.")
      navigate('/confirm', { state: { username: email } }) 
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="text-center text-sm text-gray-600 mt-4">
          <p>Already have an account?</p>
          <button
            onClick={() => navigate('/login')}  // ✅ Use navigation
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
