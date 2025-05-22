"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const VerifyPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ""

  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [error, setError] = useState("")

  // Countdown timer
  useEffect(() => {
    if (!email) {
      navigate("/register")
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5080/api/NguoiDung/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otp),
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message || "Xác thực thành công! Bạn có thể đăng nhập.")
        navigate("/login")
      } else {
        setError(result.message || "Xác thực thất bại.")
      }
    } catch (error) {
      console.error("Lỗi khi xác thực OTP:", error)
      setError("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError("Không có email để gửi lại mã OTP")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("http://localhost:5080/api/NguoiDung/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message || "Đã gửi lại mã OTP. Vui lòng kiểm tra email.")
        setTimeLeft(300) // Reset timer to 5 minutes
      } else {
        setError(result.message || "Không thể gửi lại mã OTP.")
      }
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error)
      setError("Có lỗi xảy ra khi gửi lại mã OTP.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no email is provided, redirect to register page
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
          <p className="text-center text-red-500">Không có thông tin email. Vui lòng quay lại trang đăng ký.</p>
          <button
            onClick={() => navigate("/register")}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
          >
            Quay lại đăng ký
          </button>
        </div>
      </div>
    )
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
              Mã OTP sẽ hết hạn sau: <span className="font-medium text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          </div>
        ) : (
          <p className="text-center text-red-500 mb-4">Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.</p>
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
            {timeLeft > 0 ? `Gửi lại mã sau ${formatTime(timeLeft)}` : "Gửi lại mã OTP"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate("/register")} className="text-gray-600 hover:text-gray-800 text-sm">
            Quay lại đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyPage
