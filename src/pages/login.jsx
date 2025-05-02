import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Email from "../assets/email.png";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("token", "mock-token");
    navigate("/admin");
  };

  const handleGoogleLogin = () => {
    alert("Đăng nhập bằng Gmail");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
          Đăng nhập tài khoản
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nhập bằng tài khoản hoặc email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              placeholder="Mật khẩu"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md"
          >
            Đăng nhập
          </button>
        </form>

        {/* Đăng nhập bằng Gmail */}
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-white border border-red-500 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-lg transition duration-300 shadow-md"
          >
            <img src={Email} alt="Gmail Logo" className="w-5 h-5 mr-3" />
            Đăng nhập bằng Gmail
          </button>
        </div>

        {/* Quên mật khẩu / Đăng ký */}
        <div className="mt-6 flex justify-between text-sm text-gray-600">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-800 transition duration-200"
          >
            Quên mật khẩu?
          </Link>
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 transition duration-200"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
