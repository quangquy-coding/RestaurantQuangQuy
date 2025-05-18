import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {getUsers, getUserById, addUser, updateUser, deleteUser, searchUsers } from "../../api/userApi";

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [sortConfig, setSortConfig] = useState({
    key: "maTaiKhoan",
    direction: "asc",
  });

  const usersPerPage = 5;
  const statusOptions = ["Tất cả", "Hoạt động", "Không hoạt động", "Bị chặn"];
  const roleOptions = ["Tất cả", "Khách hàng", "Nhân viên", "Quản trị viên"];

  // New user form state
  const [newUser, setNewUser] = useState({
    tenTaiKhoan: "",
    matKhau: "",
    xacThucMatKhau: "",
    email: "",
    soDienThoai: "",
    diaChi: "",
    ngayDangKy: new Date().toISOString().split("T")[0],
    ngaySinh: "",
    maQuyen: "",
    tenQuyen: "Khách hàng",
    hinhAnh: "",
    tenKhachHang: "",
    hoTenNhanVien: "",
    chucVu: "",
    luong: "",
    ngayTuyenDung: "",
    soCccd: "",
    preview: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();
      const usersData = response.data;
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUserDetail = async (userId) => {
    try {
      setIsLoading(true);
      const response = await getUserById(userId);
      setUserDetail(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!newUser.tenTaiKhoan?.trim()) errors.tenTaiKhoan = "Tên tài khoản không được để trống";
    if (!newUser.email?.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!newUser.soDienThoai?.trim()) {
      errors.soDienThoai = "Số điện thoại không được để trống";
    } else if (!/^\d{10}$/.test(newUser.soDienThoai)) {
      errors.soDienThoai = "Số điện thoại phải có 10 chữ số";
    }
    if (!newUser.matKhau) {
      errors.matKhau = "Mật khẩu không được để trống";
    } else if (newUser.matKhau.length < 6) {
      errors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (newUser.matKhau !== newUser.xacThucMatKhau) {
      errors.xacThucMatKhau = "Mật khẩu xác nhận không khớp";
    }
    if (!newUser.maQuyen) {
      errors.maQuyen = "Vai trò là bắt buộc";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare user data for API
    const userData = {
      tenTaiKhoan: newUser.tenTaiKhoan,
      matKhau: newUser.matKhau,
      email: newUser.email,
      soDienThoai: newUser.soDienThoai,
      diaChi: newUser.diaChi || "",
      ngayDangKy: newUser.ngayDangKy,
      ngaySinh: newUser.ngaySinh || null,
      maQuyen: newUser.maQuyen,
      hinhAnh: newUser.hinhAnh || null,
    };

    // Add role-specific info
    if (newUser.maQuyen === "Q006") {
      // Khách hàng
      userData.tenKhachHang = newUser.tenKhachHang || newUser.tenTaiKhoan;
    } else if (newUser.maQuyen === "Q003" || newUser.maQuyen === "Q001") {
      // Nhân viên hoặc Quản trị viên
      userData.hoTenNhanVien = newUser.hoTenNhanVien || newUser.tenTaiKhoan;
      userData.chucVu = newUser.chucVu || "Nhân viên";
      userData.luong = newUser.luong || 0;
      userData.ngayTuyenDung = newUser.ngayTuyenDung || new Date().toISOString().split("T")[0];
      userData.soCccd = newUser.soCccd || "";
    }

    try {
      setIsLoading(true);
      await addUser(userData);
      await fetchUsers();
      setIsAddUserModalOpen(false);
      resetNewUserForm();
      alert("Thêm người dùng thành công!");
      // setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error adding user:", error);
      setFormErrors({ api: "Có lỗi khi thêm người dùng: " + (error.response?.data || "Lỗi không xác định") });
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewUserForm = () => {
    setNewUser({
      tenTaiKhoan: "",
      matKhau: "",
      xacThucMatKhau: "",
      email: "",
      soDienThoai: "",
      diaChi: "",
      ngayDangKy: new Date().toISOString().split("T")[0],
      ngaySinh: "",
      maQuyen: "",
      tenQuyen: "Khách hàng",
      hinhAnh: "",
      tenKhachHang: "",
      hoTenNhanVien: "",
      chucVu: "",
      luong: "",
      ngayTuyenDung: "",
      soCccd: "",
      preview: null,
    });
    setFormErrors({});
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!editingUser.tenTaiKhoan?.trim()) errors.tenTaiKhoan = "Tên tài khoản không được để trống";
    if (!editingUser.email?.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(editingUser.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!editingUser.soDienThoai?.trim()) {
      errors.soDienThoai = "Số điện thoại không được để trống";
    }

    // Validate password only if it's provided (for changes)
    if (editingUser.matKhau && editingUser.matKhau.length < 6) {
      errors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare user data for API
    const userData = {
      maTaiKhoan: editingUser.maTaiKhoan,
      tenTaiKhoan: editingUser.tenTaiKhoan,
      email: editingUser.email,
      soDienThoai: editingUser.soDienThoai,
      diaChi: editingUser.diaChi || "",
      ngaySinh: editingUser.ngaySinh || null,
      maQuyen: editingUser.maQuyen,
      hinhAnh: editingUser.hinhAnh || null,
    };

    // Add password only if it's changed
    if (editingUser.matKhau) {
      userData.matKhau = editingUser.matKhau;
    }

    // Add role-specific info
    if (editingUser.maQuyen === "Q006") {
      // Khách hàng
      userData.tenKhachHang = editingUser.tenKhachHang || editingUser.tenTaiKhoan;
      userData.maKhachHang = editingUser.maKhachHang || "";
    } else if (editingUser.maQuyen === "Q003" || editingUser.maQuyen === "Q001") {
      // Nhân viên hoặc Quản trị viên
      userData.hoTenNhanVien = editingUser.hoTenNhanVien || editingUser.tenTaiKhoan;
      userData.maNhanVien = editingUser.maNhanVien || "";
      userData.chucVu = editingUser.chucVu || "Nhân viên";
      userData.luong = editingUser.luong || 0;
      userData.ngayTuyenDung = editingUser.ngayTuyenDung || null;
      userData.soCccd = editingUser.soCccd || "";
    }

    try {
      setIsLoading(true);
      await updateUser(editingUser.maTaiKhoan, userData);
      await fetchUsers();
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      alert("Cập nhật người dùng thành công!");
      //  setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error updating user:", error);
      setFormErrors({ api: "Có lỗi khi cập nhật người dùng: " + (error.response?.data || "Lỗi không xác định") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !userToDelete.maTaiKhoan) return;

    try {
      setIsLoading(true);
      await deleteUser(userToDelete.maTaiKhoan);
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedUsers.length) return;

    try {
      setIsLoading(true);
      // Delete multiple users in sequence
      for (const userId of selectedUsers) {
        await deleteUser(userId);
      }
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error deleting selected users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setIsEditUserModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchUsers(searchTerm);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByRole = async (role) => {
    if (role === "Tất cả") {
      fetchUsers();
      return;
    }

    // Map role names to role codes
    let maQuyen = "";
    if (role === "Khách hàng") maQuyen = "Q006";
    else if (role === "Nhân viên") maQuyen = "Q003";
    else if (role === "Quản trị viên") maQuyen = "Q001";

    try {
      setIsLoading(true);
      const response = await filterUsersByRole(maQuyen);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error filtering users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter users based on search term, status, and role
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.tenTaiKhoan && user.tenTaiKhoan.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.tenKhachHang && user.tenKhachHang.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.hoTenNhanVien && user.hoTenNhanVien.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.soDienThoai && user.soDienThoai.includes(searchTerm))
      );
    }

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((user) => user.trangThai === statusFilter);
    }

    if (roleFilter !== "Tất cả") {
      filtered = filtered.filter((user) => user.tenQuyen === roleFilter);
    }

    // Sort users
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;

        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, users, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageUsers = getCurrentPageUsers().map((user) => user.maTaiKhoan);
      setSelectedUsers(currentPageUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const getCurrentPageUsers = () => {
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleExportExcel = () => {
    const exportData = users.map((user, index) => ({
      STT: index + 1,
      "Mã tài khoản": user.maTaiKhoan,
      "Tên tài khoản": user.tenTaiKhoan,
      "Họ và tên": user.tenKhachHang || user.hoTenNhanVien || "",
      Email: user.email,
      "Số điện thoại": user.soDienThoai,
      "Vai trò": user.tenQuyen,
      "Trạng thái": user.trangThai || "Hoạt động",
      "Ngày đăng ký": user.ngayDangKy,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNguoiDung");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "DanhSachNguoiDung.xlsx");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý người dùng</h1>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          
          </div>

          {/* <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  handleFilterByRole(e.target.value);
                }}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>

            <button
              className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              onClick={handleExportExcel}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Xuất Excel
            </button>
          </div> */}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500"
              onChange={handleSelectAll}
              checked={selectedUsers.length === getCurrentPageUsers().length && getCurrentPageUsers().length > 0}
              disabled={isLoading}
            />
            <span className="ml-3 text-sm font-medium">{selectedUsers.length} người dùng đã chọn</span>
          </div>

          {selectedUsers.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa đã chọn
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === getCurrentPageUsers().length && getCurrentPageUsers().length > 0}
                    disabled={isLoading}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("maTaiKhoan")}
                >
                  <div className="flex items-center">
                    Mã tài khoản
                    {sortConfig.key === "maTaiKhoan" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("tenTaiKhoan")}
                >
                  <div className="flex items-center">
                    Người dùng
                    {sortConfig.key === "tenTaiKhoan" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("tenQuyen")}
                >
                  <div className="flex items-center">
                    Vai trò
                    {sortConfig.key === "tenQuyen" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("chucVu")}
                >
                  <div className="flex items-center">
                    Chức vụ
                    {sortConfig.key === "chucVu" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("ngayDangKy")}
                >
                  <div className="flex items-center">
                    Ngày tạo
                    {sortConfig.key === "ngayDangKy" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                getCurrentPageUsers().map((user) => (
                  <tr key={user.maTaiKhoan} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.includes(user.maTaiKhoan)}
                        onChange={() => handleSelectUser(user.maTaiKhoan)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.maTaiKhoan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <div className="flex items-center"> */}
                        {/* <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.hinhAnh || "/placeholder.svg?height=40&width=40"}
                            alt=""
                          />
                        </div> */}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.tenKhachHang || user.hoTenNhanVien || user.tenTaiKhoan}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.soDienThoai}</div>
                          {user.soCccd && <div className="text-sm text-gray-500">{user.soCccd}</div>}
                        {/* </div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.tenQuyen === "Admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.tenQuyen === "Nhân viên"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                      >
                        {user.tenQuyen}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.chucVu || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.ngayDangKy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewUserDetail(user.maTaiKhoan)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Xem chi tiết"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && getCurrentPageUsers().length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{indexOfFirstUser + 1}</span> đến{" "}
              <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> trong số{" "}
              <span className="font-medium">{filteredUsers.length}</span> người dùng
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === 1 || isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current page
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsis = index > 0 && array[index - 1] !== page - 1;

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 py-2 text-gray-500">...</span>}
                      <button
                        onClick={() => paginate(page)}
                        disabled={isLoading}
                        className={`relative inline-flex items-center px-4 py-2 rounded-md border ${
                          currentPage === page
                            ? "bg-blue-50 text-blue-600 border-blue-500"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === totalPages || isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsAddUserModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 z-20 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Thêm người dùng mới</h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vai trò */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="maQuyen"
                      value={newUser.maQuyen}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.maQuyen ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">-- Chọn vai trò --</option>
                      <option value="Q006">Khách hàng</option>
                      <option value="Q003">Nhân viên</option>
                      <option value="Q001">Quản trị viên</option>
                    </select>
                    {formErrors.maQuyen && <p className="mt-1 text-sm text-red-600">{formErrors.maQuyen}</p>}
                  </div>

                  {/* Tên tài khoản */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tenTaiKhoan"
                      value={newUser.tenTaiKhoan}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.tenTaiKhoan ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.tenTaiKhoan && <p className="mt-1 text-sm text-red-600">{formErrors.tenTaiKhoan}</p>}
                  </div>

                  {/* Mật khẩu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="matKhau"
                      value={newUser.matKhau}
                      onChange={handleInputChange}
                      autoComplete="new-password"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.matKhau ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.matKhau && <p className="mt-1 text-sm text-red-600">{formErrors.matKhau}</p>}
                  </div>

                  {/* Xác thực mật khẩu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Xác thực mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="xacThucMatKhau"
                      value={newUser.xacThucMatKhau}
                      onChange={handleInputChange}
                      autoComplete="new-password"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.xacThucMatKhau ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.xacThucMatKhau && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.xacThucMatKhau}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="soDienThoai"
                      value={newUser.soDienThoai}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.soDienThoai ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.soDienThoai && <p className="mt-1 text-sm text-red-600">{formErrors.soDienThoai}</p>}
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input
                      type="text"
                      name="diaChi"
                      value={newUser.diaChi}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input
                      type="date"
                      name="ngaySinh"
                      value={newUser.ngaySinh}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Trường riêng cho từng vai trò */}
                  {newUser.maQuyen === "Q006" && (
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                      <input
                        type="text"
                        name="tenKhachHang"
                        value={newUser.tenKhachHang}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {(newUser.maQuyen === "Q003" || newUser.maQuyen === "Q001") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Họ tên nhân viên</label>
                        <input
                          type="text"
                          name="hoTenNhanVien"
                          value={newUser.hoTenNhanVien}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
                        <input
                          type="text"
                          name="chucVu"
                          value={newUser.chucVu}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lương</label>
                        <input
                          type="number"
                          name="luong"
                          value={newUser.luong}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày tuyển dụng</label>
                        <input
                          type="date"
                          name="ngayTuyenDung"
                          value={newUser.ngayTuyenDung}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số CCCD</label>
                        <input
                          type="text"
                          name="soCccd"
                          value={newUser.soCccd}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
                {formErrors.api && <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md">{formErrors.api}</div>}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    Thêm người dùng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsEditUserModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-20 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Chỉnh sửa người dùng</h3>
                <button onClick={() => setIsEditUserModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên tài khoản */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tenTaiKhoan"
                      value={editingUser.tenTaiKhoan || ""}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.tenTaiKhoan ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.tenTaiKhoan && <p className="mt-1 text-sm text-red-600">{formErrors.tenTaiKhoan}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editingUser.email || ""}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="soDienThoai"
                      value={editingUser.soDienThoai || ""}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.soDienThoai ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.soDienThoai && <p className="mt-1 text-sm text-red-600">{formErrors.soDienThoai}</p>}
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input
                      type="text"
                      name="diaChi"
                      value={editingUser.diaChi || ""}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input
                      type="date"
                      name="ngaySinh"
                      value={editingUser.ngaySinh || ""}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mật khẩu mới (tùy chọn) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mật khẩu mới (để trống nếu không đổi)
                    </label>
                    <input
                      type="password"
                      name="matKhau"
                      value={editingUser.matKhau || ""}
                      onChange={handleEditInputChange}
                      autoComplete="new-password"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.matKhau ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.matKhau && <p className="mt-1 text-sm text-red-600">{formErrors.matKhau}</p>}
                  </div>

                  {/* Trường riêng cho từng vai trò */}
                  {editingUser.maQuyen === "Q006" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                      <input
                        type="text"
                        name="tenKhachHang"
                        value={editingUser.tenKhachHang || ""}
                        onChange={handleEditInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {(editingUser.maQuyen === "Q003" || editingUser.maQuyen === "Q001") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Họ tên nhân viên</label>
                        <input
                          type="text"
                          name="hoTenNhanVien"
                          value={editingUser.hoTenNhanVien || ""}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
                        <input
                          type="text"
                          name="chucVu"
                          value={editingUser.chucVu || ""}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lương</label>
                        <input
                          type="number"
                          name="luong"
                          value={editingUser.luong || ""}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày tuyển dụng</label>
                        <input
                          type="date"
                          name="ngayTuyenDung"
                          value={editingUser.ngayTuyenDung || ""}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số CCCD</label>
                        <input
                          type="text"
                          name="soCccd"
                          value={editingUser.soCccd || ""}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
                {formErrors.api && <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md">{formErrors.api}</div>}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditUserModalOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsDeleteModalOpen(false)}></div>

            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Xác nhận xóa</h3>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa người dùng{" "}
                  <span className="font-medium">
                    {userToDelete?.tenTaiKhoan || userToDelete?.tenKhachHang || userToDelete?.hoTenNhanVien}
                  </span>
                  ? Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {isDetailModalOpen && userDetail && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsDetailModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-20 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium">Thông tin chi tiết người dùng</h3>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and basic info */}
                <div className="flex flex-col items-center">
                  {/* <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <img
                      src={userDetail.hinhAnh || "/placeholder.svg?height=128&width=128"}
                      alt={userDetail.tenTaiKhoan}
                      className="w-full h-full object-cover"
                    />
                  </div> */}
                  <h4 className="text-lg font-medium text-center">
                    {userDetail.tenKhachHang || userDetail.hoTenNhanVien || userDetail.tenTaiKhoan}
                  </h4>
                  <span
                    className={`px-3 py-1 mt-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  userDetail.tenQuyen === "Admin"
                    ? "bg-purple-100 text-purple-800"
                    : userDetail.tenQuyen === "Nhân viên"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
                  >
                    {userDetail.tenQuyen}
                  </span>
                </div>

                {/* User details */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Thông tin tài khoản</h5>
                      <div className="mt-2 space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Mã tài khoản:</span>
                          <p className="font-medium">{userDetail.maTaiKhoan}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Tên tài khoản:</span>
                          <p className="font-medium">{userDetail.tenTaiKhoan}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email:</span>
                          <p className="font-medium">{userDetail.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Số điện thoại:</span>
                          <p className="font-medium">{userDetail.soDienThoai}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Ngày đăng ký:</span>
                          <p className="font-medium">{formatDate(userDetail.ngayDangKy)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Ngày sinh:</span>
                          <p className="font-medium">{formatDate(userDetail.ngaySinh)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Địa chỉ:</span>
                          <p className="font-medium">{userDetail.diaChi || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Role-specific information */}
                    {userDetail.tenQuyen === "Khách hàng" && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Thông tin khách hàng</h5>
                        <div className="mt-2 space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">Mã khách hàng:</span>
                            <p className="font-medium">{userDetail.maKhachHang || "-"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Tên khách hàng:</span>
                            <p className="font-medium">{userDetail.tenKhachHang || "-"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(userDetail.tenQuyen === "Nhân viên" || userDetail.tenQuyen === "Admin") && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Thông tin nhân viên</h5>
                        <div className="mt-2 space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">Mã nhân viên:</span>
                            <p className="font-medium">{userDetail.maNhanVien || "-"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Họ tên nhân viên:</span>
                            <p className="font-medium">{userDetail.hoTenNhanVien || "-"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Chức vụ:</span>
                            <p className="font-medium">{userDetail.chucVu || "-"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Lương:</span>
                            <p className="font-medium">
                              {userDetail.luong
                                ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                    userDetail.luong
                                  )
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Ngày tuyển dụng:</span>
                            <p className="font-medium">{formatDate(userDetail.ngayTuyenDung)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Số CCCD:</span>
                            <p className="font-medium">{userDetail.soCccd || "-"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;