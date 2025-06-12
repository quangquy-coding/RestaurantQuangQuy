// components/common/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // Nếu đã đăng nhập -> redirect về trang chủ hoặc dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
