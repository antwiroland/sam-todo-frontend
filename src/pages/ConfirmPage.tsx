import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const ConfirmPage: React.FC = () => {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // 1️⃣ Try state first, then fallback to URL query param
  const searchParams = new URLSearchParams(location.search)
  const username =
    (location.state as { username?: string })?.username ||
    searchParams.get("username") ||
    "" // fallback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!username) {
      setError("Username is required")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("https://uy3cysk13j.execute-api.eu-central-1.amazonaws.com/dev/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Confirmation failed")
      }

      // Redirect to login page
      navigate("/login")
    } catch (err: any) {
      setError(err.message || "Confirmation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Confirm Your Account</h2>

        {error && <div className="bg-red-100 text-red-600 p-2 rounded">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Confirmation Code"
            className="w-full border px-3 py-2 rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ConfirmPage
