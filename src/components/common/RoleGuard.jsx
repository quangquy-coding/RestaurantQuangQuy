// RoleGuard.jsx
import React from "react";
import { Flex, Spin } from "antd";
import { Navigate } from "react-router-dom";

const RoleGuard = ({ children, blockRoles = [] }) => {
  const role = localStorage.getItem("role");
  if (blockRoles.includes(role)) {
    // Có thể show loading nếu muốn
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
        {setTimeout(() => {
          window.location.replace("/errorstaff");
        }, 0)}
      </Flex>
    );
    // Hoặc dùng <Navigate to="/errorstaff" replace /> nếu muốn chuyển hướng React Router
  }
  return children;
};

export default RoleGuard;
