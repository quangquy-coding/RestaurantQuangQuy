import React from "react"
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Users, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import axios from "axios";

// API URL
const API_URL = "http://localhost:5080/api/BanAnManager";

// Danh sách vị trí hợp lệ theo API controller
const locations = ["Tầng 1", "Tầng 2", "Tầng 3", "Ngoài trời"];

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [newTable, setNewTable] = useState({
    tenBan: "",
    soGhe: 4,
    trangThai: "Trống",
    viTri: "",
    ghiChu: "",
  })

  // Xử lý lỗi từ API và chuyển đổi thành chuỗi
  const handleApiError = (err) => {
    console.error("API Error:", err);
    console.log(err.response.data);
    
    // Kiểm tra các trường hợp lỗi khác nhau và trả về thông báo phù hợp
    if (err.response) {
      // Lỗi từ server với response
      if (typeof err.response.data === 'string') {
        return err.response.data;
      } else if (err.response.data && typeof err.response.data === 'object') {
        // Nếu response.data là object, thử lấy thông báo lỗi từ các trường phổ biến
        if (err.response.data.message) {
          return err.response.data.message;
        } else if (err.response.data.title) {
          return err.response.data.title;
        } else if (err.response.data.errors) {
          // Nếu có nhiều lỗi, kết hợp chúng
          if (typeof err.response.data.errors === 'object') {
            return Object.values(err.response.data.errors)
              .flat()
              .join(', ');
          }
          return String(err.response.data.errors);
        }
        // Nếu không tìm thấy thông báo lỗi cụ thể, chuyển đổi object thành chuỗi JSON
        return JSON.stringify(err.response.data);
      }
      // Trả về mã trạng thái HTTP nếu không có thông tin khác
      return `Lỗi ${err.response.status}: ${err.response.statusText}`;
    } else if (err.request) {
      // Yêu cầu được gửi nhưng không nhận được phản hồi
      return "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.";
    }
    
    // Lỗi khác
    return err.message || "Đã xảy ra lỗi không xác định";
  };

  // Fetch tables from API
  const fetchTables = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(API_URL);
      
      // Map API response to match our UI format
      const formattedTables = response.data.map(table => ({
        id: table.maBan,
        name: table.tenBan,
        capacity: table.soGhe,
        status: mapStatusFromApi(table.trangThai),
        location: table.viTri,
        description: table.ghiChu || "",
      }));
      
      setTables(formattedTables);
      setFilteredTables(formattedTables);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setTables([]);
      setFilteredTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Map status from API format to UI format
  const mapStatusFromApi = (apiStatus) => {
    switch (apiStatus) {
      case "Trống":
        return "available";
      case "Đã đặt":
        return "reserved";
      case "Đang sử dụng":
        return "occupied";
      default:
        return "available";
    }
  };

  // Map status from UI format to API format
  const mapStatusToApi = (uiStatus) => {
    switch (uiStatus) {
      case "available":
        return "Trống";
      case "reserved":
        return "Đã đặt";
      case "occupied":
        return "Đang sử dụng";
      default:
        return "Trống";
    }
  };

  // Search tables using API
  const searchTables = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("tenBan", searchTerm);
      if (selectedLocation) params.append("viTri", selectedLocation);
      if (selectedStatus) params.append("trangThai", mapStatusToApi(selectedStatus));

      const response = await axios.get(`${API_URL}/search?${params.toString()}`);
      
      // Map API response to match our UI format
      const formattedTables = response.data.map(table => ({
        id: table.maBan,
        name: table.tenBan,
        capacity: table.soGhe,
        status: mapStatusFromApi(table.trangThai),
        location: table.viTri,
        description: table.ghiChu || "",
      }));
      
      setFilteredTables(formattedTables);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // If no results found, show empty list
      setFilteredTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    // Local filtering for immediate feedback
    if (!searchTerm && !selectedLocation && !selectedStatus) {
      setFilteredTables(tables);
      return;
    }
    
    // If we have search criteria, use the API search instead
    searchTables();
  }, [searchTerm, selectedLocation, selectedStatus]);

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

  const handleAddTable = async () => {
    // Validate required fields
    if (!newTable.tenBan || !newTable.viTri) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Prepare data for API
      const tableToAdd = {
        maBan: "BAN" + Date.now(),
        tenBan: newTable.tenBan.trim(),
        viTri: newTable.viTri,
        soGhe: parseInt(newTable.soGhe),
        trangThai: newTable.trangThai || "Trống",
        ghiChu: newTable.ghiChu || ""
      };

      // Call API to add table
      await axios.post(API_URL, tableToAdd);
      
      // Refresh table list
      await fetchTables();
      
      // Reset form and close modal
      setNewTable({
        tenBan: "",
        soGhe: 4,
        trangThai: "Trống",
        viTri: "",
        ghiChu: "",
      });
      setIsAddModalOpen(false);
      toast.success("Thêm "+newTable.tenBan+" thành công!");
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditTable = async () => {
    // Validate required fields
    if (!currentTable.name || !currentTable.location) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Prepare data for API
      const tableToUpdate = {
        maBan: currentTable.id,
        tenBan: currentTable.name.trim(),
        viTri: currentTable.location,
        soGhe: parseInt(currentTable.capacity),
        trangThai: mapStatusToApi(currentTable.status),
        ghiChu: currentTable.description || ""
      };

      // Call API to update table
      await axios.put(`${API_URL}/${currentTable.id}`, tableToUpdate);
      
      // Refresh table list
      await fetchTables();
      
      // Reset form and close modal
      setCurrentTable(null);
      setIsEditModalOpen(false);
      toast.success("Cập nhật "+currentTable.name+" thành công!");
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteTable = async () => {
    if (!currentTable) return;

    setIsLoading(true);
    setError("");
    try {
      // Call API to delete table
      await axios.delete(`${API_URL}/${currentTable.id}`);
      
      // Refresh table list
      await fetchTables();
      
      // Reset and close modal
      setCurrentTable(null);
      setIsDeleteModalOpen(false);
      toast.success("Xóa "+currentTable.name+" thành công!");
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
        >
          <Plus className="mr-2 h-5 w-5" />
          Thêm bàn mới
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Lỗi!</strong> {error}
        </div>
      )}

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
          <button 
            className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" 
            onClick={handleExportExcel}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      )}

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
                  <button 
                    onClick={() => openEditModal(table)} 
                    className="text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(table)} 
                    className="text-red-600 hover:text-red-800"
                    disabled={isLoading}
                  >
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

      {/* No tables message */}
      {!isLoading && filteredTables.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Không tìm thấy bàn ăn nào</p>
        </div>
      )}

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
                    name="tenBan"
                    value={newTable.tenBan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí *</label>
                  <select
                    name="viTri"
                    value={newTable.viTri}
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
                    name="soGhe"
                    value={newTable.soGhe}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    name="trangThai"
                    value={newTable.trangThai}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Trống">Trống</option>
                    <option value="Đang sử dụng">Đang sử dụng</option>
                    <option value="Đã đặt">Đã đặt trước</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="ghiChu"
                    value={newTable.ghiChu}
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
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleAddTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
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
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã bàn</label>
                  <input
                    type="text"
                    value={currentTable.id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div> */}
                
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
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleEditTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
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
                <p className="text-sm text-gray-500">Mã bàn: {currentTable.id}</p>
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
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTable}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
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