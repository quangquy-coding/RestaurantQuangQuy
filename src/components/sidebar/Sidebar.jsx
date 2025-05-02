import React from "react"
import SidebarHeader from "./SidebarHeader"
import SidebarFooter from "./SidebarFooter"
import SidebarMenu from "./SidebarMenu"
import { useSidebar } from "../../hooks/useSidebar"

const Sidebar = () => {
  const { isOpen, isMobile } = useSidebar()

  return (
    <>
      {/* Overlay trên mobile */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black opacity-40 z-40" onClick={() => toggleSidebar()} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-40 transition-all duration-300 ${
    isMobile
      ? isOpen
        ? "w-64"
        : "w-0"
      : isOpen
      ? "w-64"
      : "w-20"
  }`}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader />
          <SidebarMenu />
          <SidebarFooter />
        </div>
      </aside>
    </>
  )
}

export default Sidebar
