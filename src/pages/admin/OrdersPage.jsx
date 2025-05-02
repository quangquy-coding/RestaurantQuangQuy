
import React from "react"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Search, Eye, CheckCircle, Clock, XCircle, Calendar, User, CreditCard, Printer,Download } from "lucide-react"

// Mock data for orders
const mockOrders = [
  {
    id: "OD123456",
    customerName: "Nguyễn Văn A",
    tableNumber: "Bàn 01",
    orderDate: "2023-06-15T18:30:00",
    status: "completed", // pending, processing, completed, cancelled
    total: 450000,
    paymentMethod: "cash",
    items: [
      { id: 1, name: "Phở bò tái", quantity: 2, price: 85000 },
      { id: 2, name: "Gỏi cuốn tôm thịt", quantity: 3, price: 65000 },
      { id: 3, name: "Trà đào cam sả", quantity: 2, price: 35000 }
    ]
  },
  {
    id: "OD123457",
    customerName: "Trần Thị B",
    tableNumber: "Bàn 03",
    orderDate: "2023-06-15T19:15:00",
    status: "processing",
    total: 380000,
    paymentMethod: "card",
    items: [
      { id: 1, name: "Cơm rang hải sản", quantity: 2, price: 95000 },
      { id: 2, name: "Chè khúc bạch", quantity: 2, price: 45000 },
      { id: 3, name: "Cà phê sữa đá", quantity: 2, price: 30000 }
    ]
  },
  {
    id: "OD123458",
    customerName: "Lê Văn C",
    tableNumber: "Bàn 05",
    orderDate: "2023-06-15T20:00:00",
    status: "pending",
    total: 520000,
    paymentMethod: "ewallet",
    items: [
      { id: 1, name: "Bún chả Hà Nội", quantity: 3, price: 75000 },
      { id: 2, name: "Bánh xèo", quantity: 1, price: 80000 },
      { id: 3, name: "Trà đào cam sả", quantity: 4, price: 35000 }
    ]
  },
  {
    id: "OD123459",
    customerName: "Phạm Thị D",
    tableNumber: "Bàn 02",
    orderDate: "2023-06-15T17:45:00",
    status: "cancelled",
    total: 290000,
    paymentMethod: "cash",
    items: [
      { id: 1, name: "Phở bò tái", quantity: 2, price: 85000 },
      { id: 2, name: "Cà phê sữa đá", quantity: 4, price: 30000 }
    ]
  },
  {
    id: "OD123460",
    customerName: "Hoàng Văn E",
    tableNumber: "Bàn 04",
    orderDate: "2023-06-15T18:00:00",
    status: "completed",
    total: 675000,
    paymentMethod: "card",
    items: [
      { id: 1, name: "Cơm rang hải sản", quantity: 3, price: 95000 },
      { id: 2, name: "Gỏi cuốn tôm thịt", quantity: 4, price: 65000 },
      { id: 3, name: "Chè khúc bạch", quantity: 2, price: 45000 }
    ]
  }
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  useEffect(() => {
    // In a real app, you would fetch orders from an API
    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
  }, [])

  useEffect(() => {
    // Filter orders based on search term, status, and date range
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const handleExportExcel = () => {
        const exportData = orders.map((order, index) => ({
          STT: index + 1,
          "Mã đơn hàng": order.id,
          "Khách hàng": order.customerName,
          "Bàn": order.tableNumber,
          "Thời gian": formatDate(order.orderDate),
          "Trạng thái": order.status === "completed" ? "Hoàn thành" : order.status === "pending" ? "Chờ xử lý" : order.status === "processing" ? "Đang xử lý" : "Đã hủy",
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

  return (
    <div className="p-6">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-2xl font-bold ">Quản lý đơn hàng</h1>
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
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={handleExportExcel}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tableNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {order.total.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openViewModal(order)} className="text-indigo-600 hover:text-indigo-900">
                      <Eye className="h-5 w-5" />
                    </button>
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
                      <span>{currentOrder.tableNumber}</span>
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
    </div>
  )
}

export default OrdersPage
