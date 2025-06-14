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
  FileText,
  Mail,
  AlertTriangle,
  Info,
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
  exportInvoicePdf,
  sendInvoiceEmail,
} from "../../api/orderApi";

const OrdersPage = () => {
  // State declarations
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
    customerPhone: "",
    customerEmail: "",
    orderDate: new Date().toISOString().slice(0, 10),
    tableIds: [],
    tableNumber: "",
    status: "pending",
    foodStatus: "pending",
    paymentMethod: "cash",
    items: [],
    total: 0,
    discount: 0, // Added for discount
    deposit: 0, // Added for deposit
    remaining: 0, // Added for remaining
    arrivalTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    guestCount: 2,
    notes: "",
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [selectedMenuItemQuantity, setSelectedMenuItemQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  function getLocalDateTimeString() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }
  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Pagination handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Fetch data
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
      alert("Lỗi khi tải danh sách món ăn");
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
    setCurrentPage(1);
  };

  const openViewModal = (order) => {
    setCurrentOrder(order);
    fetchAvailableTables(order.orderDate);
    setIsViewModalOpen(true);
  };

  const openEditModal = (order) => {
    console.log("Opening Edit Modal with order:", order);
    setEditingOrder({
      ...order,
      tableIds:
        order.tableIds && order.tableIds.length > 0
          ? order.tableIds.filter(Boolean)
          : order.tables
          ? order.tables.map((t) => t.maBan).filter(Boolean)
          : [],
      guestCount: order.guestCount || order.bookingInfo?.soLuongKhach || 1,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total:
        order.total ||
        order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      discount: order.discount || 0, // Added for discount
      deposit: order.deposit || 0, // Added for deposit
      remaining:
        order.remaining ||
        order.total - (order.discount || 0) - (order.deposit || 0), // Added for remaining
    });
    fetchAvailableTables(order.orderDate);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setNewOrder({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      tableIds: [],
      tableNumber: "",
      status: "pending",
      paymentMethod: "cash",
      items: [],
      total: 0,
      discount: 0, // Added for discount
      deposit: 0, // Added for deposit
      remaining: 0, // Added for remaining
      orderDate: new Date().toISOString(),
      arrivalTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      guestCount: 2,
      notes: "",
    });
    fetchAvailableTables();
    setIsCreateModalOpen(true);
  };

  const openDeleteModal = (order) => {
    setCurrentOrder(order);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.toLocaleDateString("vi-VN");
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${time}`;
  };

  const getStatusBadgeOrderFood = (status) => {
    switch (status) {
      case "pending":
      case "Chưa thanh toán":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Chưa thanh toán
          </span>
        );
      case "deposit":
      case "Đã cọc":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Đã cọc
          </span>
        );
      case "completed":
      case "Đã thanh toán":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã thanh toán
          </span>
        );
      // case "cancelled":
      // case "Đã hủy":
      //   return (
      //     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      //       <XCircle className="mr-1 h-3 w-3" />
      //       Đã hủy
      //     </span>
      //   );
      default:
        return null;
    }
  };
  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Chưa xử lý
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Đang chuẩn bị
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoàn tất
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
      case "deposit":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Đã cọc
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã thanh toán
          </span>
        );
      // case "cancelled":
      //   return (
      //     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      //       <XCircle className="mr-1 h-3 w-3" />
      //       Đã hủy
      //     </span>
      //   );
      default:
        return null;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
      case "Tiền mặt":
        return "Tiền mặt";
      case "VNPay":
        return "VNPay";
      default:
        return method;
    }
  };

  const canUpdateStatus = (order, newStatus) => {
    if (newStatus === "completed") {
      const now = new Date();
      const arrivalTime = new Date(order.bookingInfo?.thoiGianDen);
      const orderTime = new Date(order.orderInfo?.thoiGianDat);

      if (arrivalTime > now) {
        return {
          canUpdate: false,
          reason: `Chưa đến thời gian phục vụ (${formatDate(arrivalTime)})`,
        };
      }

      if (orderTime > now) {
        return {
          canUpdate: false,
          reason: `Chưa đến thời gian đặt món (${formatDate(orderTime)})`,
        };
      }

      if (
        order.orderInfo?.trangThai !== "completed" &&
        order.orderInfo?.trangThai !== "Hoàn thành"
      ) {
        return { canUpdate: false, reason: "Đơn đặt món chưa hoàn thành" };
      }
    }

    return { canUpdate: true, reason: "" };
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      const statusCheck = canUpdateStatus(order, newStatus);

      if (!statusCheck.canUpdate) {
        alert(statusCheck.reason);
        return;
      }

      await updateOrderStatus(orderId, newStatus);
      await fetchData();

      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, status: newStatus });
      }

      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleUpdateFoodStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find((o) => o.orderInfo?.maDatMon === orderId);
      const statusCheck = canUpdateStatus(order, newStatus);

      if (!statusCheck.canUpdate) {
        alert(statusCheck.reason);
        return;
      }

      await updateOrderFoodStatus(orderId, newStatus);
      await fetchData();

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
      console.error("Error updating food status:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
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
      await updateOrder(editingOrder.id, {
        CustomerName: editingOrder.customerName,
        TableIds: editingOrder.tableIds,
        Status: editingOrder.status,
        StatusOrderFood: editingOrder.orderInfo.trangThai,
        PaymentMethod: editingOrder.paymentMethod,
        Notes: editingOrder.ghiChu || editingOrder.bookingInfo?.ghiChu || "",
        Guest: editingOrder.guestCount,
        Discount: editingOrder.discount,
        Deposit: editingOrder.deposit,
        Items: editingOrder.items.map((item) => ({
          Id: item.id,
          Name: item.name,
          Quantity: item.quantity,
          Price: item.price,
        })),
      });
      await fetchData();
      setIsEditModalOpen(false);
      alert("Cập nhật đơn hàng thành công!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật đơn hàng");
    }
  };

  const handleCreateOrder = async () => {
    try {
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
        customerPhone: newOrder.customerPhone,
        customerEmail: newOrder.customerEmail,
        tableIds: newOrder.tableIds,
        orderDate: newOrder.orderDate,
        arrivalTime: newOrder.arrivalTime,
        guestCount: newOrder.guestCount,
        paymentMethod: newOrder.paymentMethod,
        notes: newOrder.notes || "",
        discount: newOrder.discount,
        deposit: newOrder.deposit,
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
      alert(
        error.response?.data?.message ||
          `Lỗi khi tạo đơn hàng: ${error.message}`
      );
    }
  };

  const handleDeleteOrder = async () => {
    try {
      if (currentOrder.status === "completed") {
        alert("Không thể xóa đơn hàng đã hoàn thành thanh toán");
        return;
      }

      await deleteOrder(currentOrder.id);
      await fetchData();
      setIsDeleteModalOpen(false);
      alert("Xóa đơn hàng thành công!");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert(error.response?.data?.message || "Lỗi khi xóa đơn hàng");
    }
  };

  const handleExportPdf = async (orderId) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order.canExportPdf) {
        alert(
          "Chỉ có thể xuất PDF cho đơn hàng đã hoàn thành cả thanh toán và phục vụ"
        );
        return;
      }

      const response = await exportInvoicePdf(orderId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `HoaDon_${orderId}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(error.response?.data?.message || "Lỗi khi xuất PDF");
    }
  };

  const handleSendEmail = async (orderId, email) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order.canExportPdf) {
        alert("Chỉ có thể gửi hóa đơn cho đơn hàng đã hoàn thành");
        return;
      }

      await sendInvoiceEmail(orderId, { email });
      alert("Gửi hóa đơn qua email thành công!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert(error.response?.data?.message || "Lỗi khi gửi email");
    }
  };

  const handleAddItemToOrder = (orderObj, setOrderObj) => {
    console.log(
      "handleAddItemToOrder called with selectedMenuItem:",
      selectedMenuItem
    );
    console.log("Current menuItems:", menuItems);

    if (!selectedMenuItem) {
      alert("Vui lòng chọn món ăn");
      return;
    }

    const menuItem = menuItems.find((item) => item.id === selectedMenuItem);
    if (!menuItem) {
      console.error("Menu item not found for ID:", selectedMenuItem);
      alert("Không tìm thấy món ăn");
      return;
    }

    setOrderObj((prev) => {
      console.log("Current items before update:", prev.items);
      const existingItem = prev.items.find(
        (item) => item.menuItemId === menuItem.id
      );
      let updatedItems;

      if (existingItem) {
        updatedItems = prev.items.map((item) =>
          item.menuItemId === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + Number(selectedMenuItemQuantity),
              }
            : item
        );
      } else {
        const newItem = {
          id: menuItem.id,
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: Number(selectedMenuItemQuantity),
          price: menuItem.price,
        };
        console.log("Adding new item:", newItem);
        updatedItems = [...prev.items, newItem];
      }

      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const newRemaining = newTotal - prev.discount - prev.deposit; // Calculate remaining
      console.log("Updated items:", updatedItems);
      console.log("New total:", newTotal);

      return {
        ...prev,
        items: updatedItems,
        total: newTotal,
        remaining: newRemaining, // Update remaining
      };
    });

    setSelectedMenuItem("");
    setSelectedMenuItemQuantity(1);
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleRemoveItemFromOrder = (orderObj, setOrderObj, menuItemId) => {
    console.log(
      "handleRemoveItemFromOrder called with menuItemId:",
      menuItemId
    );
    console.log("Current items before removal:", orderObj.items);

    setOrderObj((prev) => {
      const updatedItems = prev.items.filter(
        (item) => item.menuItemId !== menuItemId
      );
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const newRemaining = newTotal - prev.discount - prev.deposit; // Calculate remaining
      console.log("Items after removal:", updatedItems);
      console.log("New total:", newTotal);

      return {
        ...prev,
        items: updatedItems,
        total: newTotal,
        remaining: newRemaining, // Update remaining
      };
    });
  };

  const handleExportExcel = () => {
    const exportData = orders.map((order, index) => ({
      STT: index + 1,
      "Mã đơn hàng": order.id,
      "Khách hàng": order.customerName,
      "Số điện thoại": order.customerPhone || "N/A",
      Bàn:
        order.tables && order.tables.length > 0
          ? order.tables.map((t) => t.tenBan).join(", ")
          : "Chưa gán bàn",
      "Thời gian đặt": formatDate(order.orderDate),
      "Thời gian thanh toán": formatDate(order.paymentDate),
      "Trạng thái thanh toán":
        order.status === "completed"
          ? "Đã thanh toán"
          : order.status === "deposit"
          ? "Đã cọc"
          : order.status === "processing"
          ? "Chưa thanh toán"
          : "",
      "Trạng thái đặt món": order.orderInfo?.trangThai || "N/A",
      "Tổng tiền": order.total.toLocaleString("vi-VN") + " ₫",
      "Tiền cọc": order.deposit.toLocaleString("vi-VN") + " ₫",
      "Tiền còn lại": order.remaining.toLocaleString("vi-VN") + " ₫",
      "Phương thức": getPaymentMethodText(order.paymentMethod),
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

    saveAs(
      file,
      `DanhSachDonHang_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
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
              <option value="pending">Chưa thanh toán</option>
              <option value="deposit">Đã cọc</option>
              <option value="completed">Đã thanh toán</option>
              {/* <option value="cancelled">Đã hủy</option> */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái thanh toán
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                    {order.canExportPdf && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <FileText className="w-3 h-3 mr-1" />
                        PDF
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-normal text-sm text-gray-500 break-words">
                    {order.tables && order.tables.length > 0 ? (
                      order.tables.map((table) => table.tenBan).join(", ")
                    ) : (
                      <span className="text-yellow-600 italic">
                        Chưa gán bàn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>
                        Đặt:{" "}
                        {order.bookingInfo?.thoiGianDen ? (
                          formatDate(order.bookingInfo.thoiGianDen)
                        ) : (
                          <span className="text-yellow-600 italic">
                            Chưa có thời gian
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadgeOrderFood(order.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right text-center">
                    <div>
                      <div className="font-medium">
                        {order.total.toLocaleString("vi-VN")} ₫
                      </div>
                      <div className="text-xs text-gray-400">
                        Cọc: {order.deposit.toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openViewModal(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {order.canExportPdf && (
                        <>
                          <button
                            onClick={() => handleExportPdf(order.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Xuất PDF"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              const email = prompt(
                                "Nhập email để gửi hóa đơn:",
                                order.customerEmail || ""
                              );
                              if (email) handleSendEmail(order.id, email);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Gửi email"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openDeleteModal(order)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                        disabled={order.status === "completed"}
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
        {filteredOrders.length > ordersPerPage && (
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị {indexOfFirstOrder + 1} đến{" "}
              {Math.min(indexOfLastOrder, filteredOrders.length)} của{" "}
              {filteredOrders.length} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {isViewModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
              <div className="flex items-center gap-2">
                {currentOrder.canExportPdf && (
                  <>
                    <button
                      onClick={() => handleExportPdf(currentOrder.id)}
                      className="p-2 text-green-600 hover:text-green-700 rounded-full hover:bg-green-100"
                      title="Xuất PDF"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        const email = prompt(
                          "Nhập email để gửi hóa đơn:",
                          currentOrder.customerEmail || ""
                        );
                        if (email) handleSendEmail(currentOrder.id, email);
                      }}
                      className="p-2 text-purple-600 hover:text-purple-700 rounded-full hover:bg-purple-100"
                      title="Gửi email"
                    >
                      <Mail className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => window.print()}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Time constraints warning */}
              {currentOrder.bookingInfo && (
                <div className="mb-6">
                  {new Date(currentOrder.bookingInfo.thoiGianDen) >
                    new Date() && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                        <span className="text-yellow-800 text-sm font-medium">
                          Chưa đến thời gian phục vụ (
                          {formatDate(currentOrder.bookingInfo.thoiGianDen)})
                        </span>
                      </div>
                    </div>
                  )}
                  {currentOrder.orderInfo &&
                    new Date(currentOrder.orderInfo.thoiGianDat) >
                      new Date() && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <Info className="h-5 w-5 text-blue-400 mr-2" />
                          <span className="text-blue-800 text-sm font-medium">
                            Chưa đến thời gian đặt món (
                            {formatDate(currentOrder.orderInfo.thoiGianDat)})
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              )}

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
                    {currentOrder.bookingInfo && (
                      <>
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
                          <span className="font-medium mr-2">
                            Ngày giờ đến:
                          </span>
                          <span>
                            {formatDate(currentOrder.bookingInfo.thoiGianDen)}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="font-medium mr-2">
                            Số lượng người:
                          </span>
                          <span>{currentOrder.bookingInfo.soLuongKhach}</span>
                        </div>
                      </>
                    )}
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
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">
                        Trạng thái thanh toán:
                      </span>
                      {getStatusBadge(currentOrder.status)}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">
                        Trạng thái đặt món:
                      </span>
                      {getOrderStatusBadge(currentOrder.orderInfo?.trangThai)}
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
                    {currentOrder.customerPhone && (
                      <div className="flex items-center mb-2">
                        <span className="font-medium mr-2">Số điện thoại:</span>
                        <span>{currentOrder.customerPhone}</span>
                      </div>
                    )}
                    {currentOrder.customerEmail && (
                      <div className="flex items-center mb-3">
                        <span className="font-medium mr-3">Email:</span>
                        <span>{currentOrder.customerEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center mb-3">
                      <span className="font-medium mr-3">
                        Phương thức thanh toán:
                      </span>
                      <span>
                        {getPaymentMethodText(currentOrder.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-medium">
                        Tổng: {currentOrder.total.toLocaleString("vi-VN")} VND
                      </span>
                      <CreditCard className="h-4 w-4 text-gray-600 mr-2" />
                    </div>
                    <div className="flex items-center mb-3">
                      <span className="font-medium mr-3">Tiền cọc:</span>
                      <span>
                        {currentOrder.deposit.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-3">Còn lại:</span>
                      <span>
                        {currentOrder.remaining.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Các món đã đặt
              </h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 font-semibold uppercase tracking-wider">
                        Món ăn
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Đơn giá trị
                      </th>
                      <th className="px-6 py-3 text-right font-semibold text-xs text-gray-700 uppercase tracking-wider">
                        Thành phần tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {item.price.toLocaleString("vi-VN")} VND
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                          VND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-semibold text-gray-800 text-right"
                      >
                        Tạm tính:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-bold text-right">
                        {currentOrder.total.toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                    {currentOrder.discount > 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-sm font-semibold text-gray-800 text-right"
                        >
                          Giảm giá:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-bold text-right">
                          -{currentOrder.discount.toLocaleString("vi-VN")} VND
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-semibold text-gray-800 text-right"
                      >
                        Tiền cọc:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold text-right">
                        {currentOrder.deposit.toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-bold text-gray-900 text-right"
                      >
                        Còn lại:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-700 text-right">
                        {currentOrder.remaining.toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status update buttons */}
              {currentOrder.orderInfo?.trangThai !== "cancelled" &&
                currentOrder.orderInfo?.trangThai !== "Đã hủy" && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <h4 className="w-full text-sm font-medium text-gray-700 mb-2">
                      Cập nhật trạng thái đặt món:
                    </h4>

                    {(currentOrder.orderInfo?.trangThai === "pending" ||
                      currentOrder.orderInfo?.trangThai === "Chờ xử lí") && (
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

                    {(currentOrder.orderInfo?.trangThai === "pending" ||
                      currentOrder.orderInfo?.trangThai === "Chờ xử lí" ||
                      currentOrder.orderInfo?.trangThai === "processing" ||
                      currentOrder.orderInfo?.trangThai === "Đang xử lí") && (
                      <button
                        onClick={() => {
                          const statusCheck = canUpdateStatus(
                            currentOrder,
                            "completed"
                          );
                          if (!statusCheck.canUpdate) {
                            alert(statusCheck.reason);
                            return;
                          }
                          handleUpdateFoodStatus(
                            currentOrder.orderInfo.maDatMon,
                            "completed"
                          );
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Hoàn thành đơn hàng
                      </button>
                    )}

                    {(currentOrder.orderInfo?.trangThai === "pending" ||
                      currentOrder.orderInfo?.trangThai === "Chờ xử lí" ||
                      currentOrder.orderInfo?.trangThai === "processing" ||
                      currentOrder.orderInfo?.trangThai === "Đang xử lí") && (
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

              {/* Payment status update buttons */}
              {currentOrder.status !== "cancelled" && (
                <div className="flex flex-wrap gap-3">
                  <h4 className="w-full text-sm font-medium text-gray-700 mb-2">
                    Cập nhật trạng thái thanh toán:
                  </h4>

                  {currentOrder.status === "pending" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(currentOrder.id, "processing")
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Xác nhận thanh toán
                    </button>
                  )}

                  {(currentOrder.status === "pending" ||
                    currentOrder.status === "processing") && (
                    <button
                      onClick={() => {
                        const statusCheck = canUpdateStatus(
                          currentOrder,
                          "completed"
                        );
                        if (!statusCheck.canUpdate) {
                          alert(statusCheck.reason);
                          return;
                        }
                        handleUpdateStatus(currentOrder.id, "completed");
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Hoàn thành thanh toán
                    </button>
                  )}

                  {/* {(currentOrder.status === "pending" ||
                    currentOrder.status === "processing") && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(currentOrder.id, "cancelled")
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Hủy thanh toán
                    </button>
                  )} */}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chỉnh sửa đơn hàng</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khách hàng *
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
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editingOrder.customerPhone || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        customerPhone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingOrder.customerEmail || ""}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        customerEmail: e.target.value,
                      })
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
                    value={editingOrder.guestCount}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        guestCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái thanh toán
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
                    <option value="pending">Chưa thanh toán</option>
                    <option value="deposit">Đã cọc</option>
                    <option value="completed">Đã thanh toán</option>
                    {/* <option value="cancelled">Đã hủy</option> */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái đặt món
                  </label>
                  <select
                    value={editingOrder.orderInfo?.trangThai || "pending"}
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingOrder.discount}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        discount: Number(e.target.value) || 0,
                        remaining:
                          editingOrder.total -
                          (Number(e.target.value) || 0) -
                          editingOrder.deposit,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiền cọc (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingOrder.deposit}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        deposit: Number(e.target.value) || 0,
                        remaining:
                          editingOrder.total -
                          editingOrder.discount -
                          (Number(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={
                    editingOrder.notes || editingOrder.bookingInfo?.ghiChu || ""
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
                />
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
                    disabled={menuLoading}
                  >
                    <option value="">-- Chọn món --</option>
                    {menuItems
                      .filter((item) => item.isAvailable)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.price.toLocaleString("vi-VN")} ₫ (
                          {item.category}, {item.status})
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    value={selectedMenuItemQuantity}
                    onChange={(e) =>
                      setSelectedMenuItemQuantity(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() =>
                      handleAddItemToOrder(editingOrder, setEditingOrder)
                    }
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Thêm món
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Món ăn
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              const newTotal = updatedItems.reduce(
                                (sum, i) => sum + i.price * i.quantity,
                                0
                              );
                              setEditingOrder({
                                ...editingOrder,
                                items: updatedItems,
                                total: newTotal,
                                remaining:
                                  newTotal -
                                  editingOrder.discount -
                                  editingOrder.deposit,
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
                        Tạm tính:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {editingOrder.total.toLocaleString("vi-VN")} ₫
                      </td>
                      <td></td>
                    </tr>
                    {editingOrder.discount > 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                        >
                          Giảm giá:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                          -{editingOrder.discount.toLocaleString("vi-VN")} ₫
                        </td>
                        <td></td>
                      </tr>
                    )}
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                      >
                        Tiền cọc:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                        {editingOrder.deposit.toLocaleString("vi-VN")} ₫
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-bold text-gray-900 text-right"
                      >
                        Còn lại:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600 text-right">
                        {editingOrder.remaining.toLocaleString("vi-VN")} ₫
                      </td>
                      <td></td>
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Tạo đơn hàng mới</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khách hàng *
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
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={newOrder.customerPhone}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        customerPhone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newOrder.customerEmail}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        customerEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email"
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
                  />
                </div>

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
                            tableIds: [
                              ...newOrder.tableIds,
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
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày giờ đặt hàng
                  </label>
                  <input
                    id="orderDate"
                    type="datetime-local"
                    value={getLocalDateTimeString()}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, orderDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày giờ đến
                  </label>
                  <input
                    type="datetime-local"
                    value={newOrder.arrivalTime.slice(0, 16)}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, arrivalTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    <option value="vnpay">VNPay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newOrder.discount}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        discount: Number(e.target.value) || 0,
                        remaining:
                          newOrder.total -
                          (Number(e.target.value) || 0) -
                          newOrder.deposit,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiền cọc (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newOrder.deposit}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        deposit: Number(e.target.value) || 0,
                        remaining:
                          newOrder.total -
                          newOrder.discount -
                          (Number(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
                />
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
                    disabled={menuLoading}
                  >
                    <option value="">-- Chọn món --</option>
                    {menuItems
                      .filter((item) => item.isAvailable)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.price.toLocaleString("vi-VN")} ₫ (
                          {item.category}, {item.status})
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    value={selectedMenuItemQuantity}
                    onChange={(e) =>
                      setSelectedMenuItemQuantity(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => handleAddItemToOrder(newOrder, setNewOrder)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Thêm món
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Món ăn
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                        Number.parseInt(e.target.value) || 1,
                                    }
                                  : i
                              );
                              const newTotal = updatedItems.reduce(
                                (sum, i) => sum + i.price * i.quantity,
                                0
                              );
                              setNewOrder({
                                ...newOrder,
                                items: updatedItems,
                                total: newTotal,
                                remaining:
                                  newTotal -
                                  newOrder.discount -
                                  newOrder.deposit,
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
                        Tạm tính:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {newOrder.total.toLocaleString("vi-VN")} ₫
                      </td>
                      <td></td>
                    </tr>
                    {newOrder.discount > 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                        >
                          Giảm giá:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                          -{newOrder.discount.toLocaleString("vi-VN")} ₫
                        </td>
                        <td></td>
                      </tr>
                    )}
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                      >
                        Tiền cọc:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                        {newOrder.deposit.toLocaleString("vi-VN")} ₫
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-sm font-bold text-gray-900 text-right uppercase"
                      >
                        Còn lại:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600 text-right">
                        {newOrder.remaining.toLocaleString("vi-VN")} ₫
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Tạo đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
