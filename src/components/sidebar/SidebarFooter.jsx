import React from "react"

import { useNavigate } from "react-router-dom"
import { useSidebar } from "../../hooks/useSidebar"

const SidebarFooter = () => {
  const { isOpen } = useSidebar()
  const navigate = useNavigate()

  const handleLogout = () => {
    // Logic to log out
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <button
        onClick={handleLogout}
        className="flex items-center w-full py-2 px-4 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
      >
      
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {isOpen && <span className="ml-3">Đăng xuất</span>}
      </button>
    </div>
  )
}

export default SidebarFooter
