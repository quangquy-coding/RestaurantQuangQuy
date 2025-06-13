import { useSidebar } from "../../hooks/useSidebar";
import React from "react";
import SidebarMenuItem from "./SidebarMenuItem";
import { useLocation } from "react-router-dom";

const SidebarMenu = () => {
  const { isMobile, toggleSidebar, isCollapsed } = useSidebar();

  const location = useLocation(); // Get current location

  const handleItemClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const menuItems = [
    {
      title: "Tổng quan",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      end: true, // Use end to match exact path
      to: "/admin",
    },
    // hồ sơ cá nhân
    {
      title: "Hồ sơ cá nhân",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14c3.866 0 7 1.79 7 4v2H5v-2c0-2.21 3.134-4 7-4zm0-2a4 4 0 100-8 4 4 0 000 8z"
          />
        </svg>
      ),
      to: "/admin/profile",
    },

    {
      title: "Quản lý người dùng",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      to: "/admin/users",
    },
    {
      title: "Quản lý danh mục",
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      to: "/admin/categories",
    },
    {
      title: "Quản lý món ăn",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M4 4h16v2H4V4zm1 4h14v3a7 7 0 11-14 0V8z" />
        </svg>
      ),

      to: "/admin/dishes",
    },
    {
      title: "Quản lý bàn",
      icon: (
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
            d="M4 6h16M4 10h16M6 10v8M18 10v8"
          />
        </svg>
      ),

      to: "/admin/tables",
    },
    {
      title: "Quản lý đơn hàng",
      icon: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      to: "/admin/orders",
    },
    {
      title: "Báo cáo",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      to: "/admin/reports",
    },
    {
      title: "Phân tích",
      icon: (
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
            d="M11 5a7 7 0 107 7 7 7 0 00-7-7zm0 0v4m4.293 4.293l4.414 4.414"
          />
        </svg>
      ),
      to: "/admin/customer-analytics",
    },
    {
      title: "Quản lý khuyến mãi",
      icon: (
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
            d="M7 7h.01M3 11.5V5a2 2 0 012-2h6.5a1 1 0 01.7.3l7.5 7.5a1 1 0 010 1.4l-6.5 6.5a1 1 0 01-1.4 0l-7.5-7.5a1 1 0 01-.3-.7z"
          />
        </svg>
      ),
      to: "/admin/promotions",
    },
    {
      title: "Đánh giá",
      icon: (
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
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.1 6.475h6.816c.969 0 1.371 1.24.588 1.81l-5.507 4.004 2.1 6.475c.3.921-.755 1.688-1.538 1.118L12 17.75l-5.51 4.059c-.783.57-1.838-.197-1.538-1.118l2.1-6.475-5.507-4.004c-.783-.57-.38-1.81.588-1.81h6.816l2.1-6.475z"
          />
        </svg>
      ),
      to: "/admin/reviews",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto py-4 px-3">
      <ul className={isCollapsed ? "space-y-1" : "space-y-2"}>
        {menuItems.map((item) => (
          <li key={item.to}>
            <SidebarMenuItem
              title={item.title}
              icon={item.icon}
              to={item.to}
              end={item.end || false}
              onClick={handleItemClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
