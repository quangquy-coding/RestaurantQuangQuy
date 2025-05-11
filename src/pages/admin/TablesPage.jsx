import React from "react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Users, CheckCircle, XCircle, Clock,Download} from "lucide-react"

// Mock data for tables
const mockTables = [
  {
    id: 1,
    name: "Bàn 01",
    capacity: 4,
    status: "available", // available, occupied, reserved
    location: "Tầng 1",
    description: "Bàn gần cửa sổ",
  },
  {
    id: 2,
    name: "Bàn 02",
    capacity: 2,
    status: "occupied",
    location: "Tầng 1",
    description: "Bàn đôi",
  },
  {
    id: 3,
    name: "Bàn 03",
    capacity: 6,
    status: "reserved",
    location: "Tầng 1",
    description: "Bàn lớn cho gia đình",
  },
  {
    id: 4,
    name: "Bàn 04",
    capacity: 4,
    status: "available",
    location: "Tầng 1",
    description: "Bàn góc",
  },
  {
    id: 5,
    name: "Bàn 05",
    capacity: 8,
    status: "available",
    location: "Tầng 2",
    description: "Bàn VIP",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
    description: "Bàn trung tâm",
  },
]

// Mock data for locations
const locations = ["Tầng 1", "Tầng 2", "Tầng 3", "Khu vực ngoài trời"]

const TablesPage = () => {
  const [tables, setTables] = useState([])
  const [filteredTables, setFilteredTables] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentTable, setCurrentTable] = useState(null)
  const [newTable, setNewTable] = useState({
    name: "",
    capacity: 4,
    status: "available",
    location: "",
    description: "",
  })

  useEffect(() => {
    // In a real app, you would fetch tables from an API
    setTables(mockTables)
    setFilteredTables(mockTables)
  }, [])

  useEffect(() => {
    // Filter tables based on search term, location, and status
    let filtered = tables

    if (searchTerm) {
      filtered = filtered.filter(
        (table) =>
          table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedLocation) {
      filtered = filtered.filter((table) => table.location === selectedLocation)
    }

    if (selectedStatus) {
      filtered = filtered.filter((table) => table.status === selectedStatus)
    }

    setFilteredTables(filtered)
  }, [searchTerm, selectedLocation, selectedStatus, tables])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (currentTable) {
      // Editing existing table
      setCurrentTable({
        ...currentTable,
        [name]: value,
      })
    } else {
      // Adding new table
      setNewTable({
        ...newTable,
        [name]: value,
      })
    }
  }

  const handleAddTable = () => {
    // Validate required fields
    if (!newTable.name || !newTable.location) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    // Generate a new ID (in a real app, this would be handled by the backend)
    const id = Math.max(...tables.map((table) => table.id), 0) + 1

    const tableToAdd = {
      ...newTable,
      id,
      capacity: Number(newTable.capacity),
    }

    // Add the new table to the list
    const updatedTables = [...tables, tableToAdd]
    setTables(updatedTables)
    setFilteredTables(updatedTables)

    // Reset form and close modal
    setNewTable({
      name: "",
      capacity: 4,
      status: "available",
      location: "",
      description: "",
    })
    setIsAddModalOpen(false)
  }

  const handleEditTable = () => {
    // Validate required fields
    if (!currentTable.name || !currentTable.location) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    // Update the table in the list
    const updatedTables = tables.map((table) =>
      table.id === currentTable.id ? { ...currentTable, capacity: Number(currentTable.capacity) } : table,
    )

    setTables(updatedTables)
    setFilteredTables(updatedTables)

    // Reset form and close modal
    setCurrentTable(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteTable = () => {
    if (!currentTable) return

    // Remove the table from the list
    const updatedTables = tables.filter((table) => table.id !== currentTable.id)
    setTables(updatedTables)
    setFilteredTables(updatedTables)

    // Reset and close modal
    setCurrentTable(null)
    setIsDeleteModalOpen(false)
  }

  const openEditModal = (table) => {
    setCurrentTable(table)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (table) => {
    setCurrentTable(table)
    setIsDeleteModalOpen(true)
  }

   const handleExportExcel = () => {
      const exportData = tables.map((table, index) => ({
        STT: index + 1,
        "Tên bàn": table.name,
        "Vị trí": table.location,
        "Sức chứa": table.capacity + " người",
        "Trạng thái": table.status === "available" ? "Trống" : table.status === "occupied" ? "Đang sử dụng" : "Đã đặt trước",
        "Mô tả": table.description,
      
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachBan");
    
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
    
      const file = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
    
      saveAs(file, "DanhSachBan.xlsx");
    };
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Trống
          </span>
        )
      case "occupied":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Đang sử dụng
          </span>
        )
      case "reserved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Đã đặt trước
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý bàn</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
        className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Thêm bàn mới
        </button>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả vị trí</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="available">Trống</option>
              <option value="occupied">Đang sử dụng</option>
              <option value="reserved">Đã đặt trước</option>
            </select>
          </div>
                <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className={`p-4 ${
                table.status === "available"
                  ? "bg-green-50"
                  : table.status === "occupied"
                    ? "bg-red-50"
                    : "bg-yellow-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">{table.name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(table)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => openDeleteModal(table)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {getStatusBadge(table.status)}
            </div>

            <div className="p-4">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span>Sức chứa: {table.capacity} người</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">Vị trí:</span> {table.location}
              </div>
              {table.description && <div className="text-gray-500 text-sm">{table.description}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Thêm bàn mới</h2>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn *</label>
                  <input
                    type="text"
                    name="name"
                    value={newTable.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
                  <select
                    name="location"
                    value={newTable.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn vị trí</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={newTable.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    name="status"
                    value={newTable.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="available">Trống</option>
                    <option value="occupied">Đang sử dụng</option>
                    <option value="reserved">Đã đặt trước</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={newTable.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
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
              <button
                onClick={handleAddTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {isEditModalOpen && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chỉnh sửa bàn</h2>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn *</label>
                  <input
                    type="text"
                    name="name"
                    value={currentTable.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
                  <select
                    name="location"
                    value={currentTable.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn vị trí</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={currentTable.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    name="status"
                    value={currentTable.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="available">Trống</option>
                    <option value="occupied">Đang sử dụng</option>
                    <option value="reserved">Đã đặt trước</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={currentTable.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentTable(null)
                  setIsEditModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Table Modal */}
      {isDeleteModalOpen && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Xác nhận xóa</h2>
            </div>

            <div className="p-6">
              <p className="mb-4">Bạn có chắc chắn muốn xóa bàn này? Hành động này không thể hoàn tác.</p>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium">{currentTable.name}</h3>
                <p className="text-sm text-gray-500">Vị trí: {currentTable.location}</p>
                <p className="text-sm text-gray-500">Sức chứa: {currentTable.capacity} người</p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentTable(null)
                  setIsDeleteModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTable}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TablesPage
