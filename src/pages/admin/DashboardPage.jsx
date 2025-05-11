import React from "react"


import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Coffee,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react"

// Mock data for dashboard
const mockSummaryData = {
  revenue: {
    current: 12345000,
    previous: 10500000,
    percentChange: 17.57,
  },
  orders: {
    current: 256,
    previous: 230,
    percentChange: 11.3,
  },
  customers: {
    current: 128,
    previous: 115,
    percentChange: 11.3,
  },
  dishes: {
    current: 64,
    previous: 60,
    percentChange: 6.67,
  },
}

const mockRecentOrders = [
  {
    id: "12345",
    customer: "Nguyễn Văn A",
    items: 4,
    total: 335500,
    status: "Đang chuẩn bị",
    time: "15 phút trước",
  },
  {
    id: "12344",
    customer: "Trần Thị B",
    items: 3,
    total: 245000,
    status: "Hoàn thành",
    time: "30 phút trước",
  },
  {
    id: "12343",
    customer: "Lê Văn C",
    items: 2,
    total: 180000,
    status: "Đang giao",
    time: "45 phút trước",
  },
  {
    id: "12342",
    customer: "Phạm Thị D",
    items: 5,
    total: 420000,
    status: "Hoàn thành",
    time: "1 giờ trước",
  },
  {
    id: "12341",
    customer: "Hoàng Văn E",
    items: 1,
    total: 85000,
    status: "Đã hủy",
    time: "1.5 giờ trước",
  },
]

const mockLowStockItems = [
  {
    id: 1,
    name: "Thịt bò",
    category: "Nguyên liệu",
    currentStock: 2,
    minStock: 5,
    unit: "kg",
  },
  {
    id: 2,
    name: "Tôm sú",
    category: "Nguyên liệu",
    currentStock: 1.5,
    minStock: 3,
    unit: "kg",
  },
  {
    id: 3,
    name: "Nước mắm",
    category: "Gia vị",
    currentStock: 1,
    minStock: 2,
    unit: "chai",
  },
]

const mockPopularDishes = [
  {
    id: 1,
    name: "Phở bò tái",
    orders: 42,
    rating: 4.8,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Cơm rang hải sản",
    orders: 38,
    rating: 4.9,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Bún chả Hà Nội",
    orders: 35,
    rating: 4.7,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Bánh xèo",
    orders: 30,
    rating: 4.5,
    image: "/placeholder.svg?height=40&width=40",
  },
]

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [popularDishes, setPopularDishes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch data from an API
    // For now, we'll use mock data
    setTimeout(() => {
      setSummaryData(mockSummaryData)
      setRecentOrders(mockRecentOrders)
      setLowStockItems(mockLowStockItems)
      setPopularDishes(mockPopularDishes)
      setLoading(false)
    }, 500)
  }, [])

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN") + " ₫"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang chuẩn bị":
        return "bg-yellow-100 text-yellow-800"
      case "Đang giao":
        return "bg-blue-100 text-blue-800"
      case "Hoàn thành":
        return "bg-green-100 text-green-800"
      case "Đã hủy":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
              <h2 className="text-2xl font-bold">{formatCurrency(summaryData.revenue.current)}</h2>
              <div
                className={`flex items-center mt-2 text-sm ${
                  summaryData.revenue.percentChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.revenue.percentChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(summaryData.revenue.percentChange).toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
              <h2 className="text-2xl font-bold">{summaryData.orders.current}</h2>
              <div
                className={`flex items-center mt-2 text-sm ${
                  summaryData.orders.percentChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.orders.percentChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(summaryData.orders.percentChange).toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng khách hàng</p>
              <h2 className="text-2xl font-bold">{summaryData.customers.current}</h2>
              <div
                className={`flex items-center mt-2 text-sm ${
                  summaryData.customers.percentChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.customers.percentChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(summaryData.customers.percentChange).toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng món ăn</p>
              <h2 className="text-2xl font-bold">{summaryData.dishes.current}</h2>
              <div
                className={`flex items-center mt-2 text-sm ${
                  summaryData.dishes.percentChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summaryData.dishes.percentChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(summaryData.dishes.percentChange).toFixed(1)}%</span>
                <span className="text-gray-500 ml-1">so với kỳ trước</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Coffee className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
              <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mã đơn
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
                    Số món
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tổng tiền
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{order.items}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{order.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side content */}
        <div className="space-y-6">
          {/* Low stock alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cảnh báo hàng tồn kho thấp</h2>
                <Link to="/admin/inventory" className="text-sm text-blue-600 hover:underline">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-6">
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-center">Không có cảnh báo nào</p>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Còn lại: {item.currentStock} {item.unit} (Tối thiểu: {item.minStock} {item.unit})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular dishes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Món ăn phổ biến</h2>
                <Link to="/admin/dishes" className="text-sm text-blue-600 hover:underline">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {popularDishes.map((dish) => (
                  <div key={dish.id} className="flex items-center">
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium">{dish.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        <span>{dish.orders} đơn</span>
                        <div className="mx-2">•</div>
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 text-yellow-500 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          <span className="ml-1">{dish.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's schedule */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Lịch hôm nay</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">10:00 - Kiểm tra hàng tồn kho</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">14:00 - Họp nhân viên</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">16:30 - Cập nhật thực đơn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
