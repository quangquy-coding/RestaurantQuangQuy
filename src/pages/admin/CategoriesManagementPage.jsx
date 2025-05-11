import React from "react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect,useRef } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

// Mock data for categories
const mockCategories = [
  {
    id: 1,
    name: "Món chính",
    description: "Các món ăn chính trong thực đơn",
    dishCount: 12,
    status: "Hoạt động",
    createdAt: "2023-01-10",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Món khai vị",
    description: "Các món ăn nhẹ dùng trước bữa chính",
    dishCount: 8,
    status: "Hoạt động",
    createdAt: "2023-01-15",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Món tráng miệng",
    description: "Các món ngọt dùng sau bữa ăn",
    dishCount: 6,
    status: "Hoạt động",
    createdAt: "2023-02-01",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Đồ uống",
    description: "Các loại nước uống và đồ uống có cồn",
    dishCount: 10,
    status: "Hoạt động",
    createdAt: "2023-01-20",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Món đặc biệt",
    description: "Các món đặc biệt của nhà hàng",
    dishCount: 5,
    status: "Hoạt động",
    createdAt: "2022-12-01",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Món chay",
    description: "Các món ăn chay không có thịt",
    dishCount: 7,
    status: "Không hoạt động",
    createdAt: "2023-02-10",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Món hải sản",
    description: "Các món ăn từ hải sản tươi sống",
    dishCount: 9,
    status: "Hoạt động",
    createdAt: "2022-12-15",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Món lẩu",
    description: "Các loại lẩu đặc trưng",
    dishCount: 4,
    status: "Hoạt động",
    createdAt: "2023-03-01",
    image: "/placeholder.svg?height=40&width=40",
  },
]

const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  
  
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null); // Tạo ref để tham chiếu đến input file

  const handleNewCategoryImageChange = (e) => {
    const file = e.target.files[0];  // Lấy file ảnh được chọn
    if (file) {
      setNewCategory((prev) => ({
        ...prev,
        image: URL.createObjectURL(file), // Tạo URL cho file ảnh đã chọn
      }));
    }
  }

  const handleChangeClick = () => {
    // Khi bấm nút "Chọn ảnh" hoặc "Sửa ảnh", sẽ tự động mở input file
    fileInputRef.current.click();
  };
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  })

  const categoriesPerPage = 5
  const statusOptions = ["Tất cả", "Hoạt động", "Không hoạt động"]

  // New category form state
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: "Hoạt động",
    image: null,
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    // In a real app, you would fetch categories from an API
    setCategories(mockCategories)
    setFilteredCategories(mockCategories)
  }, [])

  useEffect(() => {
    // Filter categories based on search term and status
    let filtered = categories

    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((category) => category.status === statusFilter)
    }

    // Sort categories
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

    setFilteredCategories(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categories, sortConfig])

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageCategories = getCurrentPageCategories().map((category) => category.id)
      setSelectedCategories(currentPageCategories)
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelectCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const handleDeleteSelected = () => {
    setCategories(categories.filter((category) => !selectedCategories.includes(category.id)))
    setSelectedCategories([])
  }

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCategory = () => {
    setCategories(categories.filter((category) => category.id !== categoryToDelete.id))
    setIsDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  const handleEditCategory = (category) => {
    setCategoryToEdit(category)
    setNewCategory({
      name: category.name,
      description: category.description,
      status: category.status,
      image: null,
    })
    setIsEditCategoryModalOpen(true)
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
  
    // Validate form
    const errors = {};
    if (!newCategory.name.trim()) errors.name = "Tên danh mục không được để trống";
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    if (isEditCategoryModalOpen) {
      // Cập nhật danh mục đã có
      const updatedCategories = categories.map((category) => {
        if (category.id === categoryToEdit.id) {
          return {
            ...category,
            name: newCategory.name,
            description: newCategory.description,
            status: newCategory.status,
            image: newCategory.image || category.image,  // Cập nhật ảnh mới nếu có
          };
        }
        return category;
      });
  
      setCategories(updatedCategories);
      setIsEditCategoryModalOpen(false);
    } else {
      // Thêm danh mục mới
      const newCategoryId = Math.max(...categories.map((category) => category.id)) + 1;
      const categoryToAdd = {
        id: newCategoryId,
        name: newCategory.name,
        description: newCategory.description,
        status: newCategory.status,
        dishCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        image: newCategory.image || "/placeholder.svg",  // Sử dụng ảnh đã chọn nếu có
      };
  
      setCategories([...categories, categoryToAdd]);
      setIsAddCategoryModalOpen(false);
    }
  
    // Reset form
    setNewCategory({
      name: "",
      description: "",
      status: "Hoạt động",
      image: null,
    });
    setFormErrors({});
  }
  
  
 // Hàm xử lý khi chọn ảnh
 const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho ảnh
    if (isEditCategoryModalOpen && categoryToEdit) {
      // Cập nhật ảnh trong danh mục đang chỉnh sửa
      setCategoryToEdit((prevCategory) => ({
        ...prevCategory,
        image: imageUrl,
      }));
      setNewCategory((prevCategory) => ({
        ...prevCategory,
        image: imageUrl,
      }));
    } else {
      // Cập nhật ảnh trong danh mục mới
      setNewCategory((prevCategory) => ({
        ...prevCategory,
        image: imageUrl,
      }));
    }
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCategory({
      ...newCategory,
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
  const indexOfLastCategory = currentPage * categoriesPerPage
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage

  const getCurrentPageCategories = () => {
    return filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory)
  }

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const handleExportExcel = () => {
    const exportData = categories.map((e, index) => ({
      STT: index + 1,
      "Hình ảnh" : e.image,
      "Danh mục": e.name,
      "Mô tả": e.description,
      "Số món": e.dishCount,
   
      "Trạng thái": e.status,
      "Ngày tạo": e.createdAt,
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
  
    saveAs(file, "DanhMucMonAn.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-base font-bold">Quản lý danh mục món ăn</h1>

        <button
          onClick={() => setIsAddCategoryModalOpen(true)}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả..."
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

            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500"
              onChange={handleSelectAll}
              checked={
                selectedCategories.length === getCurrentPageCategories().length && getCurrentPageCategories().length > 0
              }
            />
            <span className="ml-3 text-sm font-medium">{selectedCategories.length} danh mục đã chọn</span>
          </div>

          {selectedCategories.length > 0 && (
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
                    checked={
                      selectedCategories.length === getCurrentPageCategories().length &&
                      getCurrentPageCategories().length > 0
                    }
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
                    Danh mục
                    {sortConfig.key === "name" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("dishCount")}
                >
                  <div className="flex items-center">
                    Số món ăn
                    {sortConfig.key === "dishCount" && (
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
              {getCurrentPageCategories().map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleSelectCategory(category.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={category.image || "/placeholder.svg"} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.dishCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${category.status === "Hoạt động" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {getCurrentPageCategories().length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCategories.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{indexOfFirstCategory + 1}</span> đến{" "}
              <span className="font-medium">{Math.min(indexOfLastCategory, filteredCategories.length)}</span> trong số{" "}
              <span className="font-medium">{filteredCategories.length}</span> danh mục
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

      {/* Add/Edit Category Modal */}
      {(isAddCategoryModalOpen || isEditCategoryModalOpen) && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => {
                setIsAddCategoryModalOpen(false)
                setIsEditCategoryModalOpen(false)
              }}
            ></div>

            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {isEditCategoryModalOpen ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                </h3>
                <button
                  onClick={() => {
                    setIsAddCategoryModalOpen(false)
                    setIsEditCategoryModalOpen(false)
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newCategory.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.name ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={newCategory.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={newCategory.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Không hoạt động">Không hoạt động</option>
                    </select>
                  </div>

                  <div>
  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
    Hình ảnh
  </label>
  <div className="mt-1 flex items-center">
    <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
      {isEditCategoryModalOpen && categoryToEdit ? (
        <img
          src={newCategory.image || categoryToEdit.image || "/placeholder.svg"}
          alt="Category"
          className="h-full w-full object-cover"
        />
      ) : newCategory.image ? (
        <img
          src={newCategory.image}
          alt="Selected Category"
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          className="h-full w-full text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </span>
    <button
      type="button"
      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      onClick={handleChangeClick}
    >
      {isEditCategoryModalOpen ? "Sửa ảnh" : "Chọn ảnh"}
    </button>
    <input
      type="file"
      id="image"
      ref={fileInputRef}
      className="hidden"
      onChange={handleImageChange}
    />
  </div>
</div>

                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddCategoryModalOpen(false)
                      setIsEditCategoryModalOpen(false)
                    }}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {isEditCategoryModalOpen ? "Cập nhật" : "Thêm danh mục"}
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
                  Bạn có chắc chắn muốn xóa danh mục <span className="font-medium">{categoryToDelete?.name}</span>? Hành
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
                  onClick={confirmDeleteCategory}
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

export default CategoriesManagementPage
