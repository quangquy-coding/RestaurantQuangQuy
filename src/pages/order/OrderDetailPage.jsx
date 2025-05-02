import React from "react"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Clock, CheckCircle, XCircle, Star, MessageSquare } from "lucide-react"

// Mock data for orders
const mockOrders = {
  12345: {
    id: "12345",
    status: "Đang chuẩn bị",
    tableNumber: "5",
    createdAt: "2023-05-15T14:30:00",
    estimatedTime: 25,
    items: [
      {
        id: 1,
        name: "Phở bò tái",
        price: 85000,
        quantity: 2,
        subtotal: 170000,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 2,
        name: "Gỏi cuốn tôm thịt",
        price: 65000,
        quantity: 1,
        subtotal: 65000,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 8,
        name: "Cà phê sữa đá",
        price: 35000,
        quantity: 2,
        subtotal: 70000,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    subtotal: 305000,
    tax: 30500,
    total: 335500,
    note: "Không hành cho phở, cà phê ít đá",
    paymentMethod: "Tiền mặt",
    paymentStatus: "Chưa thanh toán",
    customer: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
    },
  },
  23456: {
    id: "23456",
    status: "Hoàn thành",
    tableNumber: "8",
    createdAt: "2023-05-14T19:15:00",
    completedAt: "2023-05-14T19:45:00",
    items: [
      {
        id: 3,
        name: "Cơm rang hải sản",
        price: 95000,
        quantity: 1,
        subtotal: 95000,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 7,
        name: "Bánh xèo",
        price: 80000,
        quantity: 1,
        subtotal: 80000,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 5,
        name: "Nước ép cam",
        price: 45000,
        quantity: 2,
        subtotal: 90000,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    subtotal: 265000,
    tax: 26500,
    total: 291500,
    note: "",
    paymentMethod: "Thẻ tín dụng",
    paymentStatus: "Đã thanh toán",
    customer: {
      name: "Trần Thị B",
      phone: "0912345678",
    },
    review: {
      rating: 4.5,
      comment: "Món ăn ngon, phục vụ nhanh. Sẽ quay lại lần sau.",
      createdAt: "2023-05-14T20:30:00",
    },
  },
}

const OrderDetailPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [review, setReview] = useState({
    rating: 5,
    comment: "",
  })

  useEffect(() => {
    // In a real app, you would fetch order data from an API
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const orderData = mockOrders[id]
      setOrder(orderData)
      setLoading(false)
    }, 500)
  }, [id])

  const handleReviewSubmit = (e) => {
    e.preventDefault()

    // In a real app, you would send the review to an API
    // For now, we'll just update the local state
    const updatedOrder = {
      ...order,
      review: {
        ...review,
        createdAt: new Date().toISOString(),
      },
    }

    setOrder(updatedOrder)
    setShowReviewForm(false)
  }

  const handleRatingChange = (rating) => {
    setReview({
      ...review,
      rating,
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
        <Link to="/orders" className="text-blue-600 hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <Link to="/orders" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại danh sách đơn hàng
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Đơn hàng #{order.id}</h1>
                <p className="text-gray-600">Đặt lúc: {formatDate(order.createdAt)}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 ${getStatusColor(order.status)}`}
              >
                {order.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Thông tin đơn hàng</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bàn số</p>
                      <p className="font-medium">{order.tableNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                      <div className="flex items-center">
                        {order.paymentStatus === "Đã thanh toán" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={order.paymentStatus === "Đã thanh toán" ? "text-green-600" : "text-red-600"}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    {order.status === "Đang chuẩn bị" && (
                      <div>
                        <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-1" />
                          <span>{order.estimatedTime} phút</span>
                        </div>
                      </div>
                    )}
                    {order.completedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Hoàn thành lúc</p>
                        <p className="font-medium">{formatDate(order.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-2">Thông tin khách hàng</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium">{order.customer.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {order.note && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Ghi chú</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>{order.note}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Các món đã đặt</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Món ăn
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
                        Số lượng
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {item.subtotal.toLocaleString("vi-VN")} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{order.subtotal.toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Thuế (10%):</span>
                <span>{order.tax.toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span>{order.total.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review section */}
        {order.status === "Hoàn thành" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Đánh giá</h2>

              {order.review ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= order.review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 text-sm">{formatDate(order.review.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{order.review.comment}</p>
                </div>
              ) : showReviewForm ? (
                <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Nhận xét
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Gửi đánh giá
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Viết đánh giá
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetailPage
