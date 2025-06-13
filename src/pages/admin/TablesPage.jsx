import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast"; // Thêm react-hot-toast
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Save,
  X,
  Eye,
} from "lucide-react";
import {
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
} from "../../api/tableApi";

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [newTable, setNewTable] = useState({
    tenBan: "",
    viTri: "Tầng 1",
    soGhe: 4,
    ghiChu: "",
  });
  const [editingTable, setEditingTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({}); // Thêm state cho lỗi
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state cho trạng thái gửi
  const role = localStorage.getItem("role");
  const isAdmin =
    role === "Admin" ||
    role === "admin" ||
    role === "Q001" ||
    role === "Quản trị viên";
  const locations = ["Tầng 1", "Tầng 2", "Tầng 3", "Ngoài trời"];

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    filterTables();
  }, [searchTerm, selectedLocation, tables]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getAllTables();
      setTables(data);
      setFilteredTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Lỗi khi tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  const filterTables = () => {
    let filtered = tables;

    if (searchTerm) {
      filtered = filtered.filter((table) =>
        table.tenBan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((table) => table.viTri === selectedLocation);
    }

    setFilteredTables(filtered);
  };

  const openCreateModal = () => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được thêm bàn.",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    setNewTable({
      tenBan: "",
      viTri: "Tầng 1",
      soGhe: 4,
      ghiChu: "",
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (table) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được sửa bàn.",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    setEditingTable({ ...table });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (table) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được xóa bàn.",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    setCurrentTable(table);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (table) => {
    setCurrentTable(table);
    setIsViewModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable({
      ...newTable,
      [name]: name === "soGhe" ? Number.parseInt(value) || 1 : value,
    });

    // Xóa lỗi khi người dùng nhập
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate form
    const errors = {};
    if (!newTable.tenBan.trim()) {
      errors.tenBan = "Tên bàn không được để trống";
    }
    if (newTable.soGhe <= 0) {
      errors.soGhe = "Số ghế phải lớn hơn 0";
    }
    if (!locations.includes(newTable.viTri)) {
      errors.viTri = "Vị trí không hợp lệ";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        tenBan: newTable.tenBan,
        viTri: newTable.viTri,
        soGhe: newTable.soGhe,
        ghiChu: newTable.ghiChu || "",
      };

      await createTable(data);
      await fetchTables();
      setIsCreateModalOpen(false);
      setNewTable({
        tenBan: "",
        viTri: "Tầng 1",
        soGhe: 4,
        ghiChu: "",
      });
      setFormErrors({});
      toast.success(`Thêm bàn ${newTable.tenBan} thành công!`);
    } catch (error) {
      console.error("Error creating table:", error);
      let errorMessage = "Tên bàn đã bị trùng";
      if (error.response?.data?.errors) {
        // Xử lý lỗi validation từ backend
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key.toLowerCase()] = backendErrors[key][0];
        });
        setFormErrors(newErrors);
        errorMessage = Object.values(backendErrors)
          .map((err) => err[0])
          .join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = {};
    if (!editingTable.tenBan.trim()) {
      errors.tenBan = "Tên bàn không được để trống";
    }
    if (editingTable.soGhe <= 0) {
      errors.soGhe = "Số ghế phải lớn hơn 0";
    }
    if (!locations.includes(editingTable.viTri)) {
      errors.viTri = "Vị trí không hợp lệ";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        maBan: editingTable.maBan,
        tenBan: editingTable.tenBan,
        viTri: editingTable.viTri,
        soGhe: editingTable.soGhe,
        ghiChu: editingTable.ghiChu || "",
      };

      await updateTable(editingTable.maBan, data);
      await fetchTables();
      setIsEditModalOpen(false);
      setEditingTable(null);
      setFormErrors({});
      toast.success(`Cập nhật bàn ${editingTable.tenBan} thành công!`);
    } catch (error) {
      console.error("Error updating table:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật bàn";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await deleteTable(currentTable.maBan);
      await fetchTables();
      setIsDeleteModalOpen(false);
      toast.success(`Xóa bàn ${currentTable.tenBan} thành công!`);
    } catch (error) {
      console.error("Error deleting table:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa bàn";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý bàn ăn</h1>
      </div>

      {/* Search and filter */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tên bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
            >
              <option value="">Tất cả vị trí</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <button
            className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 shadow-md font-semibold"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm bàn
          </button>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTables.map((table) => (
          <div
            key={table.maBan}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-blue-100 relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-blue-700 group-hover:text-blue-900 transition-colors">
                {table.tenBan}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openViewModal(table)}
                  className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 rounded-full p-2 transition-colors"
                  title="Xem chi tiết"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEditModal(table)}
                  className="text-blue-600 hover:text-blue-900 bg-blue-50 rounded-full p-2 transition-colors"
                  title="Sửa bàn"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(table)}
                  className="text-red-600 hover:text-red-900 bg-red-50 rounded-full p-2 transition-colors"
                  title="Xóa bàn"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-base text-gray-700">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                <span>
                  Vị trí:{" "}
                  <span className="font-semibold text-gray-900">
                    {table.viTri}
                  </span>
                </span>
              </div>
              <div className="flex items-center text-base text-gray-700">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                <span>
                  Số ghế:{" "}
                  <span className="font-semibold text-gray-900">
                    {table.soGhe}
                  </span>
                </span>
              </div>
              {table.ghiChu && (
                <div className="text-sm text-gray-500 mt-2 italic">
                  <span className="font-medium">Ghi chú:</span> {table.ghiChu}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy bàn nào</p>
        </div>
      )}

      {/* Create Table Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">Thêm bàn mới</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTable}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên bàn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tenBan"
                    value={newTable.tenBan}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.tenBan ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập tên bàn"
                  />
                  {formErrors.tenBan && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.tenBan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí
                  </label>
                  <select
                    name="viTri"
                    value={newTable.viTri}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.viTri ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  {formErrors.viTri && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.viTri}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số ghế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="soGhe"
                    min="1"
                    value={newTable.soGhe}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.soGhe ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.soGhe && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.soGhe}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="ghiChu"
                    value={newTable.ghiChu}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Ghi chú (tùy chọn)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Đang xử lý..." : "Tạo bàn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {isEditModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                Chỉnh sửa bàn
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateTable}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên bàn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tenBan"
                    value={editingTable.tenBan}
                    onChange={(e) =>
                      setEditingTable({
                        ...editingTable,
                        tenBan: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.tenBan ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.tenBan && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.tenBan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí
                  </label>
                  <select
                    name="viTri"
                    value={editingTable.viTri}
                    onChange={(e) =>
                      setEditingTable({
                        ...editingTable,
                        viTri: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.viTri ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  {formErrors.viTri && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.viTri}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số ghế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="soGhe"
                    min="1"
                    value={editingTable.soGhe}
                    onChange={(e) =>
                      setEditingTable({
                        ...editingTable,
                        soGhe: Number.parseInt(e.target.value) || 1,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.soGhe ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.soGhe && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.soGhe}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="ghiChu"
                    value={editingTable.ghiChu || ""}
                    onChange={(e) =>
                      setEditingTable({
                        ...editingTable,
                        ghiChu: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Table Confirmation Modal */}
      {isDeleteModalOpen && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-red-200">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa bàn{" "}
              <span className="font-semibold">{currentTable.tenBan}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTable}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isSubmitting ? "Đang xử lý..." : "Xóa bàn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Table Modal */}
      {isViewModalOpen && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                Chi tiết bàn ăn
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-lg text-gray-800">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                <span className="font-semibold">{currentTable.viTri}</span>
              </div>
              <div className="flex items-center text-lg text-gray-800">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                <span className="font-semibold">
                  {currentTable.soGhe} người
                </span>
              </div>
              <div className="flex items-center text-lg text-gray-800">
                <span className="font-semibold">Tên bàn:</span>
                <span className="ml-2">{currentTable.tenBan}</span>
              </div>
              {currentTable.ghiChu && (
                <div className="text-base text-gray-600 italic">
                  <span className="font-medium">Ghi chú:</span>{" "}
                  {currentTable.ghiChu}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;
