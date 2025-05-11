import React from "react"
import { NavLink } from "react-router-dom"
import { useSidebar } from "../../hooks/useSidebar"

const SidebarMenuItem = ({ icon, title, to, onClick }) => {
  const { isOpen } = useSidebar()

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${
          isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      <div className="flex-shrink-0">{icon}</div>
      {isOpen && (
        <span className="ml-3 transition-opacity duration-200 opacity-100">{title}</span>
      )}
      {!isOpen && (
        <span className="ml-3 opacity-0 transition-opacity duration-200">{title}</span>
      )}
    </NavLink>
  )
}

export default SidebarMenuItem
