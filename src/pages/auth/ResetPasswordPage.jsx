"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RefreshCw } from "lucide-react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy token từ URL khi component được tải
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Không tìm thấy token đặt lại mật khẩu trong URL");
    }
  }, [location]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/NguoiDung/reset-password/link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Token: token,
            MatKhau: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Đặt lại mật khẩu thành công");
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Chờ 2 giây để toast hiển thị rồi mới chuyển trang
      } else {
        setError(data.message || "Có lỗi xảy ra. Vui lòng thử lại sau");
        toast.error(data.message || "Có lỗi xảy ra. Vui lòng thử lại sau");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Có lỗi xảy ra khi kết nối đến máy chủ");
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (error === "Không tìm thấy token đặt lại mật khẩu trong URL") {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            Liên kết không hợp lệ
          </h2>
          <p className="text-gray-600 mb-6">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử
            lại với một liên kết mới.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yêu cầu liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Đặt lại mật khẩu
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              Mật khẩu phải có ít nhất 6 ký tự
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Đang xử lý...
              </span>
            ) : (
              "Đặt lại mật khẩu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
