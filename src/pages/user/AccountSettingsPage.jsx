"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  AlertCircle,
  Edit,
  X,
  Check,
  Loader2,
} from "lucide-react";
import axios from "axios";

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState({
    profile: false,
    password: false,
    notifications: false,
    payment: false,
  });

  const [formData, setFormData] = useState({
    maTaiKhoan: "",
    tenTaiKhoan: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    diaChi: "",
    hinhAnh: null,
    maQuyen: "",
    tenKhachHang: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
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
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // API Configuration
  const API_BASE_URL = "http://localhost:5080/api";
  const USER_API_URL = `${API_BASE_URL}/NguoiDungManager`;
  const DEFAULT_AVATAR = "/placeholder.svg?height=200&width=200";

  // API Functions with Authorization Header
  const api = {
    getUserById: (userId, token) =>
      axios.get(`${USER_API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateUser: (userId, data, token) =>
      axios.put(`${USER_API_URL}/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    uploadAvatar: (file, token) => {
      const formData = new FormData();
      formData.append("file", file);
      return axios.post(`${API_BASE_URL}/upload/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    updateNotifications: (userId, notifications, token) =>
      axios.put(`${USER_API_URL}/${userId}/notifications`, notifications, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  };

  // Initialize user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("usersId");

    console.log("🔍 Checking authentication...");
    console.log("Token:", token ? "✅ Found" : "❌ Not found");
    console.log("User ID:", uid || "❌ Not found");

    setIsLoggedIn(!!token);

    if (uid && token) {
      setUserId(uid);
      fetchUserData(uid, token);
    } else {
      setErrorMessage("Vui lòng đăng nhập để xem thông tin tài khoản");
      setLoading(false);
    }
  }, []);

  // Fetch user data
  const fetchUserData = async (uid, token) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("🔄 Đang tải thông tin người dùng với ID:", uid);
      const response = await api.getUserById(uid, token);
      const userData = response.data;

      console.log("✅ Dữ liệu người dùng nhận được:", userData);

      const mappedData = {
        maTaiKhoan: userData.maTaiKhoan || "",
        tenTaiKhoan: userData.tenTaiKhoan || "",
        email: userData.email || "",
        soDienThoai: userData.soDienThoai || "",
        ngaySinh: userData.ngaySinh ? userData.ngaySinh.split("T")[0] : "",
        diaChi: userData.diaChi || "",
        hinhAnh: userData.hinhAnh || null,
        maQuyen: userData.maQuyen || "",
        tenKhachHang: userData.tenKhachHang || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        emailNotifications: userData.emailNotifications ?? true,
        smsNotifications: userData.smsNotifications ?? false,
        promotionalEmails: userData.promotionalEmails ?? true,
        cards: formData.cards,
      };

      setFormData(mappedData);
      setOriginalData(mappedData);
      setErrorMessage("");

      console.log("✅ Thông tin đã được cập nhật:");
      console.log("- Tên:", mappedData.tenTaiKhoan);
      console.log("- Email:", mappedData.email);
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin người dùng:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (err) => {
    if (err.response) {
      const status = err.response.status;
      const errorData = err.response.data;

      if (status === 404) {
        setErrorMessage(
          "Không tìm thấy thông tin người dùng. Vui lòng kiểm tra ID tài khoản hoặc đăng nhập lại."
        );
      } else if (status === 401) {
        setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("usersId");
      } else if (status === 400 && errorData.errors) {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");
        setErrorMessage(`Lỗi cập nhật: ${errorMessages}`);
      } else if (status === 405) {
        setErrorMessage(
          "Yêu cầu không được hỗ trợ bởi server. Vui lòng kiểm tra cấu hình API."
        );
      } else {
        setErrorMessage(
          errorData.message || "Lỗi xử lý yêu cầu: " + JSON.stringify(errorData)
        );
      }
    } else {
      setErrorMessage(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
      );
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", "demo_preset"); // Thay bằng preset Cloudinary của bạn

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dlozjvjhf/image/upload",
        {
          method: "POST",
          body: formDataUpload,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          hinhAnh: data.secure_url,
        }));
        setSuccessMessage("Tải ảnh thành công!");
      } else {
        setErrorMessage("Lỗi upload ảnh Cloudinary");
      }
    } catch (err) {
      setErrorMessage("Lỗi upload ảnh Cloudinary");
      console.error(err);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Start editing
  const handleEdit = (section) => {
    setIsEditing((prev) => ({
      ...prev,
      [section]: true,
    }));
    setOriginalData({ ...formData });
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Cancel editing
  const handleCancel = (section) => {
    setFormData({ ...originalData });
    setIsEditing((prev) => ({
      ...prev,
      [section]: false,
    }));
    setErrorMessage("");
  };

  // Save changes
  const handleSave = async (section) => {
    if (saving) return; // Prevent multiple submissions
    const token = localStorage.getItem("token");

    // Validation
    if (section === "password") {
      if (!formData.currentPassword) {
        setErrorMessage("Vui lòng nhập mật khẩu hiện tại");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage("Mật khẩu mới không khớp");
        return;
      }
      if (formData.newPassword.length < 8) {
        setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự");
        return;
      }
    }

    if (section === "profile") {
      if (!formData.tenTaiKhoan.trim()) {
        setErrorMessage("Vui lòng nhập tên tài khoản");
        return;
      }
      if (!formData.email.trim()) {
        setErrorMessage("Vui lòng nhập email");
        return;
      }
      if (!formData.soDienThoai.trim()) {
        setErrorMessage("Vui lòng nhập số điện thoại");
        return;
      }
      if (!formData.currentPassword) {
        setErrorMessage(
          "Vui lòng nhập mật khẩu hiện tại để cập nhật thông tin cá nhân"
        );
        return;
      }
    }

    try {
      setSaving(true);

      if (section === "notifications") {
        const notificationData = {
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          promotionalEmails: formData.promotionalEmails,
        };
        await api.updateNotifications(
          formData.maTaiKhoan,
          notificationData,
          token
        );
      } else {
        const updateData = {
          maTaiKhoan: formData.maTaiKhoan,
          tenTaiKhoan: formData.tenTaiKhoan,
          email: formData.email,
          soDienThoai: formData.soDienThoai,
          diaChi: formData.diaChi,
          ngaySinh: formData.ngaySinh,
          hinhAnh: formData.hinhAnh || null,
          maQuyen: formData.maQuyen,
          tenKhachHang: formData.tenKhachHang,
          matKhau:
            section === "password"
              ? formData.newPassword
              : formData.currentPassword,
        };

        console.log("🔄 Đang cập nhật với payload:", updateData);
        await api.updateUser(formData.maTaiKhoan, updateData, token);
      }

      console.log("✅ Cập nhật thành công");
      setIsEditing((prev) => ({
        ...prev,
        [section]: false,
      }));
      setSuccessMessage("Cập nhật thành công!");
      setErrorMessage("");

      setOriginalData({ ...formData });

      if (section === "password" || section === "profile") {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setOriginalData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      if (userId && token) {
        await fetchUserData(userId, token);
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("❌ Lỗi cập nhật:", error);
      if (
        error.response?.status === 400 &&
        error.response.data.errors?.MatKhau
      ) {
        setErrorMessage("Mật khẩu hiện tại không đúng");
      } else {
        handleApiError(error);
      }
    } finally {
      setSaving(false);
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (formData.maQuyen === "Q006" && formData.tenKhachHang) {
      return formData.tenKhachHang;
    }
    return formData.tenTaiKhoan;
  };

  // Render tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-white-50">Đang tải thông tin...</span>
        </div>
      );
    }

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
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("profile")}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-row gap-6 items-start">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white-50-200 flex-shrink-0">
                {formData.hinhAnh ? (
                  <img
                    src={formData.hinhAnh}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={DEFAULT_AVATAR}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên tài khoản
                  </label>
                  <input
                    type="text"
                    name="tenTaiKhoan"
                    value={formData.tenTaiKhoan}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {formData.maQuyen === "Q006" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      name="tenKhachHang"
                      value={formData.tenKhachHang}
                      onChange={handleInputChange}
                      disabled={!isEditing.profile}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="ngaySinh"
                    value={formData.ngaySinh}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleInputChange}
                    disabled={!isEditing.profile}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {isEditing.profile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập mật khẩu hiện tại để xác nhận"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

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
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("password")}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              )}
            </div>

            {isEditing.password ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
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
                    Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ hoa, chữ
                    thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Nhấn "Đổi mật khẩu" để thay đổi mật khẩu của bạn</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white-50-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 bg-white-400-100 text-red-800 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-3" />
            <span>{errorMessage}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Cài đặt tài khoản</h1>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-white-50-100 text-red-800 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-80 bg-white-50-50 p-6 border-r">
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white-50-50">
                    {formData.hinhAnh ? (
                      <img
                        src={formData.hinhAnh}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={DEFAULT_AVATAR}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getDisplayName()}
                    </h3>
                    {/* <p className="text-sm text-gray-600">{formData.maQuyen || "Không xác định"}</p> */}
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="h-5 w-5 mr-2" />
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
                  <Lock className="h-5 w-5 mr-2" />
                  Đổi mật khẩu
                </button>
              </nav>
            </div>

            <div className="flex-1 p-6">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
