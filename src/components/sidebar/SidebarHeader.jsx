import React from "react"

import { Link } from "react-router-dom"
import { useSidebar } from "../../hooks/useSidebar"

const SidebarHeader = () => {
  const { isOpen, toggleSidebar } = useSidebar()

  return (
    
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {isOpen && (
        <Link to="/admin" className="text-xl font-bold text-blue-600">
        TRANG QUẢN TRỊ
        </Link>
      )}
      
      <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100 focus:outline-none">
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default SidebarHeader
