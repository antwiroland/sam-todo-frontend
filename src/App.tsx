import { Routes, Route, Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { AuthProvider, useAuth } from "./provider/AuthProvider"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import TodoPage from "./pages/TodoPage"
import ConfirmPage from "./pages/ConfirmPage"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/todo" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
