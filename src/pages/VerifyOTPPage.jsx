"use client";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const VerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    email,
    taiKhoanDTO,
    createdAt: stateCreatedAt,
  } = location.state || {};

  // Retrieve createdAt from localStorage if not in location.state
  const initialCreatedAt =
    stateCreatedAt || localStorage.getItem("otpCreatedAt");

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!initialCreatedAt) return 300; // Fallback to 5 minutes if no createdAt
    const created = new Date(initialCreatedAt);
    const expires = new Date(created.getTime() + 5 * 60 * 1000); // 5 minutes
    const now = new Date();
    return Math.max(0, Math.floor((expires - now) / 1000));
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email || !taiKhoanDTO) {
      navigate("/register");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, taiKhoanDTO, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !/^\d{6}$/.test(otp)) {
      setError("Mã OTP phải là 6 chữ số.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5080/api/NguoiDung/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(otp),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: result.message || "Xác thực thành công! Bạn có thể đăng nhập.",
        }).then(() => {
          localStorage.removeItem("otpCreatedAt"); // Clean up
          navigate("/login");
        });
      } else {
        setError(
          result.message === "Email đã được sử dụng trong bảng TAIKHOAN."
            ? "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."
            : result.message || "Xác thực thất bại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác thực OTP:", error);
      setError("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!taiKhoanDTO) {
      setError("Không có thông tin đăng ký để gửi lại mã OTP");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "http://localhost:5080/api/NguoiDung/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taiKhoanDTO),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: result.message || "Đã gửi lại mã OTP. Vui lòng kiểm tra email.",
        });
        localStorage.setItem("otpCreatedAt", result.createdAt);
        const created = new Date(result.createdAt);
        const expires = new Date(created.getTime() + 5 * 60 * 1000);
        const now = new Date();
        setTimeLeft(Math.max(0, Math.floor((expires - now) / 1000)));
      } else {
        setError(result.message || "Không thể gửi lại mã OTP.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      setError("Có lỗi xảy ra khi gửi lại mã OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email || !taiKhoanDTO) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
          <p className="text-center text-red-500">
            Không có thông tin email hoặc đăng ký. Vui lòng quay lại trang đăng
            ký.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
          >
            Quay lại đăng ký
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Xác minh OTP</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Mã OTP đã được gửi đến email: <strong>{email}</strong>
        </p>

        {timeLeft > 0 ? (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Mã OTP sẽ hết hạn sau:{" "}
              <span className="font-medium text-blue-600">
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-center text-red-500 mb-4">
            Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
          </p>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`w-full px-3 py-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded mb-2 text-center text-lg tracking-widest`}
              maxLength={6}
              required
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || timeLeft === 0}
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác minh"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResendOTP}
            disabled={isSubmitting || timeLeft > 0}
            className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {timeLeft > 0
              ? `Gửi lại mã sau ${formatTime(timeLeft)}`
              : "Gửi lại mã OTP"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Quay lại đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
