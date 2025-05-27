"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Info } from "lucide-react"

// Axios import
import axios from "axios"

// API Configuration
const API_URL = "http://localhost:5080/api/DatBan"
const USER_API_URL = "http://localhost:5080/api/NguoiDungManager"

// API Functions
const api = {
  getAll: () => axios.get(`${API_URL}/GetAll`),
  createOrderTable: (data) => axios.post(`${API_URL}/Create`, data),
  updateOrderTable: (id, data) => axios.put(`${API_URL}/Update/${id}`, data),
  deleteOrderTable: (id) => axios.delete(`${API_URL}/Delete/${id}`),
  getUserById: (userId) => axios.get(`${USER_API_URL}/${userId}`),
}

// Utility function to format date for backend
const formatDateForBackend = (date) => {
  // Tạo date object với timezone local
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  // Format: YYYY-MM-DDTHH:mm:ss (không có timezone để tránh conversion issues)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const AdvancedReservationPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [partySize, setPartySize] = useState(2)
  const [availableTimes, setAvailableTimes] = useState([])
  const [step, setStep] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
    maKhachHang: "",
  })

  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)
  const [reservationComplete, setReservationComplete] = useState(false)
  const [reservationCode, setReservationCode] = useState("")
  const [error, setError] = useState("")

  // Generate available times based on business logic
  const generateAvailableTimes = (date, partySize) => {
    const times = []
    const startHour = 10
    const endHour = 21
    const interval = 30

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        // Skip lunch break (12:00-13:00) on weekdays
        if (!isWeekend && hour === 12) continue

        // Reduce availability for large groups
        if (partySize > 10 && Math.random() > 0.6) continue

        // Reduce availability on weekends
        if (isWeekend && Math.random() > 0.7) continue

        // Normal availability
        if (Math.random() > 0.3) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          times.push(timeString)
        }
      }
    }

    return times.sort()
  }

  // Initialize user data
  useEffect(() => {
    const token = localStorage.getItem("token")
    const uid = localStorage.getItem("usersId")

    setIsLoggedIn(!!token)

    if (uid) {
      setUserId(uid)
      fetchUserData(uid)
    } else {
      // Set default maKhachHang if no user logged in
      setCustomerInfo((prev) => ({
        ...prev,
        maKhachHang: "GUEST_" + Date.now(),
      }))
    }
  }, [])

  // Fetch user data using NguoiDungManager API
  const fetchUserData = async (uid) => {
    setUserLoading(true)
    setError("")

    try {
      // console.log("🔄 Đang tải thông tin người dùng với ID:", uid)

      const response = await api.getUserById(uid)
      const userData = response.data

      // console.log("✅ Dữ liệu người dùng nhận được:", userData)

      // Xử lý dữ liệu từ NguoiDungManagerController
      const customerCode = userData.maKhachHang || userData.maTaiKhoan || uid
      const userName = userData.tenKhachHang || userData.hoTenNhanVien || userData.tenTaiKhoan || ""
      const userPhone = userData.soDienThoai || ""
      const userEmail = userData.email || ""

      setCustomerInfo({
        name: userName,
        email: userEmail,
        phone: userPhone,
        specialRequests: "",
        maKhachHang: customerCode,
      })

      // console.log("✅ Thông tin khách hàng đã được cập nhật:")
      // console.log("- Tên:", userName)
      // console.log("- Email:", userEmail)
      // console.log("- SĐT:", userPhone)
      // console.log("- Mã KH:", customerCode)
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin người dùng:", err)

      if (err.response) {
        const status = err.response.status
        if (status === 404) {
          setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        } else {
          setError("Lỗi tải thông tin người dùng: " + (err.response.data || "Unknown error"))
        }
      } else {
        setError("Không thể kết nối đến server để lấy thông tin người dùng.")
      }

      // Fallback: sử dụng uid làm maKhachHang
      setCustomerInfo((prev) => ({
        ...prev,
        maKhachHang: uid,
      }))

      console.log("🔄 Sử dụng fallback maKhachHang:", uid)
    } finally {
      setUserLoading(false)
    }
  }

  // Generate available times when date or party size changes
  useEffect(() => {
    setSelectedTime(null)
    if (selectedDate) {
      setLoading(true)

      // Simulate API delay
      setTimeout(() => {
        const times = generateAvailableTimes(selectedDate, partySize)
        setAvailableTimes(times)
        // console.log("✅ Đã tạo khung giờ cho", selectedDate.toDateString(), ":", times)
        setLoading(false)
      }, 500)
    }
  }, [selectedDate, partySize])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handlePartySizeChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (value >= 1 && value <= 20) {
      setPartySize(value)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    })
  }

  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2)
    } else if (step === 2) {
      completeReservation()
    }
  }

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const completeReservation = async () => {
    setLoading(true)
    setError("")

    // Validate required fields
    if (!customerInfo.maKhachHang) {
      setError("Không tìm thấy mã khách hàng. Vui lòng đăng nhập lại.")
      setLoading(false)
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.")
      setLoading(false)
      return
    }

    // Tạo thời gian đặt bàn (thời điểm hiện tại)
    const now = new Date()

    // Tạo thời gian đến (ngày đã chọn + giờ đã chọn)
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const thoiGianDen = new Date(selectedDate)
    thoiGianDen.setHours(hours, minutes, 0, 0) // Set giờ, phút, giây, millisecond

    // Kiểm tra thời gian hợp lệ
    if (thoiGianDen <= now) {
      setError("Thời gian đến phải sau thời điểm hiện tại.")
      setLoading(false)
      return
    }

    // Format thời gian cho backend
    const thoiGianDatFormatted = formatDateForBackend(now)
    const thoiGianDenFormatted = formatDateForBackend(thoiGianDen)

    const payload = {
      maKhachHang: customerInfo.maKhachHang,
      soLuongKhach: partySize,
      thoiGianDat: thoiGianDatFormatted,
      thoiGianDen: thoiGianDenFormatted,
      trangThai: "Đã đặt",
      ghiChu: customerInfo.specialRequests || "",
    }

    try {
      // console.log("🔄 Đang đặt bàn với payload:", payload)
      // console.log("📅 Thời gian đặt (hiện tại):", now.toLocaleString("vi-VN"))
      // console.log("📅 Thời gian đến:", thoiGianDen.toLocaleString("vi-VN"))

      const response = await api.createOrderTable(payload)

      if (response.data) {
        const result = response.data
        // console.log("✅ Response từ server:", result)

        // Extract maBanAn properly from different possible response formats
        let code = ""
        if (result.maBanAn) {
          code = result.maBanAn
        } else if (result.MaBanAn) {
          code = result.MaBanAn
        } else if (typeof result === "string") {
          // If response is a string, try to extract BA code
          const match = result.match(/BA[A-Z0-9]+/i)
          if (match) {
            code = match[0]
          } else {
            // If no BA code found, generate one
            code = "BA" + Math.random().toString(36).substring(2, 8).toUpperCase()
          }
        } else if (result.message) {
          // Check if message contains BA code
          const match = result.message.match(/BA[A-Z0-9]+/i)
          if (match) {
            code = match[0]
          } else {
            code = "BA" + Math.random().toString(36).substring(2, 8).toUpperCase()
          }
        } else {
          // Fallback to generated code with BA prefix
          code = "BA" + Math.random().toString(36).substring(2, 8).toUpperCase()
        }

        setReservationCode(code)
        setReservationComplete(true)
        localStorage.setItem("maDatBan", result);
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err) {
      console.error("❌ Đặt bàn thất bại:", err)

      if (err.response) {
        const status = err.response.status
        const errorData = err.response.data

        if (status === 404 && typeof errorData === "string" && errorData.includes("MaKhachHang not found")) {
          setError("Không tìm thấy thông tin khách hàng. Vui lòng kiểm tra lại thông tin đăng nhập.")
        } else if (status === 400) {
          setError(typeof errorData === "string" ? errorData : "Thông tin đặt bàn không hợp lệ.")
        } else {
          setError(typeof errorData === "string" ? errorData : "Đặt bàn thất bại.")
        }
      } else if (err.request) {
        setError("Không thể kết nối đến server. Vui lòng thử lại sau.")
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  const generateCalendar = () => {
    const today = new Date()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const days = []

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      const isPast = date < new Date(today.setHours(0, 0, 0, 0))

      days.push({
        date,
        day: i,
        isToday,
        isPast,
        isSelected:
          selectedDate &&
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear(),
      })
    }

    return days
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const days = generateCalendar()
    const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chọn ngày</h3>
          <div className="flex items-center">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="mx-2 font-medium">
              {currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100 border-none bg-transparent cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {days.map((day, index) => (
            <div key={index} className="aspect-square">
              {day ? (
                <button
                  onClick={() => !day.isPast && handleDateSelect(day.date)}
                  disabled={day.isPast}
                  className={`w-full h-full rounded-full text-sm border-none cursor-pointer ${
                    day.isSelected
                      ? "bg-blue-600 text-white"
                      : day.isToday
                        ? "bg-blue-100 text-blue-800"
                        : day.isPast
                          ? "text-gray-300 cursor-not-allowed bg-transparent"
                          : "hover:bg-gray-100 bg-transparent"
                  }`}
                >
                  {day.day}
                </button>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return <div className="text-center py-8 text-gray-500">Vui lòng chọn ngày để xem các khung giờ có sẵn</div>
    }

    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-500">Đang tải khung giờ...</p>
        </div>
      )
    }

    if (availableTimes.length === 0) {
      return <div className="text-center py-8 text-gray-500">Không có khung giờ nào khả dụng cho ngày đã chọn</div>
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Chọn giờ ({availableTimes.length} khung giờ có sẵn)</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`py-2 px-3 rounded-md text-sm font-medium border cursor-pointer ${
                selectedTime === time
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Thông tin đặt bàn</h3>
        <p className="text-gray-600">Chọn ngày, giờ và số lượng khách</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label htmlFor="party-size" className="block text-sm font-medium text-gray-700 mb-2">
              Số người (1-20)
            </label>
            <input
              id="party-size"
              type="number"
              min="1"
              max="20"
              value={partySize}
              onChange={handlePartySizeChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Số lượng khách ảnh hưởng đến khung giờ có sẵn</p>
          </div>
          {renderCalendar()}
        </div>

        <div>{renderTimeSlots()}</div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNextStep}
          disabled={!selectedDate || !selectedTime}
          className={`px-6 py-3 rounded-md font-medium border-none cursor-pointer ${
            selectedDate && selectedTime
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Thông tin liên hệ</h3>
        {/* <p className="text-gray-600">Nhập thông tin để hoàn tất đặt bàn</p> */}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {userLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">Đang tải thông tin người dùng...</p>
        </div>
      )}

    

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={customerInfo.name}
              onChange={handleInputChange}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={customerInfo.email}
              onChange={handleInputChange}
             readOnly
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập email"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={handleInputChange}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
            Yêu cầu đặc biệt
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={customerInfo.specialRequests}
            onChange={handleInputChange}
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập yêu cầu đặc biệt nếu có"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold mb-4">Chi tiết đặt bàn</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <p className="text-gray-500">Ngày</p>
              <p className="font-medium">{selectedDate?.toLocaleDateString("vi-VN")}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <p className="text-gray-500">Giờ</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <p className="text-gray-500">Số người</p>
              <p className="font-medium">{partySize} người</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Chính sách đặt bàn:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>Vui lòng đến đúng giờ. Bàn sẽ được giữ trong vòng 15 phút.</li>
              <li>Hủy đặt bàn miễn phí trước 2 giờ.</li>
              <li>Đặt cọc có thể được yêu cầu cho nhóm từ 6 người trở lên.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevStep}
          className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50 cursor-pointer bg-white"
        >
          Quay lại
        </button>
        <button
          onClick={handleNextStep}
          disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone || loading}
          className={`px-6 py-3 rounded-md font-medium border-none cursor-pointer ${
            customerInfo.name && customerInfo.email && customerInfo.phone && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Đang xử lý..." : "Xác nhận đặt bàn"}
        </button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-2">Đặt bàn thành công!</h2>
      <p className="text-gray-600 mb-6">
        Cảm ơn bạn đã đặt bàn tại nhà hàng của chúng tôi. Chúng tôi đã gửi email xác nhận đến {customerInfo.email}.
      </p>

      <div className="bg-gray-50 p-4 rounded-md inline-block mb-6">
        <p className="text-sm text-gray-500 mb-1">Mã đặt bàn của bạn</p>
        <p className="text-xl font-bold tracking-wider">{reservationCode}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 text-left mb-8">
        <h3 className="text-lg font-semibold mb-4">Chi tiết đặt bàn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Ngày và giờ</p>
            <p className="font-medium">
              {selectedDate?.toLocaleDateString("vi-VN")} lúc {selectedTime}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Số người</p>
            <p className="font-medium">{partySize} người</p>
          </div>
          <div>
            <p className="text-gray-500">Tên</p>
            <p className="font-medium">{customerInfo.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Điện thoại</p>
            <p className="font-medium">{customerInfo.phone}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 border-none cursor-pointer"
        >
          Quay lại trang chủ
        </button>
        <button
          onClick={() => (window.location.href = "/menu")}
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 cursor-pointer bg-white"
        >
          Xem thực đơn
        </button>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Đặt bàn trực tuyến</h1>
        <p className="text-gray-600">Đặt bàn trước để đảm bảo trải nghiệm ẩm thực tuyệt vời của bạn</p>
      </div>

      {!reservationComplete ? (
        <>
          {/* Progress steps */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex text-xs mt-2">
              <div className="flex-1 text-center">Chọn ngày & giờ</div>
              <div className="flex-1 text-center">Thông tin cá nhân</div>
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </>
      ) : (
        renderConfirmation()
      )}
    </div>
  )
}

export default AdvancedReservationPage
