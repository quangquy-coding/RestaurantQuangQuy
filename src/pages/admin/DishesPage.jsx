import React from "react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, Upload,Download } from "lucide-react"

// Mock data for dishes
const mockDishes = [
  {
    id: 1,
    name: "Phở bò tái",
    category: "Món chính",
    price: 85000,
    description: "Phở bò truyền thống với thịt bò tái",
    ingredients: "Bánh phở, thịt bò, hành, gừng, gia vị",
    image: "/placeholder.svg?height=80&width=80",
    isAvailable: true,
    isSpecial: false,
    isNew: false,
  },
  {
    id: 2,
    name: "Gỏi cuốn tôm thịt",
    category: "Món khai vị",
    price: 65000,
    description: "Gỏi cuốn tươi với tôm và thịt heo",
    ingredients: "Bánh tráng, tôm, thịt heo, rau sống, bún",
    image: "/placeholder.svg?height=80&width=80",
    isAvailable: true,
    isSpecial: false,
    isNew: true,
  },
  {
    id: 3,
    name: "Cơm rang hải sản",
    category: "Món chính",
    price: 95000,
    description: "Cơm rang với các loại hải sản tươi ngon",
    ingredients: "Gạo, tôm, mực, cua, rau củ, gia vị",
    image: "/placeholder.svg?height=80&width=80",
    isAvailable: true,
    isSpecial: true,
    isNew: false,
  },
  {
    id: 4,
    name: "Chè khúc bạch",
    category: "Món tráng miệng",
    price: 45000,
    description: "Chè khúc bạch mát lạnh",
    ingredients: "Sữa, gelatin, đường, trái cây",
    image: "/placeholder.svg?height=80&width=80",
    isAvailable: false,
    isSpecial: false,
    isNew: false,
  },
  {
    id: 5,
    name: "Trà đào cam sả",
    category: "Đồ uống",
    price: 35000,
    description: "Trà đào thơm mát với cam và sả",
    ingredients: "Trà, đào, cam, sả, đường",
    image: "/placeholder.svg?height=80&width=80",
    isAvailable: true,
    isSpecial: false,
    isNew: true,
  },
]

// Mock data for categories
const categories = ["Món chính", "Món khai vị", "Món tráng miệng", "Đồ uống", "Món đặc biệt"]

const DishesPage = () => {
  const [dishes, setDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentDish, setCurrentDish] = useState(null)
  const [newDish, setNewDish] = useState({
    name: "",
    category: "",
    price: 0,
    description: "",
    ingredients: "",
    image: "/placeholder.svg?height=80&width=80",
    isAvailable: true,
    isSpecial: false,
    isNew: false,
  })

  useEffect(() => {
    // In a real app, you would fetch dishes from an API
    setDishes(mockDishes)
    setFilteredDishes(mockDishes)
  }, [])

  useEffect(() => {
    // Filter dishes based on search term and category
    let filtered = dishes

    if (searchTerm) {
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((dish) => dish.category === selectedCategory)
    }

    setFilteredDishes(filtered)
  }, [searchTerm, selectedCategory, dishes])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (currentDish) {
      // Editing existing dish
      setCurrentDish({
        ...currentDish,
        [name]: type === "checkbox" ? checked : value,
      })
    } else {
      // Adding new dish
      setNewDish({
        ...newDish,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  const handleAddDish = () => {
    // Validate required fields
    if (!newDish.name || !newDish.category || newDish.price <= 0) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    // Generate a new ID (in a real app, this would be handled by the backend)
    const id = Math.max(...dishes.map((dish) => dish.id), 0) + 1

    const dishToAdd = {
      ...newDish,
      id,
      price: Number(newDish.price),
    }

    // Add the new dish to the list
    const updatedDishes = [...dishes, dishToAdd]
    setDishes(updatedDishes)
    setFilteredDishes(updatedDishes)

    // Reset form and close modal
    setNewDish({
      name: "",
      category: "",
      price: 0,
      description: "",
      ingredients: "",
      image: "/placeholder.svg?height=80&width=80",
      isAvailable: true,
      isSpecial: false,
      isNew: false,
    })
    setIsAddModalOpen(false)
  }

  const handleEditDish = () => {
    // Validate required fields
    if (!currentDish.name || !currentDish.category || currentDish.price <= 0) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    // Update the dish in the list
    const updatedDishes = dishes.map((dish) =>
      dish.id === currentDish.id ? { ...currentDish, price: Number(currentDish.price) } : dish,
    )

    setDishes(updatedDishes)
    setFilteredDishes(updatedDishes)

    // Reset form and close modal
    setCurrentDish(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteDish = () => {
    if (!currentDish) return

    // Remove the dish from the list
    const updatedDishes = dishes.filter((dish) => dish.id !== currentDish.id)
    setDishes(updatedDishes)
    setFilteredDishes(updatedDishes)

    // Reset and close modal
    setCurrentDish(null)
    setIsDeleteModalOpen(false)
  }

  const openViewModal = (dish) => {
    setCurrentDish(dish)
    setIsViewModalOpen(true)
  }

  const openEditModal = (dish) => {
    setCurrentDish(dish)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (dish) => {
    setCurrentDish(dish)
    setIsDeleteModalOpen(true)
  }

    const handleExportExcel = () => {
      const exportData = dishes.map((e, index) => ({
        STT: index + 1,
        "Hình ảnh" : e.image,

        "Tên món ăn": e.name,
        
        "Mô tả": e.description,
        "Danh mục": e.name,
        
        "Giá": e.price.toLocaleString("vi-VN") + " ₫",
        "Trạng thái": [
        e.isAvailable ? "Còn hàng" : "Hết hàng",
        e.isNew ? " Mới" : null,
        e.isSpecial ? "Đặc biệt" : null
        ]
        .filter(Boolean) // loại bỏ null
        .join(" - ") 
       
       
       
     
   
     
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachMonAn");
    
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
    
      const file = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
    
      saveAs(file, "DanhSachMonAn.xlsx");
    };
    const handleNewDishImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewDish((prev) => ({
            ...prev,
            image: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    const handleEditDishImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentDish((prev) => ({
            ...prev,
            image: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    
    

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý món ăn</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Thêm món ăn
        </button>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>


            
          </div>
          
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={handleExportExcel}>
          <Download className="w-4 h-4 mr-2" />
          Xuất Excel
          </button>
          </div>
      </div>

      {/* Dishes table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Món ăn
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Danh mục
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Giá
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
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
              {filteredDishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src={dish.image || "/placeholder.svg"}
                          alt={dish.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{dish.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dish.price.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {dish.isAvailable ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Còn hàng
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Hết hàng
                        </span>
                      )}
                      {dish.isSpecial && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Đặc biệt
                        </span>
                      )}
                      {dish.isNew && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Mới
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openViewModal(dish)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => openEditModal(dish)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => openDeleteModal(dish)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Thêm món ăn mới</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn *</label>
                  <input
                    type="text"
                    name="name"
                    value={newDish.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    name="category"
                    value={newDish.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    name="price"
                    value={newDish.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                  <label className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
  Chọn ảnh
                  <div className="flex items-center">
                  <input
  type="file"
  accept="image/*"
  onChange={handleNewDishImageUpload}
  className="hidden"
/>

                    
                    
                  </div>
                  </label>
                  {newDish.image && (
  <img
    src={newDish.image}
    alt="Preview"
    className="w-24 h-24 mt-2 object-cover rounded-md"
  />
)}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={newDish.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <textarea
                    name="ingredients"
                    value={newDish.ingredients}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={newDish.isAvailable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                        Còn hàng
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isSpecial"
                        name="isSpecial"
                        checked={newDish.isSpecial}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isSpecial" className="ml-2 text-sm text-gray-700">
                        Món đặc biệt
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNew"
                        name="isNew"
                        checked={newDish.isNew}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isNew" className="ml-2 text-sm text-gray-700">
                        Món mới
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button onClick={handleAddDish} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Thêm món ăn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {isEditModalOpen && currentDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chỉnh sửa món ăn</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn *</label>
                  <input
                    type="text"
                    name="name"
                    value={currentDish.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    name="category"
                    value={currentDish.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    name="price"
                    value={currentDish.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                  <div className="flex items-center">
                  <label className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Sửa ảnh
                  <input
  type="file"
  accept="image/*"
  onChange={handleEditDishImageUpload}
  className="hidden"
/>

</label>
                  </div>
                  {currentDish?.image && (
  <img
    src={currentDish.image}
    alt="Preview"
    className="w-24 h-24 mt-2 object-cover rounded-md"
  />
)}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={currentDish.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <textarea
                    name="ingredients"
                    value={currentDish.ingredients}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isAvailable"
                        name="isAvailable"
                        checked={currentDish.isAvailable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isAvailable" className="ml-2 text-sm text-gray-700">
                        Còn hàng
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isSpecial"
                        name="isSpecial"
                        checked={currentDish.isSpecial}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isSpecial" className="ml-2 text-sm text-gray-700">
                        Món đặc biệt
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isNew"
                        name="isNew"
                        checked={currentDish.isNew}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isNew" className="ml-2 text-sm text-gray-700">
                        Món mới
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentDish(null)
                  setIsEditModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditDish}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Dish Modal */}
      {isViewModalOpen && currentDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chi tiết món ăn</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={currentDish.image || "/placeholder.svg"}
                    alt={currentDish.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold mb-2">{currentDish.name}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="font-medium">{currentDish.category}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Giá</p>
                      <p className="font-medium">{currentDish.price.toLocaleString("vi-VN")} ₫</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Mô tả</p>
                    <p>{currentDish.description}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Thành phần</p>
                    <p>{currentDish.ingredients}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentDish.isAvailable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Hết hàng
                      </span>
                    )}

                    {currentDish.isSpecial && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Món đặc biệt
                      </span>
                    )}

                    {currentDish.isNew && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Món mới
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setCurrentDish(null)
                  setIsViewModalOpen(false)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dish Modal */}
      {isDeleteModalOpen && currentDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Xác nhận xóa</h2>
            </div>

            <div className="p-6">
              <p className="mb-4">Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác.</p>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  <img
                    src={currentDish.image || "/placeholder.svg"}
                    alt={currentDish.name}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{currentDish.name}</h3>
                    <p className="text-sm text-gray-500">{currentDish.category}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentDish(null)
                  setIsDeleteModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteDish}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa món ăn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DishesPage
