"use client"
import React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

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
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    // Kiểm tra Tên đăng nhập
    if (!userData.tenTaiKhoan) {
      newErrors.tenTaiKhoan = "Tên đăng nhập là bắt buộc."
    }

    // Kiểm tra Họ và tên
    if (!userData.tenKhachHang) {
      newErrors.tenKhachHang = "Họ và tên là bắt buộc."
    }

    // Kiểm tra Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!userData.email) {
      newErrors.email = "Email là bắt buộc."
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = "Email không hợp lệ."
    }

    // Kiểm tra Mật khẩu
    if (!userData.matKhau) {
      newErrors.matKhau = "Mật khẩu là bắt buộc."
    } else if (userData.matKhau.length < 6) {
      newErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự."
    }

    // Kiểm tra Xác nhận mật khẩu
    if (!userData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc."
    } else if (userData.confirmPassword !== userData.matKhau) {
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp."
    }

    // Kiểm tra Địa chỉ
    if (!userData.diaChi) {
      newErrors.diaChi = "Địa chỉ là bắt buộc."
    }

    // Kiểm tra Số điện thoại
    if (userData.soDienThoai && !/^[0-9]{10}$/.test(userData.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại không hợp lệ."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validate()) {
      setIsSubmitting(true)
      try {
        // Bỏ confirmPassword khỏi dữ liệu gửi lên
        const { confirmPassword, ...registerData } = userData

        const response = await fetch("http://localhost:5080/api/NguoiDung/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        })

        const result = await response.json()

        if (response.ok) {
          alert(result.message || "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.")
          navigate("/verify", { state: { email: userData.email } })
        } else {
          alert(result.message || "Đăng ký thất bại.")
        }
      } catch (error) {
        console.error("Lỗi khi đăng ký:", error)
        alert("Có lỗi xảy ra khi đăng ký.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng ký tài khoản</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tenTaiKhoan">
                Tên đăng nhập
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.tenTaiKhoan ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="tenTaiKhoan"
                type="text"
                name="tenTaiKhoan"
                placeholder="Tên đăng nhập"
                value={userData.tenTaiKhoan}
                onChange={handleChange}
                required
              />
              {errors.tenTaiKhoan && <p className="text-red-500 text-xs mt-1">{errors.tenTaiKhoan}</p>}
            </div>

            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tenKhachHang">
                Họ và tên
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.tenKhachHang ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="tenKhachHang"
                type="text"
                name="tenKhachHang"
                placeholder="Họ và tên"
                value={userData.tenKhachHang}
                onChange={handleChange}
                required
              />
              {errors.tenKhachHang && <p className="text-red-500 text-xs mt-1">{errors.tenKhachHang}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="soDienThoai">
                Số điện thoại
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.soDienThoai ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="soDienThoai"
                type="tel"
                name="soDienThoai"
                placeholder="Số điện thoại"
                value={userData.soDienThoai}
                onChange={handleChange}
              />
              {errors.soDienThoai && <p className="text-red-500 text-xs mt-1">{errors.soDienThoai}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="matKhau">
                Mật khẩu
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.matKhau ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="matKhau"
                type="password"
                name="matKhau"
                placeholder="Mật khẩu"
                value={userData.matKhau}
                onChange={handleChange}
                required
              />
              {errors.matKhau && <p className="text-red-500 text-xs mt-1">{errors.matKhau}</p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="diaChi">
                Địa chỉ
              </label>
              <input
                className={`w-full px-4 py-3 border ${
                  errors.diaChi ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                id="diaChi"
                type="text"
                name="diaChi"
                placeholder="Địa chỉ"
                value={userData.diaChi}
                onChange={handleChange}
                required
              />
              {errors.diaChi && <p className="text-red-500 text-xs mt-1">{errors.diaChi}</p>}
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="ngaySinh">
                Ngày sinh
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                id="ngaySinh"
                type="date"
                name="ngaySinh"
                value={userData.ngaySinh || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Nút Đăng ký */}
          <div className="flex items-center justify-center mt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>

        {/* Link Đăng nhập */}
        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 transition duration-200">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
