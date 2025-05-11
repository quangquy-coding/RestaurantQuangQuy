import { Link } from "react-router-dom"
import React from "react"

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Restaurant Management System</h1>
      <div className="flex gap-4">
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Login
        </Link>
        <Link to="/register" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
          Register
        </Link>
        <Link to="/admin" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          Admin Dashboard
        </Link>
      </div>
    </div>
  )
}

export default App
