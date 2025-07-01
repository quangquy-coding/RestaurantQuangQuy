import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import imgLogin from "../assets/imgLogin.jpg"; // Adjust the path as necessary
const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    tenTaiKhoan: "",
    matKhau: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login/login`, {
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
        await Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text: errData.message || "Đăng nhập thất bại",
        });
        return;
      }
      const data = await response.json();
      localStorage.setItem("token", data.user.Token);
      localStorage.setItem("role", data.user.quyen);
      localStorage.setItem("usersId", data.user.maTaiKhoan);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }
      window.dispatchEvent(new Event("loginSuccess"));
      let redirectUrl = "/";
      if (data.user.quyen === "Admin" || data.user.quyen === "Q001") {
        redirectUrl = "/admin";
      } else if (
        data.user.quyen === "Nhân viên" ||
        data.user.quyen === "Q003"
      ) {
        redirectUrl = "/admin";
      } else if (
        data.user.quyen === "Khách hàng" ||
        data.user.quyen === "Q006"
      ) {
        redirectUrl = "/";
      }
      await Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công!",
        showConfirmButton: true,
        timer: 1500,
      });
      navigate(redirectUrl);
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: err.message,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login/google-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: credentialResponse.credential,
          }),
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        await Swal.fire({
          icon: "error",
          title: "Đăng nhập Google thất bại",
          text: errData.message || "Đăng nhập Google thất bại",
        });
        return;
      }
      const data = await response.json();
      localStorage.setItem("token", data.user.Token);
      localStorage.setItem("usersId", data.user.maTaiKhoan);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }
      let redirectUrl = "/";
      if (data.user.quyen === "Admin" || data.user.quyen === "Q001") {
        localStorage.setItem("role", data.user.quyen);
        redirectUrl = "/admin";
      } else if (
        data.user.quyen === "Nhân viên" ||
        data.user.quyen === "Q003" ||
        data.user.quyen === "Staff" ||
        data.user.quyen === "staff"
      ) {
        localStorage.setItem("role", data.user.quyen);
        redirectUrl = "/admin/staff";
      } else if (
        data.user.quyen === "Khách hàng" ||
        data.user.quyen === "Q006"
      ) {
        localStorage.setItem("role", data.user.quyen);
        redirectUrl = "/";
      }
      window.dispatchEvent(new Event("loginSuccess"));
      await Swal.fire({
        icon: "success",
        title: "Đăng nhập Google thành công!",
        showConfirmButton: true,
        timer: 1500,
      });
      navigate(redirectUrl);
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Đăng nhập Google thất bại",
        text: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-200 via-blue-50 to-white">
      {/* Left Side: Image Section - chiếm toàn bộ chiều ngang trừ phần login */}
      <div
        className=" lg:block flex-shrink-0"
        style={{ width: "calc(100vw - 480px)", height: "100vh" }}
      >
        <img
          src={imgLogin}
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Right Side: Form Section - cố định chiều rộng */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[480px] min-h-screen relative z-10">
        <div className="w-full max-w-md p-6 sm:p-8 bg-white/90 rounded-2xl shadow-xl mx-4">
          <h1 className="text-3xl  font-bold text-center text-gray-800 mb-8">
            Đăng nhập tài khoản
          </h1>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="tenTaiKhoan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tên tài khoản
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tenTaiKhoan"
                  id="tenTaiKhoan"
                  required
                  placeholder="Nhập tên tài khoản"
                  value={credentials.tenTaiKhoan}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 transition duration-200"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
              </div>
            </div>

            <div>
              <label
                htmlFor="matKhau"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="matKhau"
                  id="matKhau"
                  required
                  placeholder="Nhập mật khẩu"
                  value={credentials.matKhau}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 transition duration-200"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-700"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Đăng nhập
            </button>
          </div>

          <div className="mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => Swal.fire("Đăng nhập Google thất bại")}
              text="signin_with"
              shape="rectangular"
              theme="filled_white"
              logo_alignment="left"
              width="100%"
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  type="button"
                  className="w-full h-[48px] flex flex-row justify-center items-center space-x-4
                     bg-Text text-Text2 text-responsive border-[1px] border-Text2 rounded border-opacity-40 hover:shadow-md hover:text-Secondary2"
                >
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>

                  {/* Text */}
                  <span className="text-sm font-medium">
                    Đăng nhập với Google
                  </span>
                </button>
              )}
            />
          </div>

          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-800 transition duration-200 font-medium"
            >
              Quên mật khẩu?
            </Link>
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 transition duration-200 font-medium"
            >
              Đăng ký ngay
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            © Website Nhà hàng Quang Quý, by Nguyễn Quang Quý
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
