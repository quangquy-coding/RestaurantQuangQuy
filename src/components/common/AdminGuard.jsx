import React from "react";
import { Flex, Spin } from "antd";

const AdminGuard = ({ children }) => {
  const role = localStorage.getItem("role");
  // Cho phép cả admin và nhân viên vào admin layout
  const isAdmin =
    role === "Admin" ||
    role === "admin" ||
    role === "Q001" ||
    role === "Quản trị viên";
  const isStaff =
    role === "Nhân viên" ||
    role === "Q003" ||
    role === "Staff" ||
    role === "staff";
  if (!isAdmin && !isStaff) {
    // Nếu không phải admin hoặc nhân viên thì chặn
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
        {setTimeout(() => {
          window.location.replace("/erroruser");
        }, 0)}
      </Flex>
    );
  }
  return children;
};

export default AdminGuard;
