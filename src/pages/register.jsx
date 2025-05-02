import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    // Kiểm tra Tên đăng nhập
    if (!userData.username) {
      newErrors.username = "Tên đăng nhập là bắt buộc.";
    }

    // Kiểm tra Họ và tên
    if (!userData.name) {
      newErrors.name = "Họ và tên là bắt buộc.";
    }

    // Kiểm tra Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!userData.email) {
      newErrors.email = "Email là bắt buộc.";
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    // Kiểm tra Mật khẩu
    if (!userData.password) {
      newErrors.password = "Mật khẩu là bắt buộc.";
    } else if (userData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    // Kiểm tra Xác nhận mật khẩu
    if (!userData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    } else if (userData.confirmPassword !== userData.password) {
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp.";
    }

    // Kiểm tra Địa chỉ
    if (!userData.address) {
      newErrors.address = "Địa chỉ là bắt buộc.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log("Dữ liệu người dùng:", userData);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Đăng ký tài khoản
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Tên đăng nhập */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="username"
              >
                Tên đăng nhập
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="username"
                type="text"
                name="username"
                placeholder="Tên đăng nhập"
                value={userData.username}
                onChange={handleChange}
                required
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Họ và tên */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="name"
              >
                Họ và tên
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="name"
                type="text"
                name="name"
                placeholder="Họ và tên"
                value={userData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="password"
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={userData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Xác nhận mật khẩu */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Địa chỉ */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="address"
              >
                Địa chỉ
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="address"
                type="text"
                name="address"
                placeholder="Địa chỉ"
                value={userData.address}
                onChange={handleChange}
                required
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Nút Đăng ký */}
          <div className="flex items-center justify-center mt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md w-full sm:w-auto"
              type="submit"
            >
              Đăng ký
            </button>
          </div>
        </form>

        {/* Link Đăng nhập */}
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 transition duration-200"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
