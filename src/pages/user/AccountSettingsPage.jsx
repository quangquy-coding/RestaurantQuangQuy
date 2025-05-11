import React from "react"

import { useState } from "react"
import { Save, User, Lock, Bell, CreditCard, MapPin, AlertCircle } from "lucide-react"

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile")

  const Profile = () => {
    // State để lưu thông tin cá nhân
    const [userInfo, setUserInfo] = useState({
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
    });
  
    // State để lưu trạng thái chỉnh sửa (có thể đang chỉnh sửa hay không)
    const [isEditing, setIsEditing] = useState(false);
  
    // Hàm xử lý thay đổi giá trị trong form
    const handleChange = (e) => {
      const { name, value } = e.target;
      setUserInfo({
        ...userInfo,
        [name]: value,
      });
    };
  
    // Hàm để bật/tắt chế độ chỉnh sửa
    const toggleEdit = () => {
      setIsEditing(!isEditing);
    };
  
    // Hàm xử lý khi người dùng lưu thông tin (có thể gọi API ở đây để lưu vào database)
    const saveInfo = () => {
      console.log('Thông tin đã được lưu:', userInfo);
      toggleEdit(); // Tắt chế độ chỉnh sửa
    };
  }
  const [formData, setFormData] = useState({
    // Profile
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
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

    // Addresses
    addresses: [
      {
        id: 1,
        type: "home",
        address: "123 Đường Lê Lợi",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        isDefault: true,
      },
      {
        id: 2,
        type: "work",
        address: "456 Đường Nguyễn Huệ",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        isDefault: false,
      },
    ],
  })

  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho ảnh
      setFormData((prevData) => ({
        ...prevData,
        avatar: imageUrl,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form based on active tab
    if (activeTab === "password") {
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage("Mật khẩu mới không khớp")
        return
      }

      if (formData.newPassword.length < 8) {
        setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự")
        return
      }
    }

    // In a real app, you would send data to an API
    // For now, we'll just simulate success
    setSuccessMessage("Cập nhật thành công!")
    setErrorMessage("")
    setIsEditing(false)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  const handleSetDefaultCard = (cardId) => {
    setFormData({
      ...formData,
      cards: formData.cards.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    })
  }

  const handleSetDefaultAddress = (addressId) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={formData.avatar || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <label
                  htmlFor="avatarUpload"
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer"
                >
                  <span>Chọn ảnh</span>
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </p>
            </div>
          </div>
        )

      case "notifications":
        return (
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )

      case "payment":
        return (
          <div className="space-y-6">
            <h3 className="font-medium text-lg">Phương thức thanh toán</h3>

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

            <button className="flex items-center text-blue-600 font-medium">
              <CreditCard className="w-4 h-4 mr-2" />
              Thêm phương thức thanh toán mới
            </button>
          </div>
        )

      case "addresses":
        return (
          <div className="space-y-6">
            <h3 className="font-medium text-lg">Địa chỉ giao hàng</h3>

            <div className="space-y-4">
              {formData.addresses.map((address) => (
                <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{address.type === "home" ? "Nhà riêng" : "Văn phòng"}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Mặc định</span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{address.address}</p>
                    <p className="text-gray-600">
                      {address.district}, {address.city}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address.id)}
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

            <button className="flex items-center text-blue-600 font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Thêm địa chỉ mới
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Cài đặt tài khoản</h1>

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

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-70 bg-gray-50 p-6 border-r">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === "profile" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === "password" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Lock className="h-5 w-5 mr-3" />
                  Đổi mật khẩu
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === "notifications" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Thông báo
                </button>

                <button
                  onClick={() => setActiveTab("payment")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === "payment" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  Phương thức thanh toán
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === "addresses" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <MapPin className="h-5 w-5 mr-3" />
                  Địa chỉ giao hàng
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <form onSubmit={handleSubmit}>
                {renderTabContent()}

                {(activeTab === "profile" || activeTab === "password" || activeTab === "notifications") && (
                  <div className="mt-8 flex justify-end">
  {activeTab === "profile" && !isEditing ? (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Chỉnh sửa thông tin
    </button>
  ) : (
    <button
      type="submit"
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      <Save className="h-4 w-4 mr-2" />
      Lưu thay đổi
    </button>
  )}
</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettingsPage
