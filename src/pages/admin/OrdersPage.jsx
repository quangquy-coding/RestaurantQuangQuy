"use client"
import React from "react"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
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
} from "lucide-react"

// Mock data for tables
const mockTables = [
  { id: "T01", name: "Bàn 01", capacity: 4, status: "available" },
  { id: "T02", name: "Bàn 02", capacity: 2, status: "available" },
  { id: "T03", name: "Bàn 03", capacity: 6, status: "available" },
  { id: "T04", name: "Bàn 04", capacity: 4, status: "available" },
  { id: "T05", name: "Bàn 05", capacity: 8, status: "available" },
  { id: "T06", name: "Bàn 06", capacity: 2, status: "available" },
]

// Mock data for orders
const mockOrders = [
  {
    id: "OD123456",
    customerName: "Nguyễn Văn A",
    tableNumber: "Bàn 01",
    tableId: "T01",
    orderDate: "2023-06-15T18:30:00",
    status: "completed", // pending, processing, completed, cancelled
    total: 450000,
    paymentMethod: "cash",
    items: [
      { id: 1, name: "Phở bò tái", quantity: 2, price: 85000 },
      { id: 2, name: "Gỏi cuốn tôm thịt", quantity: 3, price: 65000 },
      { id: 3, name: "Trà đào cam sả", quantity: 2, price: 35000 },
    ],
  },
  {
    id: "OD123457",
    customerName: "Trần Thị B",
    tableNumber: "Bàn 03",
    tableId: "T03",
    orderDate: "2023-06-15T19:15:00",
    status: "processing",
    total: 380000,
    paymentMethod: "card",
    items: [
      { id: 1, name: "Cơm rang hải sản", quantity: 2, price: 95000 },
      { id: 2, name: "Chè khúc bạch", quantity: 2, price: 45000 },
      { id: 3, name: "Cà phê sữa đá", quantity: 2, price: 30000 },
    ],
  },
  {
    id: "OD123458",
    customerName: "Lê Văn C",
    tableNumber: "",
    tableId: "",
    orderDate: "2023-06-15T20:00:00",
    status: "pending",
    total: 520000,
    paymentMethod: "ewallet",
    items: [
      { id: 1, name: "Bún chả Hà Nội", quantity: 3, price: 75000 },
      { id: 2, name: "Bánh xèo", quantity: 1, price: 80000 },
      { id: 3, name: "Trà đào cam sả", quantity: 4, price: 35000 },
    ],
  },
  {
    id: "OD123459",
    customerName: "Phạm Thị D",
    tableNumber: "Bàn 02",
    tableId: "T02",
    orderDate: "2023-06-15T17:45:00",
    status: "cancelled",
    total: 290000,
    paymentMethod: "cash",
    items: [
      { id: 1, name: "Phở bò tái", quantity: 2, price: 85000 },
      { id: 2, name: "Cà phê sữa đá", quantity: 4, price: 30000 },
    ],
  },
  {
    id: "OD123460",
    customerName: "Hoàng Văn E",
    tableNumber: "Bàn 04",
    tableId: "T04",
    orderDate: "2023-06-15T18:00:00",
    status: "completed",
    total: 675000,
    paymentMethod: "card",
    items: [
      { id: 1, name: "Cơm rang hải sản", quantity: 3, price: 95000 },
      { id: 2, name: "Gỏi cuốn tôm thịt", quantity: 4, price: 65000 },
      { id: 3, name: "Chè khúc bạch", quantity: 2, price: 45000 },
    ],
  },
]

// Mock menu items for order creation/editing
const mockMenuItems = [
  { id: 1, name: "Phở bò tái", price: 85000, category: "Món chính" },
  { id: 2, name: "Gỏi cuốn tôm thịt", price: 65000, category: "Khai vị" },
  { id: 3, name: "Trà đào cam sả", price: 35000, category: "Đồ uống" },
  { id: 4, name: "Cơm rang hải sản", price: 95000, category: "Món chính" },
  { id: 5, name: "Chè khúc bạch", price: 45000, category: "Tráng miệng" },
  { id: 6, name: "Cà phê sữa đá", price: 30000, category: "Đồ uống" },
  { id: 7, name: "Bún chả Hà Nội", price: 75000, category: "Món chính" },
  { id: 8, name: "Bánh xèo", price: 80000, category: "Món chính" },
]

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    tableId: "",
    tableNumber: "",
    status: "pending",
    paymentMethod: "cash",
    items: [],
    total: 0,
    orderDate: new Date().toISOString(),
  })
  const [selectedMenuItem, setSelectedMenuItem] = useState("")
  const [selectedMenuItemQuantity, setSelectedMenuItemQuantity] = useState(1)

  useEffect(() => {
    // In a real app, you would fetch orders and tables from an API
    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
    setTables(mockTables)
  }, [])

  useEffect(() => {
    // Filter orders based on search term, status, and date range
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.tableNumber && order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus)
    }

    if (selectedDateRange !== "all") {
      const now = new Date()
      let startDate

      switch (selectedDateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "yesterday":
          startDate = new Date(now.setDate(now.getDate() - 1))
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = null
      }

      if (startDate) {
        filtered = filtered.filter((order) => new Date(order.orderDate) >= startDate)
      }
    }

    setFilteredOrders(filtered)
  }, [searchTerm, selectedStatus, selectedDateRange, orders])

  const openViewModal = (order) => {
    setCurrentOrder(order)
    setIsViewModalOpen(true)
  }

  const openEditModal = (order) => {
    setEditingOrder({ ...order })
    setIsEditModalOpen(true)
  }

  const openCreateModal = () => {
    setNewOrder({
      customerName: "",
      tableId: "",
      tableNumber: "",
      status: "pending",
      paymentMethod: "cash",
      items: [],
      total: 0,
      orderDate: new Date().toISOString(),
    })
    setIsCreateModalOpen(true)
  }

  const openDeleteModal = (order) => {
    setCurrentOrder(order)
    setIsDeleteModalOpen(true)
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("vi-VN", options)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Chờ xử lý
          </span>
        )
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Đang xử lý
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoàn thành
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Đã hủy
          </span>
        )
      default:
        return null
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "Tiền mặt"
      case "card":
        return "Thẻ tín dụng/ghi nợ"
      case "ewallet":
        return "Ví điện tử"
      default:
        return method
    }
  }

  const handleUpdateStatus = (orderId, newStatus) => {
    // Update order status
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))

    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders)

    // Update current order if it's open in the modal
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder({ ...currentOrder, status: newStatus })
    }
  }

  const handleAssignTable = (orderId, tableId) => {
    const selectedTable = tables.find((table) => table.id === tableId)
    if (!selectedTable) return

    // Update order with table information
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            tableId: tableId,
            tableNumber: selectedTable.name,
          }
        : order,
    )

    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders)

    // Update current order if it's open in the modal
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder({
        ...currentOrder,
        tableId: tableId,
        tableNumber: selectedTable.name,
      })
    }
  }

  const handleSaveEditedOrder = () => {
    // Calculate total
    const total = editingOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // If a table is selected, get the table name
    let tableNumber = editingOrder.tableNumber
    if (editingOrder.tableId) {
      const selectedTable = tables.find((table) => table.id === editingOrder.tableId)
      if (selectedTable) {
        tableNumber = selectedTable.name
      }
    }

    const updatedOrder = {
      ...editingOrder,
      total,
      tableNumber,
    }

    // Update orders array
    const updatedOrders = orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))

    setOrders(updatedOrders)
    setIsEditModalOpen(false)
  }

  const handleCreateOrder = () => {
    // Calculate total
    const total = newOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // If a table is selected, get the table name
    let tableNumber = ""
    if (newOrder.tableId) {
      const selectedTable = tables.find((table) => table.id === newOrder.tableId)
      if (selectedTable) {
        tableNumber = selectedTable.name
      }
    }

    // Generate a new order ID (in a real app, this would come from the backend)
    const orderId = `OD${Math.floor(100000 + Math.random() * 900000)}`

    const createdOrder = {
      ...newOrder,
      id: orderId,
      total,
      tableNumber,
      orderDate: new Date().toISOString(),
    }

    // Add to orders array
    const updatedOrders = [...orders, createdOrder]
    setOrders(updatedOrders)
    setIsCreateModalOpen(false)
  }

  const handleDeleteOrder = () => {
    if (!currentOrder) return

    // Remove order from array
    const updatedOrders = orders.filter((order) => order.id !== currentOrder.id)
    setOrders(updatedOrders)
    setIsDeleteModalOpen(false)
  }

  const handleAddItemToOrder = (orderObj, setOrderObj) => {
    if (!selectedMenuItem) return

    const menuItem = mockMenuItems.find((item) => item.id.toString() === selectedMenuItem)
    if (!menuItem) return

    const quantity = Number.parseInt(selectedMenuItemQuantity) || 1

    // Check if item already exists in order
    const existingItemIndex = orderObj.items.findIndex((item) => item.id.toString() === selectedMenuItem)

    let updatedItems
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedItems = [...orderObj.items]
      updatedItems[existingItemIndex].quantity += quantity
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
      ]
    }

    setOrderObj({
      ...orderObj,
      items: updatedItems,
    })

    // Reset selection
    setSelectedMenuItem("")
    setSelectedMenuItemQuantity(1)
  }

  const handleRemoveItemFromOrder = (orderObj, setOrderObj, itemId) => {
    const updatedItems = orderObj.items.filter((item) => item.id !== itemId)

    setOrderObj({
      ...orderObj,
      items: updatedItems,
    })
  }

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
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDonHang")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    })

    saveAs(file, "DanhSachDonHang.xlsx")
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
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.tableNumber || <span className="text-yellow-600 italic">Chưa gán bàn</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {order.total.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openViewModal(order)} className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button onClick={() => openEditModal(order)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => openDeleteModal(order)} className="text-red-600 hover:text-red-900">
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
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Thông tin đơn hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Mã đơn hàng:</span>
                      <span>{currentOrder.id}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{formatDate(currentOrder.orderDate)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Bàn:</span>
                      {currentOrder.tableNumber ? (
                        <span>{currentOrder.tableNumber}</span>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-yellow-600 italic mr-2">Chưa gán bàn</span>
                          {currentOrder.status === "pending" && (
                            <div className="ml-2">
                              <select
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                onChange={(e) => handleAssignTable(currentOrder.id, e.target.value)}
                                value={currentOrder.tableId || ""}
                              >
                                <option value="">-- Chọn bàn --</option>
                                {tables.map((table) => (
                                  <option key={table.id} value={table.id}>
                                    {table.name} ({table.capacity} người)
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Trạng thái:</span>
                      {getStatusBadge(currentOrder.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Thông tin khách hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{currentOrder.customerName}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Phương thức thanh toán:</span>
                      <span>{getPaymentMethodText(currentOrder.paymentMethod)}</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{currentOrder.total.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">Các món đã đặt</h3>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
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
              {currentOrder.status !== "completed" && currentOrder.status !== "cancelled" && (
                <div className="flex flex-wrap gap-3">
                  {currentOrder.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(currentOrder.id, "processing")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Xử lý đơn hàng
                    </button>
                  )}

                  {(currentOrder.status === "pending" || currentOrder.status === "processing") && (
                    <button
                      onClick={() => handleUpdateStatus(currentOrder.id, "completed")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Hoàn thành đơn hàng
                    </button>
                  )}

                  {(currentOrder.status === "pending" || currentOrder.status === "processing") && (
                    <button
                      onClick={() => handleUpdateStatus(currentOrder.id, "cancelled")}
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
                  setCurrentOrder(null)
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                  <input
                    type="text"
                    value={editingOrder.customerName}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bàn</label>
                  <select
                    value={editingOrder.tableId || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, tableId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chưa gán bàn --</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.capacity} người)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                  <select
                    value={editingOrder.paymentMethod}
                    onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="card">Thẻ tín dụng/ghi nợ</option>
                    <option value="ewallet">Ví điện tử</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thêm món</h3>
                <div className="flex flex-wrap gap-3 mb-3">
                  <select
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn món --</option>
                    {mockMenuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.price.toLocaleString("vi-VN")} ₫
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedMenuItemQuantity}
                    onChange={(e) => setSelectedMenuItemQuantity(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddItemToOrder(editingOrder, setEditingOrder)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-700 mb-2">Các món đã đặt</h3>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const updatedItems = editingOrder.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: Number.parseInt(e.target.value) || 1 } : i,
                              )
                              setEditingOrder({ ...editingOrder, items: updatedItems })
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleRemoveItemFromOrder(editingOrder, setEditingOrder, item.id)}
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
                      <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        Tổng cộng:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {editingOrder.items
                          .reduce((sum, item) => sum + item.price * item.quantity, 0)
                          .toLocaleString("vi-VN")}{" "}
                        ₫
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Tạo đơn hàng mới</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                  <input
                    type="text"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bàn</label>
                  <select
                    value={newOrder.tableId || ""}
                    onChange={(e) => setNewOrder({ ...newOrder, tableId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chưa gán bàn --</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.capacity} người)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                  <select
                    value={newOrder.paymentMethod}
                    onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="card">Thẻ tín dụng/ghi nợ</option>
                    <option value="ewallet">Ví điện tử</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thêm món</h3>
                <div className="flex flex-wrap gap-3 mb-3">
                  <select
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn món --</option>
                    {mockMenuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.price.toLocaleString("vi-VN")} ₫
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedMenuItemQuantity}
                    onChange={(e) => setSelectedMenuItemQuantity(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddItemToOrder(newOrder, setNewOrder)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {newOrder.items.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Các món đã đặt</h3>
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
                                    i.id === item.id ? { ...i, quantity: Number.parseInt(e.target.value) || 1 } : i,
                                  )
                                  setNewOrder({ ...newOrder, items: updatedItems })
                                }}
                                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {item.price.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleRemoveItemFromOrder(newOrder, setNewOrder, item.id)}
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
                          <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            Tổng cộng:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            {newOrder.items
                              .reduce((sum, item) => sum + item.price * item.quantity, 0)
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
                  !newOrder.customerName || newOrder.items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
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
              Bạn có chắc chắn muốn xóa đơn hàng <span className="font-semibold">{currentOrder.id}</span> của khách hàng{" "}
              <span className="font-semibold">{currentOrder.customerName}</span>?
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
  )
}

export default OrdersPage
