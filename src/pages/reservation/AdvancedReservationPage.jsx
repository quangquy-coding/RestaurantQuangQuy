import React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Link } from "react-router-dom"

const AdvancedReservationPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [partySize, setPartySize] = useState(2)
  const [availableTimes, setAvailableTimes] = useState([])
  const [availableTables, setAvailableTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [step, setStep] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })



  const [loading, setLoading] = useState(false)
  const [reservationComplete, setReservationComplete] = useState(false)
  const [reservationCode, setReservationCode] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    if (token) {
      // In a real app, fetch user data from API
      setCustomerInfo({
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0901234567",
        specialRequests: "",
      })
    }
  }, [])

  useEffect(() => {
    // Reset selected time and tables when date changes
    setSelectedTime(null)
    setSelectedTable(null)

    if (selectedDate) {
      // Fetch available times for the selected date
      fetchAvailableTimes(selectedDate, partySize)
    }
  }, [selectedDate, partySize])

  useEffect(() => {
    if (selectedDate && selectedTime) {
      // Fetch available tables for the selected date and time
      fetchAvailableTables(selectedDate, selectedTime, partySize)
    }
  }, [selectedDate, selectedTime, partySize])

  const fetchAvailableTimes = (date, size) => {
    setLoading(true)
    // Simulate API call to get available times
    setTimeout(() => {
      // Generate some available times between 10:00 and 21:00
      const times = []
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      // More time slots available on weekends
      const startHour = 10
      const endHour = 21
      const interval = 30 // minutes

      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          // Skip some times to simulate unavailability
          if (
            (hour === 12 && minute === 30) ||
            (hour === 13 && minute === 0) ||
            (hour === 19 && minute === 0 && !isWeekend)
          ) {
            continue
          }

          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          times.push(timeString)
        }
      }

      setAvailableTimes(times)
      setLoading(false)
    }, 500)
  }

  const fetchAvailableTables = (date, time, size) => {
    setLoading(true)
    // Simulate API call to get available tables
    setTimeout(() => {
      // Generate some available tables
      const tables = []
      const totalTables = size <= 2 ? 5 : size <= 4 ? 4 : 3

      for (let i = 1; i <= totalTables; i++) {
        const tableSize = size <= 2 ? 2 : size <= 4 ? 4 : 6
        const isWindow = i % 3 === 0
        const isQuiet = i % 2 === 0

        tables.push({
          id: i,
          number: `T${i}`,
          size: tableSize,
          location: isWindow ? "Cửa sổ" : isQuiet ? "Khu vực yên tĩnh" : "Khu vực chính",
          features: [
            isWindow ? "View đẹp" : null,
            isQuiet ? "Yên tĩnh" : null,
            i % 4 === 0 ? "Gần lối ra" : null,
          ].filter(Boolean),
        })
      }

      setAvailableTables(tables)
      setLoading(false)
    }, 500)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleTableSelect = (table) => {
    setSelectedTable(table)
  }

  const handlePartySizeChange = (e) => {
    setPartySize(Number.parseInt(e.target.value))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    })
  }

  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedTime && selectedTable) {
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

  const completeReservation = () => {
    setLoading(true)
    // Simulate API call to create reservation
    setTimeout(() => {
      // Generate a random reservation code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      setReservationCode(code)
      setReservationComplete(true)
      setLoading(false)
    }, 1000)
  }

  const generateCalendar = () => {
    const today = new Date()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    // Adjust for Sunday as first day of week (0)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null)
    }

    // Add days of the month
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

  const formatDate = (date) => {
    if (!date) return ""

    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("vi-VN", options)
  }

  const renderCalendar = () => {
    const days = generateCalendar()
    const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

    return (
      <div className="mb-6 ">
        <div className="flex items-center justify-between mb-4 ">
          <h3 className="text-lg font-semibold">Chọn ngày</h3>
          <div className="flex items-center">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="mx-2 font-medium">
              {currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight className="h-5 w-5" />
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
                  className={`w-full h-full flex items-center justify-center rounded-full text-sm ${
                    day.isSelected
                      ? "bg-blue-600 text-white"
                      : day.isToday
                        ? "bg-blue-100 text-blue-800"
                        : day.isPast
                          ? "text-gray-300 cursor-not-allowed"
                          : "hover:bg-gray-100"
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
        </div>
      )
    }

    if (availableTimes.length === 0) {
      return <div className="text-center py-8 text-gray-500">Không có khung giờ nào khả dụng cho ngày đã chọn</div>
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Chọn giờ</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`py-2 px-3 rounded-md text-sm font-medium ${
                selectedTime === time ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderTableSelection = () => {
    if (!selectedDate || !selectedTime) {
      return <div className="text-center py-8 text-gray-500">Vui lòng chọn ngày và giờ để xem các bàn có sẵn</div>;
    }
  
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
  
    if (availableTables.length === 0) {
      return <div className="text-center py-8 text-gray-500">Không có bàn nào khả dụng cho thời gian đã chọn</div>;
    }
  
    return (
      <div className="max-w-2xl mx-auto px-4">
        <h3 className="text-xl font-semibold mb-4">Chọn bàn</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTables.map((table) => (
            <div
              key={table.id}
              onClick={() => handleTableSelect(table)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTable?.id === table.id ? "border-blue-600 bg-blue-50" : "hover:border-blue-300"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Bàn {table.number}</h4>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">{table.size} người</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{table.location}</p>
              {table.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {table.features.map((feature, index) => (
                    <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8 ">
      <h3 className="text-xl font-semibold mb-6 ">Thông tin đặt bàn</h3>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="w-full">
          <div className="mb-4">
            <label htmlFor="party-size" className="block text-sm font-medium text-gray-700 mb-2">
              Số người
            </label>
            <select
              id="party-size"
              value={partySize}
              onChange={handlePartySizeChange}
              className="w-full p-3 text-sm border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                <option key={size} value={size}>
                  {size} người
                </option>
              ))}
            </select>
          </div>
  
          {renderCalendar()}
        </div>
  
        <div className="w-full">
          {renderTimeSlots()}
          {renderTableSelection()}
        </div>
      </div>
  
      <div className="flex justify-between">
        <div></div>
        <button
          onClick={handleNextStep}
          disabled={!selectedDate || !selectedTime || !selectedTable}
          className={`px-6 py-3 rounded-md font-medium ${
            selectedDate && selectedTime && selectedTable
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
  

  const renderStep2 = () => (
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
    <h3 className="text-xl font-semibold mb-6">Thông tin đặt bàn</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleInputChange}
            required
            className="w-full p-3 text-sm border border-gray-300 rounded-md"
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 text-sm border border-gray-300 rounded-md"
            placeholder="Nhập email"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
            required
            className="w-full p-3 text-sm border border-gray-300 rounded-md"
            placeholder="Nhập số điện thoại"
          />
        </div>
      </div>

      <div>
        <div className="mb-4">
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
            Yêu cầu đặc biệt (không bắt buộc)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={customerInfo.specialRequests}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-3 text-sm border border-gray-300 rounded-md"
            placeholder="Nhập yêu cầu đặc biệt nếu có"
          ></textarea>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 p-4 rounded-md mb-6">
      <h4 className="font-medium mb-2">Chi tiết đặt bàn</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <p className="text-gray-500">Ngày</p>
            <p className="font-medium">{selectedDate.toLocaleDateString("vi-VN")}</p>
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

    {/* Bàn thông tin */}
    <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
      <div className="flex items-start">
        <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800">Chính sách đặt bàn</p>
          <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
            <li>Vui lòng đến đúng giờ. Bàn sẽ được giữ trong vòng 15 phút.</li>
            <li>Hủy đặt bàn miễn phí trước 2 giờ.</li>
            <li>Đặt cọc có thể được yêu cầu cho nhóm từ 6 người trở lên.</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="flex justify-between max-w-xl mx-auto">
      <button
        onClick={handlePrevStep}
        className="px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
      >
        Quay lại
      </button>
      <button
        onClick={handleNextStep}
        disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
        className={`px-5 py-2 rounded-md font-medium ${
          customerInfo.name && customerInfo.email && customerInfo.phone
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang xử lý
          </span>
        ) : (
          "Xác nhận đặt bàn"
        )}
      </button>
    </div>
  </div>
);


  const renderConfirmation = () => (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
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

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-left mb-8">
        <h3 className="font-medium text-blue-800 mb-2">Chi tiết đặt bàn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Ngày và giờ</p>
            <p className="font-medium">
              {selectedDate.toLocaleDateString("vi-VN")} lúc {selectedTime}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Số người</p>
            <p className="font-medium">{partySize} người</p>
          </div>
          <div>
            <p className="text-gray-500">Bàn</p>
            <p className="font-medium">
              Bàn {selectedTable.number} ({selectedTable.location})
            </p>
          </div>
          <div>
            <p className="text-gray-500">Tên</p>
            <p className="font-medium">{customerInfo.name}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Quay lại trang chủ
        </Link>
        <Link
          to="/menu"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          Xem thực đơn
        </Link>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 mt-16  bg-red-50">
      <h1 className="text-3xl font-bold mb-2">Đặt bàn trực tuyến</h1>
      <p className="text-gray-600 mb-6">Đặt bàn trước để đảm bảo trải nghiệm ẩm thực tuyệt vời của bạn</p>

      {!reservationComplete ? (
        <>
          {/* Progress steps */}
          <div className="mb-8">
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
              <div className="flex-1 text-center ">Chọn ngày, giờ và bàn</div>
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
