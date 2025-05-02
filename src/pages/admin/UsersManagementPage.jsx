import React from "react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { useState, useEffect } from "react"
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    role: "Khách hàng",
    status: "Hoạt động",
    orders: 12,
    lastOrder: "2023-04-15",
    createdAt: "2023-01-10",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0912345678",
    role: "Khách hàng",
    status: "Hoạt động",
    orders: 8,
    lastOrder: "2023-04-02",
    createdAt: "2023-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone: "0923456789",
    role: "Nhân viên",
    status: "Hoạt động",
    orders: 0,
    lastOrder: null,
    createdAt: "2023-02-01",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "0934567890",
    role: "Khách hàng",
    status: "Bị chặn",
    orders: 3,
    lastOrder: "2023-02-28",
    createdAt: "2023-01-20",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "0945678901",
    role: "Quản trị viên",
    status: "Hoạt động",
    orders: 0,
    lastOrder: null,
    createdAt: "2022-12-01",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Ngô Thị F",
    email: "ngothif@example.com",
    phone: "0956789012",
    role: "Khách hàng",
    status: "Hoạt động",
    orders: 5,
    lastOrder: "2023-03-20",
    createdAt: "2023-02-10",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Đỗ Văn G",
    email: "dovang@example.com",
    phone: "0967890123",
    role: "Khách hàng",
    status: "Không hoạt động",
    orders: 1,
    lastOrder: "2023-01-05",
    createdAt: "2022-12-15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Vũ Thị H",
    email: "vuthih@example.com",
    phone: "0978901234",
    role: "Nhân viên",
    status: "Hoạt động",
    orders: 0,
    lastOrder: null,
    createdAt: "2023-03-01",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 9,
    name: "Đặng Văn I",
    email: "dangvani@example.com",
    phone: "0989012345",
    role: "Khách hàng",
    status: "Hoạt động",
    orders: 7,
    lastOrder: "2023-04-10",
    createdAt: "2023-01-05",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 10,
    name: "Bùi Thị K",
    email: "buithik@example.com",
    phone: "0990123456",
    role: "Khách hàng",
    status: "Hoạt động",
    orders: 4,
    lastOrder: "2023-03-15",
    createdAt: "2023-02-20",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const UsersManagementPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleUpdateUser = (e) => {
    e.preventDefault();
  
    const validateForm = (formData) => {
      const { name, email, phone, role, password } = formData;
      if (!name || !email || !role || !phone) {
        return { isValid: false, message: 'Vui lòng điền đầy đủ thông tin.' };
      }
  
      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Email không hợp lệ.' };
      }
  
      // Kiểm tra mật khẩu nếu có thay đổi và có yêu cầu cho mật khẩu mới
      if ((role === 'Nhân viên' || role === 'Quản trị viên') && password && password.length < 6) {
        return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
      }
  
      return { isValid: true };
    };
  
    // Xác thực form
    const validation = validateForm(editingUser);
    if (!validation.isValid) {
      setFormErrors({ message: validation.message });
      return;
    }
  
    // Cập nhật thông tin người dùng (bao gồm mật khẩu nếu có)
    if (editingUser.role === 'Nhân viên' || editingUser.role === 'Quản trị viên') {
      // Chỉ cập nhật mật khẩu nếu có thay đổi
      if (editingUser.password) {
        // Xử lý thay đổi mật khẩu (ví dụ: gọi API cập nhật mật khẩu)
        console.log('Đổi mật khẩu mới: ', editingUser.password);
      }
    }
  
    // Cập nhật người dùng trong danh sách
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, ...editingUser } : u))
    );
  
    // Đóng modal và reset trạng thái
    setIsEditUserModalOpen(false);
    setEditingUser(null);
    setFormErrors({});
  };
  
  // Hàm thay đổi giá trị trong form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };
  
  // Mở modal để chỉnh sửa người dùng
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditUserModalOpen(true);
  };
  

  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  })

  const usersPerPage = 5
  const statusOptions = ["Tất cả vai trò", "Hoạt động", "Không hoạt động", "Bị chặn"]
  const roleOptions = ["Tất cả trạng thái", "Khách hàng", "Nhân viên", "Quản trị viên"]

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Khách hàng",
    status: "Hoạt động",
    password: "",
    confirmPassword: "",
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    // In a real app, you would fetch users from an API
    setUsers(mockUsers)
    setFilteredUsers(mockUsers)
  }, [])

  useEffect(() => {
    // Filter users based on search term, status, and role
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm),
      )
    }

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    if (roleFilter !== "Tất cả") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Sort users
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, roleFilter, users, sortConfig])

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageUsers = getCurrentPageUsers().map((user) => user.id)
      setSelectedUsers(currentPageUsers)
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleDeleteSelected = () => {
    setUsers(users.filter((user) => !selectedUsers.includes(user.id)))
    setSelectedUsers([])
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== userToDelete.id))
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const handleAddUser = (e) => {
    e.preventDefault()

    // Validate form
    const errors = {}
    if (!newUser.name.trim()) errors.name = "Tên không được để trống"
    if (!newUser.email.trim()) {
      errors.email = "Email không được để trống"
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Email không hợp lệ"
    }
    if (!newUser.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống"
    } else if (!/^\d{10}$/.test(newUser.phone)) {
      errors.phone = "Số điện thoại phải có 10 chữ số"
    }
    if (!newUser.password) {
      errors.password = "Mật khẩu không được để trống"
    } else if (newUser.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }
    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Add new user
    const newUserId = Math.max(...users.map((user) => user.id)) + 1
    const userToAdd = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      orders: 0,
      lastOrder: null,
      createdAt: new Date().toISOString().split("T")[0],
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setUsers([...users, userToAdd])
    setIsAddUserModalOpen(false)
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "Khách hàng",
      status: "Hoạt động",
      password: "",
      confirmPassword: "",
    })
    setFormErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser({
      ...newUser,
      [name]: value,
    })

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage

  const getCurrentPageUsers = () => {
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  const handleExportExcel = () => {
    const exportData = users.map((user, index) => ({
      STT: index + 1,
      "Họ và tên": user.name,
      Email: user.email,
      "Số điện thoại": user.phone,
      "Vai trò": user.role,
      "Trạng thái": user.status,
      "Đơn hàng": user.orders,
      "Ngày tạo": user.createdAt,
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sl font-bold">Quản lý người dùng</h1>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
       className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
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
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </button>
          </div>
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
            />
            <span className="ml-3 text-sm font-medium">{selectedUsers.length} người dùng đã chọn</span>
          </div>

          {selectedUsers.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-1" />
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
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    ID
                    {sortConfig.key === "id" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Người dùng
                    {sortConfig.key === "name" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center">
                    Vai trò
                    {sortConfig.key === "role" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {sortConfig.key === "status" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("orders")}
                >
                  <div className="flex items-center">
                    Đơn hàng
                    {sortConfig.key === "orders" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Ngày tạo
                    {sortConfig.key === "createdAt" && (
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
              {getCurrentPageUsers().map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={user.avatar || "/placeholder.svg"} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === "Quản trị viên"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "Nhân viên"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.status === "Hoạt động"
                          ? "bg-green-100 text-green-800"
                          : user.status === "Không hoạt động"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">

                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900">
  <Edit className="h-4 w-4" />
</button>
                      <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {getCurrentPageUsers().length === 0 && (
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
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current page
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsis = index > 0 && array[index - 1] !== page - 1

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 py-2 text-gray-500">...</span>}
                      <button
                        onClick={() => paginate(page)}
                        className={`relative inline-flex items-center px-4 py-2 rounded-md border ${
                          currentPage === page
                            ? "bg-blue-50 text-blue-600 border-blue-500"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  )
                })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
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

            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Thêm người dùng mới</h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.name ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={newUser.phone}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.phone ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Vai trò
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Khách hàng">Khách hàng</option>
                      <option value="Nhân viên">Nhân viên</option>
                      <option value="Quản trị viên">Quản trị viên</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={newUser.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Không hoạt động">Không hoạt động</option>
                      <option value="Bị chặn">Bị chặn</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.password ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={newUser.confirmPassword}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Thêm người dùng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
  
{isEditUserModalOpen && editingUser && (
  <div className="fixed inset-0 z-10 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsEditUserModalOpen(false)}></div>
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Chỉnh sửa người dùng</h3>
          <button onClick={() => setIsEditUserModalOpen(false)} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleUpdateUser}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
              <input
                type="text"
                name="name"
                value={editingUser.name}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={editingUser.email}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={editingUser.phone}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Vai trò</label>
              <select
                name="role"
                value={editingUser.role}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Khách hàng">Khách hàng</option>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản trị viên">Quản trị viên</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                name="status"
                value={editingUser.status}
                onChange={handleEditInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
                <option value="Bị chặn">Bị chặn</option>
              </select>
            </div>

            {/* Chỉ hiển thị trường mật khẩu nếu vai trò là "Nhân viên" hoặc "Quản trị viên" */}
            {(editingUser.role === 'Nhân viên' || editingUser.role === 'Quản trị viên') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                  type="password"
                  name="password"
                  value={editingUser.password || ''}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
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
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa người dùng <span className="font-medium">{userToDelete?.name}</span>? Hành
                  động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagementPage
