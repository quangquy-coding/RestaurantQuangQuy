import React from "react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { toast } from "react-hot-toast";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../api/categoryApi"
import { useState, useEffect, useRef } from "react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  // Thêm state để theo dõi trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(false)

  // Refs
  const addFileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  // State cho form thêm mới
  const [newCategory, setNewCategory] = useState({
    tenDanhMuc: "",
    moTa: "",
    trangThai: "Hoạt động",
    hinhAnh: "",
  })

  // State cho form chỉnh sửa
  const [editedCategory, setEditedCategory] = useState({
    tenDanhMuc: "",
    moTa: "",
    trangThai: "Hoạt động",
    hinhAnh: "",
  })

  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  })

  const categoriesPerPage = 5
  const statusOptions = ["Tất cả", "Hoạt động", "Không hoạt động"]

  // Thêm state cho modal xem ảnh
  const [isImageViewModalOpen, setIsImageViewModalOpen] = useState(false)
  const [imageToView, setImageToView] = useState(null)

  // Cập nhật hàm fetchCategories để sử dụng state isLoading
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await getAllCategories()
        setCategories(response.data)
        setFilteredCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Cập nhật form chỉnh sửa khi categoryToEdit thay đổi
  useEffect(() => {
    if (categoryToEdit) {
      setEditedCategory({
        tenDanhMuc: categoryToEdit.tenDanhMuc || categoryToEdit.name || "",
        moTa: categoryToEdit.moTa || categoryToEdit.description || "",
        trangThai: categoryToEdit.trangThai || categoryToEdit.status || "Hoạt động",
        hinhAnh: categoryToEdit.hinhAnh || categoryToEdit.image || null,
      })
    }
  }, [categoryToEdit])

  useEffect(() => {
    // Filter categories based on search term and status
    let filtered = categories

    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.tenDanhMuc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.moTa?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((category) => category.status === statusFilter || category.trangThai === statusFilter)
    }

    // Sort categories
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || ""
        const bValue = b[sortConfig.key] || ""

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
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
      const currentPageCategories = getCurrentPageCategories().map((category) => category.id || category.maDanhMuc)
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
    setCategories(categories.filter((category) => !selectedCategories.includes(category.id || category.maDanhMuc)))
    setSelectedCategories([])
  }

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCategory = async () => {
    try {
      await deleteCategory(categoryToDelete.maDanhMuc)
      setCategories(categories.filter((category) => category.maDanhMuc !== categoryToDelete.maDanhMuc))
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
      toast.success("Xóa danh mục "+categoryToDelete.tenDanhMuc+" thành công!")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Lỗi khi xóa danh mục. Vui lòng thử lại sau.")
    }
  }

  const handleEditCategory = (category) => {
    setCategoryToEdit(category)
    setIsEditCategoryModalOpen(true)
  }

  // Xử lý thêm danh mục mới
  const handleAddCategoryClick = () => {
    // Reset form
    setNewCategory({
      tenDanhMuc: "",
      moTa: "",
      trangThai: "Hoạt động",
      hinhAnh: "",
    })
    setFormErrors({})
    setIsAddCategoryModalOpen(true)
  }

  // Xử lý đóng modal thêm mới
  const handleCloseAddModal = () => {
    setIsAddCategoryModalOpen(false)
    setNewCategory({
      tenDanhMuc: "",
      moTa: "",
      trangThai: "Hoạt động",
      hinhAnh: "",
    })
    setFormErrors({})
  }

  // Xử lý đóng modal chỉnh sửa
  const handleCloseEditModal = () => {
    setIsEditCategoryModalOpen(false)
    setCategoryToEdit(null)
    setEditedCategory({
      tenDanhMuc: "",
      moTa: "",
      trangThai: "Hoạt động",
      hinhAnh: "",
    })
    setFormErrors({})
  }

  // Xử lý thay đổi input cho form thêm mới
  const handleAddInputChange = (e) => {
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

  // Xử lý thay đổi input cho form chỉnh sửa
  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditedCategory({
      ...editedCategory,
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

  // Xử lý chọn ảnh cho form thêm mới
  const handleAddImageClick = () => {
    addFileInputRef.current.click()
  }

  // Xử lý chọn ảnh cho form chỉnh sửa
  const handleEditImageClick = () => {
    editFileInputRef.current.click()
  }

  // Thêm hàm xử lý xem ảnh
 const handleViewImage = (imageUrl) => {
  setImageToView(imageUrl || "/placeholder.svg");
  setIsImageViewModalOpen(true);
};

  // Xử lý thay đổi ảnh cho form thêm mới
 const handleAddImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "demo_preset"); // Thay bằng preset của bạn

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dlozjvjhf/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Cloudinary upload result:", data);
      setNewCategory((prev) => ({
        ...prev,
        hinhAnh: data.secure_url, // Lưu URL Cloudinary
        imageFile: null, // Không cần gửi file lên backend nữa
      }));
    } catch (err) {
      toast.error("Lỗi upload ảnh Cloudinary");
    }
  }
};

  // Xử lý thay đổi ảnh cho form chỉnh sửa
const handleEditImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "demo_preset");


    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dlozjvjhf/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Cloudinary upload result:", data);
      setEditedCategory((prev) => ({
        ...prev,
        hinhAnh: data.secure_url,
        imageFile: null,
      }));
    } catch (err) {
      toast.error("Lỗi upload ảnh Cloudinary");
    }
  }
};

  // Tối ưu hóa việc tải lại dữ liệu sau khi thêm/sửa/xóa
  // Cập nhật hàm handleAddCategory
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    // Validate form
    const errors = {}
    if (typeof newCategory.tenDanhMuc !== "string" || !newCategory.tenDanhMuc.trim()) {
      errors.tenDanhMuc = "Tên danh mục không được để trống"
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Xử lý upload ảnh nếu có file ảnh mới
      const imageUrl = newCategory.hinhAnh
      if (newCategory.imageFile) {
        // Trong thực tế, bạn sẽ upload ảnh lên server hoặc dịch vụ lưu trữ ảnh
        // Ở đây chúng ta giả định đã upload thành công và nhận được URL
        // imageUrl = await uploadImage(newCategory.imageFile);

        // Giả lập upload ảnh thành công
        console.log("Đang upload ảnh...")
        // Giữ nguyên URL tạm thời cho demo
      }

      const data = {
        maDanhMuc: "",
        tenDanhMuc: newCategory.tenDanhMuc,
        moTa: newCategory.moTa,
        hinhAnh: newCategory.hinhAnh,
        trangThai: newCategory.trangThai,
      }

      await createCategory(data)
      const response = await getAllCategories()
      setCategories(response.data)
      setFilteredCategories(response.data)
      setIsAddCategoryModalOpen(false)
      setNewCategory({
        tenDanhMuc: "",
        moTa: "",
        trangThai: "Hoạt động",
        hinhAnh: null,
      })
      setFormErrors({})
      toast.success("Thêm danh mục "+newCategory.tenDanhMuc+" thành công!")
    } catch (err) {
      toast.error("Lỗi khi thêm danh mục. Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau.")
      console.error("Error creating category:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cập nhật hàm handleUpdateCategory
  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    // Validate form
    const errors = {}
    if (typeof editedCategory.tenDanhMuc !== "string" || !editedCategory.tenDanhMuc.trim()) {
      errors.tenDanhMuc = "Tên danh mục không được để trống"
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Xử lý upload ảnh nếu có file ảnh mới
      const imageUrl = editedCategory.hinhAnh
      if (editedCategory.imageFile) {
        // Trong thực tế, bạn sẽ upload ảnh lên server hoặc dịch vụ lưu trữ ảnh
        // Ở đây chúng ta giả định đã upload thành công và nhận được URL
        // imageUrl = await uploadImage(editedCategory.imageFile);

        // Giả lập upload ảnh thành công
        console.log("Đang upload ảnh...")
        // Giữ nguyên URL tạm thời cho demo
      }

      const id = categoryToEdit?.maDanhMuc || categoryToEdit?.id
      const data = {
        maDanhMuc: id,
        tenDanhMuc: editedCategory.tenDanhMuc,
        moTa: editedCategory.moTa,
        hinhAnh: editedCategory.hinhAnh,
        trangThai: editedCategory.trangThai,
      }

      await updateCategory(id, data)
      const response = await getAllCategories()
      setCategories(response.data)
      setFilteredCategories(response.data)
      setIsEditCategoryModalOpen(false)
      setCategoryToEdit(null)
      setEditedCategory({
        tenDanhMuc: "",
        moTa: "",
        trangThai: "Hoạt động",
        hinhAnh: null,
      })
      setFormErrors({})
      toast.success("Cập nhật danh mục "+editedCategory.tenDanhMuc+" thành công!")
    } catch (err) {
      toast.error("Lỗi khi cập nhật danh mục. Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau.")
      console.error("Error updating category:", err)
    } finally {
      setIsSubmitting(false)
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
      "Hình ảnh": e.image || e.hinhAnh,
      "Danh mục": e.name || e.tenDanhMuc,
      "Mô tả": e.description || e.moTa,
      "Số món": e.dishCount || e.soLuongMonAn,
      "Trạng thái": e.status || e.trangThai,
      // "Ngày tạo": e.createdAt || "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNguoiDung")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    })

    saveAs(file, "DanhMucMonAn.xlsx")
  }

  // Render component
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-base font-bold">Quản lý danh mục món ăn</h1>

        <button
          onClick={handleAddCategoryClick}
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

            <button
              className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              onClick={handleExportExcel}
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && (
          <div className="p-4 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}
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
                    Mã danh mục
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
                    Tên danh mục
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
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageCategories().map((category) => (
                <tr key={category.maDanhMuc || category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedCategories.includes(category.maDanhMuc || category.id)}
                      onChange={() => handleSelectCategory(category.maDanhMuc || category.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.maDanhMuc || category.id}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 cursor-pointer" onClick={() => handleViewImage(category.hinhAnh || "/placeholder.svg")}>
                      <img
  className="h-10 w-10 rounded-full object-cover hover:opacity-80 transition-opacity"
  src={category.hinhAnh || "/placeholder.svg"}
  alt={category.tenDanhMuc || category.name}
/>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{category.tenDanhMuc || category.name}</div>
                        <div className="text-sm text-gray-500">{category.moTa || category.description}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.soLuongMonAn || category.dishCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${(category.trangThai || category.status) === "Hoạt động" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {category.trangThai || category.status}
                    </span>
                  </td>
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

              {getCurrentPageCategories().length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              )}

             {isLoading && (
  Array.from({ length: 3 }).map((_, index) => (
    <tr key={`skeleton-${index}`} className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="ml-4">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-8 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  ))
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

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={handleCloseAddModal}></div>

            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Thêm danh mục mới</h3>
                <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="add-name"
                      name="tenDanhMuc"
                      value={newCategory.tenDanhMuc || ""}
                      onChange={handleAddInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.tenDanhMuc ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.tenDanhMuc && <p className="mt-1 text-sm text-red-600">{formErrors.tenDanhMuc}</p>}
                  </div>

                  <div>
                    <label htmlFor="add-description" className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <textarea
                      id="add-description"
                      name="moTa"
                      rows="3"
                      value={newCategory.moTa || ""}
                      onChange={handleAddInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="add-status" className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      id="add-status"
                      name="trangThai"
                      value={newCategory.trangThai || ""}
                      onChange={handleAddInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Không hoạt động">Không hoạt động</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="add-image" className="block text-sm font-medium text-gray-700">
                      Hình ảnh
                    </label>
                    <div className="mt-1 flex flex-col items-start">
                      {newCategory.hinhAnh ? (
                        <div className="mb-3 relative group">
                          <img
                            src={newCategory.hinhAnh || "/placeholder.svg"}
                            alt="Selected Category"
                            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                            onClick={() => handleViewImage(newCategory.hinhAnh)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-lg">
                            <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Xem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 h-32 w-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                          <svg className="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleAddImageClick}
                      >
                        {newCategory.hinhAnh ? "Thay đổi ảnh" : "Chọn ảnh"}
                      </button>
                      <input
                        type="file"
                        id="add-image"
                        ref={addFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAddImageChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Thêm danh mục"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={handleCloseEditModal}></div>

            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Chỉnh sửa danh mục</h3>
                <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="tenDanhMuc"
                      value={editedCategory.tenDanhMuc || ""}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.tenDanhMuc ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.tenDanhMuc && <p className="mt-1 text-sm text-red-600">{formErrors.tenDanhMuc}</p>}
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <textarea
                      id="edit-description"
                      name="moTa"
                      rows="3"
                      value={editedCategory.moTa || ""}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      id="edit-status"
                      name="trangThai"
                      value={editedCategory.trangThai || ""}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Không hoạt động">Không hoạt động</option>
                    </select>
                  </div>

               
                  <div>
                    <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700">
                      Hình ảnh
                    </label>
                    <div className="mt-1 flex flex-col items-start">
                      {editedCategory.hinhAnh ? (
                        <div className="mb-3 relative group">
                          <img
                            src={editedCategory.hinhAnh || "/placeholder.svg"}
                            alt="Category"
                            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                            onClick={() => handleViewImage(editedCategory.hinhAnh)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-lg">
                            <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Xem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 h-32 w-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                          <svg className="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleEditImageClick}
                      >
                        {editedCategory.hinhAnh ? "Thay đổi ảnh" : "Chọn ảnh"}
                      </button>
                      <input
                        type="file"
                        id="edit-image"
                        ref={editFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleEditImageChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
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
                  Bạn có chắc chắn muốn xóa danh mục{" "}
                  <span className="font-medium">{categoryToDelete?.tenDanhMuc || categoryToDelete?.name}</span>? Hành
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
      {/* Image View Modal */}
      {isImageViewModalOpen && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-75" onClick={() => setIsImageViewModalOpen(false)}></div>

            <div className="relative z-30 max-w-3xl w-full">
              <div className="relative">
                <button
                  onClick={() => setIsImageViewModalOpen(false)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-gray-800" />
                </button>
                <img
                  src={imageToView || "/placeholder.svg"}
                  alt="Xem chi tiết"
                  className="max-h-[80vh] w-auto mx-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesManagementPage;
