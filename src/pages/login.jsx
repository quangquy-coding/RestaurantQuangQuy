import React, { useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Email from "../assets/email.png";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    tenTaiKhoan: "",
    matKhau: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:5080/api/login/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TenTaiKhoan: credentials.tenTaiKhoan,
          MatKhau: credentials.matKhau,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Đăng nhập thất bại");
      }

      const data = await response.json();
      localStorage.setItem("token", data.user.Token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5080/api/login/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Đăng nhập Google thất bại");
      }

      const data = await response.json();
      localStorage.setItem("token", data.user.Token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
          Đăng nhập tài khoản
        </h1>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="tenTaiKhoan"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tên tài khoản 
            </label>
            <input
              type="text"
              name="tenTaiKhoan"
              id="tenTaiKhoan"
              required
              placeholder="Tên tài khoản"
              value={credentials.tenTaiKhoan}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>

          <div>
            <label
              htmlFor="matKhau"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              name="matKhau"
              id="matKhau"
              required
              placeholder="Mật khẩu"
              value={credentials.matKhau}
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

        <div className="mt-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Đăng nhập Google thất bại")}
          />
        </div>

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
