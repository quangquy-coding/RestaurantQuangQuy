"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Save,
  X,
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
  const [currentTable, setCurrentTable] = useState(null);
  const [newTable, setNewTable] = useState({
    tenBan: "",
    viTri: "Tầng 1",
    soGhe: 4,
    ghiChu: "",
  });
  const [editingTable, setEditingTable] = useState(null);
  const [loading, setLoading] = useState(true);

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
      alert("Lỗi khi tải danh sách bàn");
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
    setNewTable({
      tenBan: "",
      viTri: "Tầng 1",
      soGhe: 4,
      ghiChu: "",
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (table) => {
    setEditingTable({ ...table });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (table) => {
    setCurrentTable(table);
    setIsDeleteModalOpen(true);
  };

  const handleCreateTable = async () => {
    try {
      if (!newTable.tenBan) {
        alert("Vui lòng nhập tên bàn");
        return;
      }

      if (newTable.soGhe <= 0) {
        alert("Số ghế phải lớn hơn 0");
        return;
      }

      await createTable(newTable);
      await fetchTables();
      setIsCreateModalOpen(false);
      alert("Tạo bàn thành công!");
    } catch (error) {
      console.error("Error creating table:", error);
      alert("Lỗi khi tạo bàn");
    }
  };

  const handleUpdateTable = async () => {
    try {
      if (!editingTable.tenBan) {
        alert("Vui lòng nhập tên bàn");
        return;
      }

      if (editingTable.soGhe <= 0) {
        alert("Số ghế phải lớn hơn 0");
        return;
      }

      await updateTable(editingTable.maBan, editingTable);
      await fetchTables();
      setIsEditModalOpen(false);
      alert("Cập nhật bàn thành công!");
    } catch (error) {
      console.error("Error updating table:", error);
      alert("Lỗi khi cập nhật bàn");
    }
  };

  const handleDeleteTable = async () => {
    try {
      await deleteTable(currentTable.maBan);
      await fetchTables();
      setIsDeleteModalOpen(false);
      alert("Xóa bàn thành công!");
    } catch (error) {
      console.error("Error deleting table:", error);
      alert("Lỗi khi xóa bàn");
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
        <h1 className="text-2xl font-bold">Quản lý bàn ăn</h1>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tên bàn..."
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

          <button
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm bàn
          </button>
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div
            key={table.maBan}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {table.tenBan}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(table)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(table)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{table.viTri}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{table.soGhe} người</span>
              </div>
              {table.ghiChu && (
                <div className="text-sm text-gray-500 mt-2">
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Thêm bàn mới</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên bàn
                </label>
                <input
                  type="text"
                  value={newTable.tenBan}
                  onChange={(e) =>
                    setNewTable({ ...newTable, tenBan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên bàn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí
                </label>
                <select
                  value={newTable.viTri}
                  onChange={(e) =>
                    setNewTable({ ...newTable, viTri: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ghế
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTable.soGhe}
                  onChange={(e) =>
                    setNewTable({
                      ...newTable,
                      soGhe: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={newTable.ghiChu}
                  onChange={(e) =>
                    setNewTable({ ...newTable, ghiChu: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ghi chú (tùy chọn)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTable}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Tạo bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {isEditModalOpen && editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chỉnh sửa bàn</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên bàn
                </label>
                <input
                  type="text"
                  value={editingTable.tenBan}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, tenBan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí
                </label>
                <select
                  value={editingTable.viTri}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, viTri: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ghế
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingTable.soGhe}
                  onChange={(e) =>
                    setEditingTable({
                      ...editingTable,
                      soGhe: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={editingTable.ghiChu || ""}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, ghiChu: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Table Confirmation Modal */}
      {isDeleteModalOpen && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
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
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesPage;
