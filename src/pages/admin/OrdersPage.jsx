"use client";
import React from "react";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  User,
  CreditCard,
  Printer,
  Download,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  getAllOrders,
  getAvailableTables,
  getMenuItems,
  updateOrderStatus,
  assignTableToOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderFoodStatus,
} from "../../api/orderApi";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [newOrder, setNewOrder] = useState({
    bookingCode: "",
    customerName: "",
    tableIds: [],
    tableNumber: "",
    status: "pending",
    paymentMethod: "cash",
    items: [],
    total: 0,
    orderDate: new Date().toISOString(),
    guestCount: 2,
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [selectedMenuItemQuantity, setSelectedMenuItemQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, selectedStatus, selectedDateRange, orders]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData] = await Promise.all([getAllOrders()]);

      setOrders(ordersData);
      setFilteredOrders(ordersData);

      // Load menu items separately
      await fetchMenuItems();
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setMenuLoading(true);
      const menuData = await getMenuItems();
      console.log("Menu items loaded:", menuData);
      setMenuItems(menuData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      alert("Lỗi khi tải menu");
    } finally {
      setMenuLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.tableNumber &&
            order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    if (selectedDateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (selectedDateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "yesterday":
          startDate = new Date(now.setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(
          (order) => new Date(order.orderDate) >= startDate
        );
      }
    }

    setFilteredOrders(filtered);
  };

  const openViewModal = (order) => {
    setCurrentOrder(order);
    fetchAvailableTables(order.orderDate);
    setIsViewModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder({
      ...order,
      tableIds:
        order.tableIds && order.tableIds.length > 0
          ? order.tableIds.filter(Boolean)
          : order.tables
          ? order.tables.map((t) => t.id).filter(Boolean)
          : [],
      guestCount: order.guestCount || order.bookingInfo?.soLuongKhach || 1,
    });
    fetchAvailableTables(order.orderDate);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setNewOrder({
      customerName: "",
      tableIds: [],
      tableNumber: "",
      status: "pending",
      paymentMethod: "cash",
      items: [],
      total: 0,
      orderDate: new Date().toISOString(),
    });
    fetchAvailableTables();
    setIsCreateModalOpen(true);
  };

  const openDeleteModal = (order) => {
    setCurrentOrder(order);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("vi-VN"); // "31/05/2025"
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }); // "18:30"
    return `${day} ${time}`; // "31/05/2025 18:30"
  };

  const getStatusBadgeOrderFood = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Chờ xử lý
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Đang xử lý
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Chưa thanh toán
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Chưa thanh toán
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã thanh toán
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "VNPay":
        return "VNPay";
      // case "ewallet":
      //   return "Ví điện tử";
      default:
        return method;
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchData();

      // Update current order if it's open in the modal
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, status: newStatus });
      }

      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleUpdateFoodStatus = async (orderId, newStatus) => {
    try {
      await updateOrderFoodStatus(orderId, newStatus);
      await fetchData(); // Cập nhật lại danh sách đơn hàng
      // Nếu đang mở modal, cập nhật lại currentOrder
      if (
        currentOrder &&
        currentOrder.orderInfo &&
        currentOrder.orderInfo.maDatMon === orderId
      ) {
        setCurrentOrder({
          ...currentOrder,
          orderInfo: {
            ...currentOrder.orderInfo,
            trangThai: newStatus,
          },
        });
      }
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleAssignTable = async (orderId, tableId) => {
    try {
      await assignTableToOrder(orderId, tableId);
      await fetchData();

      const selectedTable = tables.find((table) => table.id === tableId);
      if (selectedTable && currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({
          ...currentOrder,
          tableId: tableId,
          tableNumber: selectedTable.name,
        });
      }

      alert("Gán bàn thành công!");
    } catch (error) {
      console.error("Error assigning table:", error);
      alert("Lỗi khi gán bàn");
    }
  };

  const handleSaveEditedOrder = async () => {
    try {
      // Gửi dữ liệu cập nhật lên API
      await updateOrder(editingOrder.id, {
        CustomerName: editingOrder.customerName,
        OrderTableId: editingOrder.tableId,
        TableId: editingOrder.tableIds,
        Status: editingOrder.status,
        StatusOrderFood: editingOrder.orderInfo.trangThai,
        PaymentMethod: editingOrder.paymentMethod,
        Notes: editingOrder.ghiChu || editingOrder.bookingInfo.ghiChu || "",
        Guest: editingOrder.guestCount,
        Items: editingOrder.items.map((item) => ({
          Id: item.id,
          Name: item.name,
          Quantity: item.quantity,
          Price: item.price,
        })),
      });
      await fetchData(); // Cập nhật lại danh sách đơn hàng
      setIsEditModalOpen(false);
      alert("Cập nhật đơn hàng thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật đơn hàng");
    }
  };

  const handleCreateOrder = async () => {
    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!newOrder.customerName) {
        alert("Vui lòng nhập tên khách hàng");
        return;
      }

      if (newOrder.items.length === 0) {
        alert("Đơn hàng phải có ít nhất một món");
        return;
      }

      const orderData = {
        customerName: newOrder.customerName,
        orderTableId: newOrder.bookingCode || "", // Thêm dòng này để truyền mã đặt bàn
        tableId: newOrder.tableIds[0] || "",
        status: newOrder.status,
        paymentMethod: newOrder.paymentMethod,
        notes: newOrder.notes || "",
        orderDate: newOrder.orderDate,
        guest: newOrder.guestCount,
        items: newOrder.items.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("Sending create order data:", JSON.stringify(orderData));
      await createOrder(orderData);
      await fetchData();
      setIsCreateModalOpen(false);
      alert("Tạo đơn hàng thành công!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert(`Lỗi khi tạo đơn hàng: ${error.message}`);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(currentOrder.id);
      await fetchData();
      setIsDeleteModalOpen(false);
      alert("Xóa đơn hàng thành công!");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Lỗi khi xóa đơn hàng");
    }
  };

  const handleAddItemToOrder = (orderObj, setOrderObj) => {
    if (!selectedMenuItem) {
      alert("Vui lòng chọn món ăn");
      return;
    }

    const menuItem = menuItems.find(
      (item) => item.id.toString() === selectedMenuItem
    );
    if (!menuItem) {
      alert("Không tìm thấy món ăn");
      return;
    }

    const quantity = Number.parseInt(selectedMenuItemQuantity) || 1;

    // Check if item already exists in order
    const existingItemIndex = orderObj.items.findIndex(
      (item) => item.id.toString() === selectedMenuItem
    );

    let updatedItems;
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedItems = [...orderObj.items];
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      updatedItems = [
        ...orderObj.items,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: quantity,
        },
      ];
    }

    setOrderObj({
      ...orderObj,
      items: updatedItems,
    });

    // Reset selection
    setSelectedMenuItem("");
    setSelectedMenuItemQuantity(1);
  };

  const handleRemoveItemFromOrder = (orderObj, setOrderObj, itemId) => {
    const updatedItems = orderObj.items.filter((item) => item.id !== itemId);

    setOrderObj({
      ...orderObj,
      items: updatedItems,
    });
  };

  const handleExportExcel = () => {
    const exportData = orders.map((order, index) => ({
      STT: index + 1,
      "Mã đơn hàng": order.id,
      "Khách hàng": order.customerName,
      Bàn: order.tableNumber || "Chưa gán bàn",
      "Thời gian": formatDate(order.orderDate),
      "Trạng thái":
        order.status === "completed"
          ? "Hoàn thành"
          : order.status === "pending"
          ? "Chờ xử lý"
          : order.status === "processing"
          ? "Đang xử lý"
          : "Đã hủy",
      "Tổng tiền": order.total.toLocaleString("vi-VN") + " ₫",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDonHang");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "DanhSachDonHang.xlsx");
  };

  const fetchAvailableTables = async (orderDate = null) => {
    try {
      let dateTime = null;

      if (orderDate) {
        dateTime = new Date(orderDate);
      }

      const tables = await getAvailableTables(dateTime);
      setTables(tables);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      alert("Lỗi khi lấy danh sách bàn trống");
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
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng, khách hàng, bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="processing">Chưa thanh toán</option>
              <option value="completed">Đã thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
          </div>
          <button
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đơn hàng
          </button>
          <button
            className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
            onClick={handleExportExcel}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
          <button
            className="flex items-center px-4 py-2 text-blue-700 bg-white border rounded-lg hover:bg-blue-50"
            onClick={fetchMenuItems}
            disabled={menuLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${menuLoading ? "animate-spin" : ""}`}
            />
            Tải lại menu
          </button>
        </div>
      </div>

      {/* Menu items status */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Menu items: {menuItems.length} món
            {menuLoading && (
              <span className="ml-2 text-blue-600">Đang tải...</span>
            )}
          </span>
          <span className="text-xs text-gray-500">
            Cập nhật lần cuối: {new Date().toLocaleTimeString("vi-VN")}
          </span>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mã đơn hàng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Khách hàng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Bàn
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thời gian
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
                  Tổng tiền
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.tables && order.tables.length > 0 ? (
                      order.tables.map((table) => table.tenBan).join(", ")
                    ) : (
                      <span className="text-yellow-600 italic">
                        Chưa gán bàn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {order.total.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openViewModal(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(order)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {isViewModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Thông tin đơn hàng
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Mã đơn hàng:</span>
                      <span>{currentOrder.id}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Mã đặt bàn:</span>
                      <span>{currentOrder.tableId || "-"}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium mr-2">
                        Ngày giờ đặt món:
                      </span>
                      <span>{formatDate(currentOrder.orderDate)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium mr-2">
                        Ngày giờ đặt bàn:
                      </span>
                      <span>
                        {formatDate(currentOrder.bookingInfo.thoiGianDat)}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium mr-2">Ngày giờ đến:</span>
                      <span>
                        {formatDate(currentOrder.bookingInfo.thoiGianDen)}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Số lượng người:</span>
                      <span>{currentOrder.bookingInfo.soLuongKhach}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Bàn:</span>
                      {currentOrder.tables && currentOrder.tables.length > 0 ? (
                        <span>
                          {currentOrder.tables
                            .map((table) => table.tenBan || table.name || "Bàn")
                            .join(", ")}
                        </span>
                      ) : currentOrder.tableNumber ? (
                        <span>{currentOrder.tableNumber}</span>
                      ) : (
                        <span className="text-yellow-600 italic">
                          Chưa gán bàn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        Trạng thái thanh toán:
                      </span>
                      {getStatusBadge(currentOrder.status)}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        Trạng thái đặt món:
                      </span>
                      {getStatusBadgeOrderFood(
                        currentOrder.orderInfo.trangThai
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Thông tin khách hàng
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{currentOrder.customerName}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">
                        Phương thức thanh toán:
                      </span>
                      <span>
                        {getPaymentMethodText(currentOrder.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">
                        {currentOrder.total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Các món đã đặt
              </h3>
              <div className="bg-gray-50 rounded-md overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Món ăn
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Số lượng
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Đơn giá
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                          ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                      >
                        Tổng cộng:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {currentOrder.total.toLocaleString("vi-VN")} ₫
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status update buttons */}
              {currentOrder.orderInfo.trangThai !== "cancelled" && (
                <div className="flex flex-wrap gap-3">
                  {currentOrder.orderInfo.trangThai === "pending" && (
                    <button
                      onClick={() =>
                        handleUpdateFoodStatus(
                          currentOrder.orderInfo.maDatMon,
                          "processing"
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Xử lý đơn hàng
                    </button>
                  )}

                  {(currentOrder.orderInfo.trangThai === "pending" ||
                    currentOrder.orderInfo.trangThai === "processing") && (
                    <button
                      onClick={() =>
                        handleUpdateFoodStatus(
                          currentOrder.orderInfo.maDatMon,
                          "completed"
                        )
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Hoàn thành đơn hàng
                    </button>
                  )}

                  {(currentOrder.orderInfo.trangThai === "pending" ||
                    currentOrder.orderInfo.trangThai === "processing") && (
                    <button
                      onClick={() =>
                        handleUpdateFoodStatus(
                          currentOrder.orderInfo.maDatMon,
                          "cancelled"
                        )
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setCurrentOrder(null);
                  setIsViewModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chỉnh sửa đơn hàng</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã đặt bàn
                  </label>
                  <input
                    type="text"
                    value={editingOrder.tableId || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        bookingCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mã đặt bàn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khách hàng
                  </label>
                  <input
                    type="text"
                    value={editingOrder.customerName}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày giờ đặt
                  </label>
                  <input
                    type="text"
                    value={formatDate(editingOrder.bookingInfo.thoiGianDat)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày giờ đặt
                  </label>
                  <input
                    type="text"
                    value={formatDate(editingOrder.bookingInfo.thoiGianDen)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng người
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingOrder.guestCount}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        guestCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số lượng người"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    readOnly
                    defaultValue={editingOrder.bookingInfo.ghiChu || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        ghiChu: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú (nếu có)"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bàn
                  </label>
                  <select
                    value={editingOrder.tableId || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        tableId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chưa gán bàn --</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.capacity} người)
                      </option>
                    ))}
                  </select>
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn bàn
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedTableId || ""}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn bàn --</option>
                      {tables
                        .filter(
                          (table) => !editingOrder.tableIds?.includes(table.id)
                        )
                        .map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name} ({table.capacity} người)
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => {
                        if (
                          selectedTableId &&
                          !editingOrder.tableIds.includes(selectedTableId)
                        ) {
                          setEditingOrder({
                            ...editingOrder,
                            tableIds: [
                              ...editingOrder.tableIds,
                              String(selectedTableId),
                            ].filter(Boolean),
                          });
                          setSelectedTableId("");
                        }
                      }}
                    >
                      Thêm bàn
                    </button>
                  </div>
                  {/* Danh sách các bàn đã gán */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingOrder.tableIds.map((id) => {
                      const table = tables.find((t) => t.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {table
                            ? `${table.name} (${table.capacity} người)`
                            : id}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() =>
                              setEditingOrder({
                                ...editingOrder,
                                tableIds: editingOrder.tableIds.filter(
                                  (tid) => tid !== id
                                ),
                              })
                            }
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="processing">Chưa thanh toán</option>
                    <option value="completed">Đã thanh toán</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={editingOrder.paymentMethod}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="vnpay">VNPay</option>
                    {/* <option value="ewallet">Ví điện tử</option> */}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái đặt món
                </label>
                <select
                  value={editingOrder.orderInfo.trangThai}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      orderInfo: {
                        ...editingOrder.orderInfo,
                        trangThai: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Thêm món
                </h3>
                <div className="flex flex-wrap gap-3 mb-3">
                  <select
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn món --</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.price.toLocaleString("vi-VN")} ₫ (
                        {item.category})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedMenuItemQuantity}
                    onChange={(e) =>
                      setSelectedMenuItemQuantity(e.target.value)
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() =>
                      handleAddItemToOrder(editingOrder, setEditingOrder)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
                {menuItems.length === 0 && (
                  <p className="text-sm text-red-600">
                    Không có món ăn nào. Vui lòng tải lại menu.
                  </p>
                )}
              </div>

              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Các món đã đặt
              </h3>
              <div className="bg-gray-50 rounded-md overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Món ăn
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Số lượng
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Đơn giá
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thành tiền
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {editingOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const updatedItems = editingOrder.items.map((i) =>
                                i.id === item.id
                                  ? {
                                      ...i,
                                      quantity:
                                        Number.parseInt(e.target.value) || 1,
                                    }
                                  : i
                              );
                              setEditingOrder({
                                ...editingOrder,
                                items: updatedItems,
                              });
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                          ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() =>
                              handleRemoveItemFromOrder(
                                editingOrder,
                                setEditingOrder,
                                item.id
                              )
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                      >
                        Tổng cộng:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {editingOrder.items
                          .reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                          .toLocaleString("vi-VN")}{" "}
                        ₫
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEditedOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Tạo đơn hàng mới</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  value={newOrder.bookingCode || ""}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, bookingCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mã đặt bàn"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khách hàng
                  </label>
                  <input
                    type="text"
                    value={newOrder.customerName}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày giờ đặt
                  </label>
                  <input
                    type="datetime-local"
                    value={newOrder.orderDate.slice(0, 16)}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, orderDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng người
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newOrder.guestCount}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        guestCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số lượng người"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bàn
                  </label>
                  <select
                    value={newOrder.tableId || ""}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, tableId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chưa gán bàn --</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.capacity} người)
                      </option>
                    ))}
                  </select>
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn bàn
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedTableId || ""}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn bàn --</option>
                      {tables
                        .filter(
                          (table) => !newOrder.tableIds?.includes(table.id)
                        )
                        .map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name} ({table.capacity} người)
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => {
                        if (
                          selectedTableId &&
                          !newOrder.tableIds.includes(selectedTableId)
                        ) {
                          setNewOrder({
                            ...newOrder,
                            tableIds: [...newOrder.tableIds, selectedTableId],
                          });
                          setSelectedTableId("");
                        }
                      }}
                    >
                      Thêm bàn
                    </button>
                  </div>
                  {/* Danh sách các bàn đã gán */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newOrder.tableIds.map((id) => {
                      const table = tables.find((t) => t.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {table
                            ? `${table.name} (${table.capacity} người)`
                            : id}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() =>
                              setNewOrder({
                                ...newOrder,
                                tableIds: newOrder.tableIds.filter(
                                  (tid) => tid !== id
                                ),
                              })
                            }
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={newOrder.status}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={newOrder.paymentMethod}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="VNPay">VNPay</option>
                    {/* <option value="ewallet">Ví điện tử</option> */}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Thêm món
                </h3>
                <div className="flex flex-wrap gap-3 mb-3">
                  <select
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn món --</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.price.toLocaleString("vi-VN")} ₫ (
                        {item.category})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedMenuItemQuantity}
                    onChange={(e) =>
                      setSelectedMenuItemQuantity(e.target.value)
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddItemToOrder(newOrder, setNewOrder)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
                {menuItems.length === 0 && (
                  <p className="text-sm text-red-600">
                    Không có món ăn nào. Vui lòng tải lại menu.
                  </p>
                )}
              </div>

              {newOrder.items.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Các món đã đặt
                  </h3>
                  <div className="bg-gray-50 rounded-md overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Món ăn
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Số lượng
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Đơn giá
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Thành tiền
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {newOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updatedItems = newOrder.items.map((i) =>
                                    i.id === item.id
                                      ? {
                                          ...i,
                                          quantity:
                                            Number.parseInt(e.target.value) ||
                                            1,
                                        }
                                      : i
                                  );
                                  setNewOrder({
                                    ...newOrder,
                                    items: updatedItems,
                                  });
                                }}
                                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {item.price.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              ₫
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() =>
                                  handleRemoveItemFromOrder(
                                    newOrder,
                                    setNewOrder,
                                    item.id
                                  )
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                          >
                            Tổng cộng:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            {newOrder.items
                              .reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toLocaleString("vi-VN")}{" "}
                            ₫
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={!newOrder.customerName || newOrder.items.length === 0}
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ${
                  !newOrder.customerName || newOrder.items.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {isDeleteModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng{" "}
              <span className="font-semibold">{currentOrder.id}</span> của khách
              hàng{" "}
              <span className="font-semibold">{currentOrder.customerName}</span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrdersPage;
