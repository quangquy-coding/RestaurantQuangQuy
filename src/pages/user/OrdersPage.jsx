"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import React from "react"
// Mock data for orders
const mockOrders = [
  {
    id: "OD123456",
    date: "2023-06-15T18:30:00",
    status: "completed",
    total: 450000,
    items: [
      { id: 1, name: "Phở bò tái", quantity: 2, price: 85000 },
      { id: 2, name: "Gỏi cuốn tôm thịt", quantity: 3, price: 65000 },
      { id: 3, name: "Trà đào cam sả", quantity: 2, price: 35000 },
    ],
  },
  {
    id: "OD123457",
    date: "2023-06-10T19:15:00",
    status: "completed",
    total: 380000,
    items: [
      { id: 1, name: "Cơm rang hải sản", quantity: 2, price: 95000 },
      { id: 2, name: "Chè khúc bạch", quantity: 2, price: 45000 },
      { id: 3, name: "Cà phê sữa đá", quantity: 2, price: 30000 },
    ],
  },
  {
    id: "OD123458",
    date: "2023-06-05T20:00:00",
    status: "processing",
    total: 520000,
    items: [
      { id: 1, name: "Bún chả Hà Nội", quantity: 3, price: 75000 },
      { id: 2, name: "Bánh xèo", quantity: 1, price: 80000 },
      { id: 3, name: "Trà đào cam sả", quantity: 4, price: 35000 },
    ],
  },
  {
    id: "OD123459",
    date: "2023-05-28T17:45:00",
    status: "cancelled",
    total: 290000,
    items: [
      { id: 1, name: "Phở bò tái", quantity: 2, price: 85000 },
      { id: 2, name: "Cà phê sữa đá", quantity: 4, price: 30000 },
    ],
  },
]

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch orders from an API
    setOrders(mockOrders)
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  return (
    <div className="py-16 bg-red-50 min-h-screen">
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Đơn hàng của tôi</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Theo dõi và quản lý các đơn hàng của bạn</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Bạn chưa có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">Hãy khám phá thực đơn của chúng tôi và đặt món ngay!</p>
              <Link
                to="/menu"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Xem thực đơn
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-row sm:justify-between sm:items-center">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center">
                          <h2 className="text-lg font-bold mr-3">Đơn hàng #{order.id}</h2>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{formatDate(order.date)}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4">
                          <p className="text-sm text-gray-600">Tổng tiền:</p>
                          <p className="font-bold">{order.total.toLocaleString("vi-VN")} ₫</p>
                        </div>
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-medium mb-3">Các món đã đặt:</h3>
                    <ul className="space-y-2">
                      {order.items.slice(0, 2).map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li className="text-gray-600 text-sm">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            Xem thêm {order.items.length - 2} món khác <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>

                  {order.status === "processing" && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <button className="px-4 py-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50">
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng:</p>
                  <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                </div>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <h3 className="font-bold mb-3">Các món đã đặt:</h3>
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600 text-sm">
                      <th className="pb-2">Món ăn</th>
                      <th className="pb-2 text-center">Số lượng</th>
                      <th className="pb-2 text-right">Đơn giá</th>
                      <th className="pb-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">{item.name}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">{item.price.toLocaleString("vi-VN")} ₫</td>
                        <td className="py-3 text-right">{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="pt-4 text-right font-bold">
                        Tổng cộng:
                      </td>
                      <td className="pt-4 text-right font-bold">{selectedOrder.total.toLocaleString("vi-VN")} ₫</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                  <p className="font-medium">Tiền mặt</p>
                </div>
                {selectedOrder.status === "processing" && (
                  <button className="px-4 py-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50">
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
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
