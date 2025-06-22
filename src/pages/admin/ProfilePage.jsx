import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  AlertCircle,
  Edit3,
  X,
  Check,
  Loader2,
} from "lucide-react";
import axios from "axios";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState({
    profile: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    maTaiKhoan: "",
    tenTaiKhoan: "",
    email: "",
    soDienThoai: "",
    diaChi: "",
    ngayDangKy: "",
    ngaySinh: "",
    hinhAnh: null,
    maQuyen: "",
    tenQuyen: "",
    maKhachHang: "",
    tenKhachHang: "",
    maNhanVien: "",
    hoTenNhanVien: "",
    chucVu: "",
    luong: null,
    ngayTuyenDung: "",
    soCccd: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [originalData, setOriginalData] = useState({ ...formData });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // API Configuration
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;
  const USER_API_URL = `${API_BASE_URL}/NguoiDungManager`;
  const DEFAULT_AVATAR = "/placeholder.svg?height=200&width=200";

  // API Functions with Retry Logic
  const api = {
    getUserById: async (userId, token, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await axios.get(`${USER_API_URL}/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    },
    updateUser: async (userId, data, token) => {
      return await axios.put(`${USER_API_URL}/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  };

  // Initialize user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("usersId");
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
      const response = await api.getUserById(uid, token);
      const userData = response.data;
      const mappedData = {
        maTaiKhoan: userData.maTaiKhoan || "",
        tenTaiKhoan: userData.tenTaiKhoan || "",
        email: userData.email || "",
        soDienThoai: userData.soDienThoai || "",
        diaChi: userData.diaChi || "",
        ngayDangKy: userData.ngayDangKy
          ? userData.ngayDangKy.split("T")[0]
          : "",
        ngaySinh: userData.ngaySinh ? userData.ngaySinh.split("T")[0] : "",
        hinhAnh: userData.hinhAnh || null,
        maQuyen: userData.maQuyen || "",
        tenQuyen: userData.tenQuyen || "",
        maKhachHang: userData.maKhachHang || "",
        tenKhachHang: userData.tenKhachHang || "",
        maNhanVien: userData.maNhanVien || "",
        hoTenNhanVien: userData.hoTenNhanVien || "",
        chucVu: userData.chucVu || "",
        luong: userData.luong || null,
        ngayTuyenDung: userData.ngayTuyenDung
          ? userData.ngayTuyenDung.split("T")[0]
          : "",
        soCccd: userData.soCccd || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      setFormData(mappedData);
      setOriginalData(mappedData);
    } catch (err) {
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
        setErrorMessage("Không tìm thấy thông tin người dùng.");
      } else if (status === 401) {
        setErrorMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        localStorage.removeItem("usersId");
      } else if (status === 400 && errorData.errors) {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");
        setErrorMessage(`Lỗi: ${errorMessages}`);
      } else {
        setErrorMessage(errorData.message || "Lỗi server không xác định.");
      }
    } else {
      setErrorMessage(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server."
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Start editing
  const handleEdit = (section) => {
    setIsEditing((prev) => ({ ...prev, [section]: true }));
    setOriginalData({ ...formData });
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Cancel editing
  const handleCancel = (section) => {
    setFormData({ ...originalData });
    setIsEditing((prev) => ({ ...prev, [section]: false }));
    setErrorMessage("");
  };

  // Save changes
  const handleSave = async (section) => {
    if (saving) return;
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
      if (formData.maQuyen !== "Q006" && !formData.soCccd.trim()) {
        setErrorMessage("Vui lòng nhập số CCCD");
        return;
      }
      if (formData.maQuyen === "Q003" && !formData.hoTenNhanVien.trim()) {
        setErrorMessage("Vui lòng nhập họ tên nhân viên");
        return;
      }
      if (!formData.currentPassword) {
        setErrorMessage("Vui lòng nhập mật khẩu hiện tại để xác nhận");
        return;
      }
    }

    try {
      setSaving(true);
      const updateData = {
        maTaiKhoan: formData.maTaiKhoan,
        tenTaiKhoan: formData.tenTaiKhoan,
        email: formData.email,
        soDienThoai: formData.soDienThoai,
        diaChi: formData.diaChi,
        ngayDangKy: formData.ngayDangKy,
        ngaySinh: formData.ngaySinh,
        hinhAnh: formData.hinhAnh || null,
        maQuyen: formData.maQuyen,
        tenKhachHang:
          formData.maQuyen === "Q006" ? formData.tenKhachHang : null,
        hoTenNhanVien:
          formData.maQuyen === "Q003" ? formData.hoTenNhanVien : null,
        chucVu: formData.maQuyen === "Q003" ? formData.chucVu : null,
        luong: formData.maQuyen === "Q003" ? formData.luong : null,
        ngayTuyenDung:
          formData.maQuyen === "Q003" ? formData.ngayTuyenDung : null,
        soCccd: formData.maQuyen !== "Q006" ? formData.soCccd : null,
        matKhau:
          section === "password"
            ? formData.newPassword
            : formData.currentPassword,
      };
      await api.updateUser(formData.maTaiKhoan, updateData, token);
      setIsEditing((prev) => ({ ...prev, [section]: false }));
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

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
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
    if (formData.maQuyen === "Q006")
      return formData.tenKhachHang || formData.tenTaiKhoan;
    return formData.hoTenNhanVien || formData.tenTaiKhoan || "Quản lý";
  };

  // Render tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <span className="ml-3 text-lg font-medium text-gray-600">
            Đang tải...
          </span>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Thông tin cá nhân
              </h2>
              {!isEditing.profile ? (
                <button
                  onClick={() => handleEdit("profile")}
                  className="flex items-center px-2 py-1 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-100 shadow-md hover:shadow-lg"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCancel("profile")}
                    className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
                    disabled={saving}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("profile")}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5 mr-2" />
                    )}
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-200 shadow-lg ring-4 ring-indigo-100 transition-all duration-300 hover:ring-indigo-200">
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
                      className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-base font-medium cursor-pointer hover:bg-opacity-70 transition-all duration-300"
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
                <div className="text-center">
                  <p className="font-bold text-gray-800 text-xl">
                    {getDisplayName()}
                  </p>
                  <p className="text-sm font-medium text-indigo-600">
                    {formData.tenQuyen}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã tài khoản
                    </label>
                    <input
                      type="text"
                      name="maTaiKhoan"
                      value={formData.maTaiKhoan}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên tài khoản
                    </label>
                    <input
                      type="text"
                      name="tenTaiKhoan"
                      value={formData.tenTaiKhoan}
                      onChange={handleInputChange}
                      disabled={!isEditing.profile}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing.profile}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleInputChange}
                      disabled={!isEditing.profile}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày đăng ký
                    </label>
                    <input
                      type="date"
                      name="ngayDangKy"
                      value={formData.ngayDangKy}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      disabled={!isEditing.profile}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      name="diaChi"
                      value={formData.diaChi}
                      onChange={handleInputChange}
                      disabled={!isEditing.profile}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <input
                      type="text"
                      name="tenQuyen"
                      value={formData.tenQuyen}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 shadow-sm"
                    />
                  </div>
                </div>
                {formData.maQuyen === "Q006" && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      Thông tin khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mã khách hàng
                        </label>
                        <input
                          type="text"
                          name="maKhachHang"
                          value={formData.maKhachHang}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tên khách hàng
                        </label>
                        <input
                          type="text"
                          name="tenKhachHang"
                          value={formData.tenKhachHang}
                          onChange={handleInputChange}
                          disabled={!isEditing.profile}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {(formData.maQuyen === "Q003" ||
                  formData.maQuyen === "Q001") && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      {formData.maQuyen === "Q003"
                        ? "Thông tin nhân viên"
                        : "Thông tin quản lý"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.maQuyen === "Q003" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mã nhân viên
                            </label>
                            <input
                              type="text"
                              name="maNhanVien"
                              value={formData.maNhanVien}
                              disabled
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Họ tên nhân viên
                            </label>
                            <input
                              type="text"
                              name="hoTenNhanVien"
                              value={formData.hoTenNhanVien}
                              onChange={handleInputChange}
                              disabled={!isEditing.profile}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Chức vụ
                            </label>
                            <input
                              type="text"
                              name="chucVu"
                              disabled
                              value={formData.chucVu}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Lương
                            </label>
                            <input
                              type="number"
                              name="luong"
                              value={formData.luong || ""}
                              onChange={handleInputChange}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ngày tuyển dụng
                            </label>
                            <input
                              type="date"
                              name="ngayTuyenDung"
                              value={formData.ngayTuyenDung}
                              onChange={handleInputChange}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số CCCD
                        </label>
                        <input
                          type="text"
                          name="soCccd"
                          value={formData.soCccd}
                          onChange={handleInputChange}
                          disabled={!isEditing.profile}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {isEditing.profile && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      Xác nhận
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "password":
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Đổi mật khẩu</h2>
              {!isEditing.password ? (
                <button
                  onClick={() => handleEdit("password")}
                  className="flex items-center px-2 py-1 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-md"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Đổi mật khẩu
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCancel("password")}
                    className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
                    disabled={saving}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSave("password")}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5 mr-2" />
                    )}
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              )}
            </div>
            {isEditing.password ? (
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl shadow-sm">
                  <p className="text-sm font-medium text-indigo-800">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                    thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 font-medium">
                Nhấn "Đổi mật khẩu" để thay đổi mật khẩu của bạn.
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-2xl flex items-center shadow-lg animate-fade-in">
            <AlertCircle className="h-6 w-6 mr-4" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Hồ sơ cá nhân</h1>

        {successMessage && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 text-green-800 rounded-2xl flex items-center shadow-lg animate-fade-in">
            <svg
              className="h-6 w-6 mr-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-2xl flex items-center shadow-lg animate-fade-in">
            <AlertCircle className="h-6 w-6 mr-4" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-72 bg-gradient-to-b from-gray-50 to-gray-100 p-8 border-r border-gray-200">
              <div className="mb-10 flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shadow-lg ring-4 ring-indigo-100 transition-all duration-300 hover:ring-indigo-200">
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
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 text-xl tracking-tight">
                    {getDisplayName()}
                  </h3>
                  <p className="text-sm font-medium text-indigo-600">
                    {formData.tenQuyen}
                  </p>
                </div>
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center w-full px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                    activeTab === "profile"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <User className="h-6 w-6 mr-3" />
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex items-center w-full px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                    activeTab === "password"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <Lock className="h-6 w-6 mr-3" />
                  Đổi mật khẩu
                </button>
              </nav>
            </div>
            <div className="flex-1 p-10">{renderTabContent()}</div>
          </div>
        </div>
      </div>
      {/* <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style> */}
    </div>
  );
};

export default ProfilePage;
