"use client"
import React from "react"
import { useState } from "react"
import { User, Lock, Bell, CreditCard, AlertCircle, Edit, X, Check } from "lucide-react"

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState({
    profile: false,
    password: false,
    notifications: false,
    payment: false,
  })

  const [formData, setFormData] = useState({
    // Profile
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    dateOfBirth: "1990-01-15",
    address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    avatar: "/placeholder.svg?height=200&width=200",

    // Password
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,

    // Payment
    cards: [
      {
        id: 1,
        type: "visa",
        number: "**** **** **** 4242",
        expiry: "12/25",
        isDefault: true,
      },
      {
        id: 2,
        type: "mastercard",
        number: "**** **** **** 5555",
        expiry: "08/24",
        isDefault: false,
      },
    ],
  })

  const [originalData, setOriginalData] = useState({ ...formData })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        avatar: imageUrl,
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleEdit = (section) => {
    setIsEditing((prev) => ({
      ...prev,
      [section]: true,
    }))
    setOriginalData({ ...formData })
    setErrorMessage("")
    setSuccessMessage("")
  }

  const handleCancel = (section) => {
    setFormData({ ...originalData })
    setIsEditing((prev) => ({
      ...prev,
      [section]: false,
    }))
    setErrorMessage("")
  }

  const handleSave = (section) => {
    // Validation
    if (section === "password") {
      if (!formData.currentPassword) {
        setErrorMessage("Vui lòng nhập mật khẩu hiện tại")
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage("Mật khẩu mới không khớp")
        return
      }
      if (formData.newPassword.length < 8) {
        setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự")
        return
      }
    }

    if (section === "profile") {
      if (!formData.fullName.trim()) {
        setErrorMessage("Vui lòng nhập họ và tên")
        return
      }
      if (!formData.email.trim()) {
        setErrorMessage("Vui lòng nhập email")
        return
      }
      if (!formData.phone.trim()) {
        setErrorMessage("Vui lòng nhập số điện thoại")
        return
      }
    }

    // Simulate API call
    setTimeout(() => {
      setIsEditing((prev) => ({
        ...prev,
        [section]: false,
      }))
      setSuccessMessage("Cập nhật thành công!")
      setErrorMessage("")

      // Clear password fields after successful save
      if (section === "password") {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }, 500)
  }

  const handleSetDefaultCard = (cardId) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    }))
    setSuccessMessage("Đã cập nhật thẻ mặc định!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleAddCard = () => {
    // In a real app, this would open a modal or navigate to add card page
    alert("Chức năng thêm thẻ mới sẽ được triển khai")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
              {!isEditing.profile ? (
                <button
                  onClick={() => handleEdit("profile")}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCancel("profile")}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("profile")}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-row gap-6 items-start">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img src={formData.avatar || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                {isEditing.profile && (
                  <label
                    htmlFor="avatarUpload"
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer text-sm"
                  >
                    Chọn ảnh
                    <input
                      type="file"
                      id="avatarUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case "password":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
              {!isEditing.password ? (
                <button
                  onClick={() => handleEdit("password")}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCancel("password")}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("password")}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Lưu
                  </button>
                </div>
              )}
            </div>

            {isEditing.password ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-800">
                    Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Nhấn "Đổi mật khẩu" để thay đổi mật khẩu của bạn</p>
              </div>
            )}
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Cài đặt thông báo</h2>
              {!isEditing.notifications ? (
                <button
                  onClick={() => handleEdit("notifications")}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCancel("notifications")}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("notifications")}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Thông báo qua email</h3>
                  <p className="text-sm text-gray-500">Nhận thông báo về đơn hàng qua email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                    disabled={!isEditing.notifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Thông báo qua SMS</h3>
                  <p className="text-sm text-gray-500">Nhận thông báo về đơn hàng qua tin nhắn SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleInputChange}
                    disabled={!isEditing.notifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email khuyến mãi</h3>
                  <p className="text-sm text-gray-500">Nhận thông tin về khuyến mãi và ưu đãi đặc biệt</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="promotionalEmails"
                    checked={formData.promotionalEmails}
                    onChange={handleInputChange}
                    disabled={!isEditing.notifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            </div>
          </div>
        )

      case "payment":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>

            <div className="space-y-4">
              {formData.cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      {card.type === "visa" ? (
                        <span className="font-bold text-blue-700">VISA</span>
                      ) : (
                        <span className="font-bold text-red-500">MC</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{card.number}</p>
                      <p className="text-sm text-gray-500">Hết hạn: {card.expiry}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {card.isDefault ? (
                      <span className="text-sm font-medium text-green-600">Mặc định</span>
                    ) : (
                      <button
                        onClick={() => handleSetDefaultCard(card.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                    <button className="text-sm text-gray-600 hover:underline">Chỉnh sửa</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleAddCard} className="flex items-center text-blue-600 font-medium hover:text-blue-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Thêm phương thức thanh toán mới
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Cài đặt tài khoản</h1>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md flex items-center">
            <div className="mr-3">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-3" />
            {errorMessage}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-80 bg-gray-50 p-6 border-r">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    activeTab === "password"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Lock className="h-5 w-5 mr-3" />
                  Đổi mật khẩu
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    activeTab === "notifications"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Thông báo
                </button>

                <button
                  onClick={() => setActiveTab("payment")}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    activeTab === "payment"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  Phương thức thanh toán
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettingsPage
