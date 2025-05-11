import { Outlet } from "react-router-dom"
import Sidebar from "../components/sidebar/Sidebar"
import { SidebarProvider } from "../contexts/SidebarContext"
import React from "react"
import { useSidebar } from "../hooks/useSidebar"

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  )
}

const AdminLayoutContent = () => {
  const { isOpen, isMobile, toggleSidebar } = useSidebar()

  const sidebarWidth = isMobile ? 0 : isOpen ? 256 : 80

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Lớp phủ xám (nằm dưới sidebar) */}
      {isMobile && isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-40 z-30"
        />
      )}

      {/* Sidebar (nằm trên lớp phủ) */}
      <div className="z-40">
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 relative z-10"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <main className="flex-1 overflow-y-auto p-6 bg-gray-30">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
