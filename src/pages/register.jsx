import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import imgLogin from "../assets/imgLogin.jpg";

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    tenTaiKhoan: "",
    tenKhachHang: "",
    email: "",
    matKhau: "",
    confirmPassword: "",
    diaChi: "",
    soDienThoai: "",
    ngaySinh: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!userData.tenTaiKhoan)
      newErrors.tenTaiKhoan = "Tên đăng nhập là bắt buộc.";
    if (!userData.tenKhachHang)
      newErrors.tenKhachHang = "Họ và tên là bắt buộc.";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!userData.email) newErrors.email = "Email là bắt buộc.";
    else if (!emailRegex.test(userData.email))
      newErrors.email = "Email không hợp lệ.";
    if (!userData.matKhau) newErrors.matKhau = "Mật khẩu là bắt buộc.";
    else if (userData.matKhau.length < 6)
      newErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!userData.confirmPassword)
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    else if (userData.confirmPassword !== userData.matKhau)
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp.";
    if (!userData.diaChi) newErrors.diaChi = "Địa chỉ là bắt buộc.";
    if (userData.soDienThoai && !/^[0-9]{10}$/.test(userData.soDienThoai))
      newErrors.soDienThoai = "Số điện thoại không hợp lệ.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const { confirmPassword, ...registerData } = userData;
        const response = await fetch(
          "http://localhost:5080/api/NguoiDung/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData),
          }
        );
        const result = await response.json();
        console.log("Register response:", { status: response.status, result });
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: result.message || "Đã gửi mã OTP. Vui lòng kiểm tra email.",
          });
          navigate("/verify", {
            state: {
              email: userData.email,
              taiKhoanDTO: registerData,
              createdAt: result.createdAt,
            },
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: result.message || "Đăng ký thất bại.",
          });
        }
      } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side: Image Section */}
      <div className="w-[65%] h-screen">
        <img
          src={imgLogin}
          alt="Register"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Right Side: Form Section */}
      <div className="w-[35%] h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-sm p-6 overflow-y-auto h-full">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Đăng ký tài khoản
          </h1>
          <div className="space-y-4">
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="tenTaiKhoan"
              >
                Tên đăng nhập
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.tenTaiKhoan ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="tenTaiKhoan"
                type="text"
                name="tenTaiKhoan"
                placeholder="Tên đăng nhập"
                value={userData.tenTaiKhoan}
                onChange={handleChange}
                required
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {errors.tenTaiKhoan && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tenTaiKhoan}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="tenKhachHang"
              >
                Họ và tên
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.tenKhachHang ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="tenKhachHang"
                type="text"
                name="tenKhachHang"
                placeholder="Họ và tên"
                value={userData.tenKhachHang}
                onChange={handleChange}
                required
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {errors.tenKhachHang && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tenKhachHang}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
                required
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="soDienThoai"
              >
                Số điện thoại
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.soDienThoai ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="soDienThoai"
                type="tel"
                name="soDienThoai"
                placeholder="Số điện thoại"
                value={userData.soDienThoai}
                onChange={handleChange}
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5h4l1 7H5m4-7v7a2 2 0 002 2h2a2 2 0 002-2V5m-4 14h4"
                />
              </svg>
              {errors.soDienThoai && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.soDienThoai}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="matKhau"
              >
                Mật khẩu
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.matKhau ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="matKhau"
                type="password"
                name="matKhau"
                placeholder="Mật khẩu"
                value={userData.matKhau}
                onChange={handleChange}
                required
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2m12 0H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z"
                />
              </svg>
              {errors.matKhau && (
                <p className="text-red-500 text-xs mt-1">{errors.matKhau}</p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2m12 0H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13l2 2 4-4"
                />
              </svg>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="diaChi"
              >
                Địa chỉ
              </label>
              <input
                className={`w-full px-4 py-2 pl-10 border ${
                  errors.diaChi ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700`}
                id="diaChi"
                type="text"
                name="diaChi"
                placeholder="Địa chỉ"
                value={userData.diaChi}
                onChange={handleChange}
                required
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9.75L12 4l9 5.75M4.5 10.5v7.25A2.25 2.25 0 006.75 20h10.5A2.25 2.25 0 0020 17.75V10.5"
                />
              </svg>
              {errors.diaChi && (
                <p className="text-red-500 text-xs mt-1">{errors.diaChi}</p>
              )}
            </div>
            <div className="relative">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="ngaySinh"
              >
                Ngày sinh
              </label>
              <input
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
                id="ngaySinh"
                type="date"
                name="ngaySinh"
                value={userData.ngaySinh || ""}
                onChange={handleChange}
              />
              <svg
                className="absolute left-3 top-9 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng ký"
              )}
            </button>
            <div className="text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-red-800 transition duration-200"
              >
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
