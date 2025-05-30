"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";
import { getOrdersByCustomerId } from "../../api/orderApi";

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ localStorage hoặc context
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.maKhachHang || user.id || "KH001"; // Fallback
      }
      return "KH001"; // Default customer ID
    } catch (error) {
      console.error("Error getting current user:", error);
      return "KH001";
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, selectedStatus, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const customerId = getCurrentUser();
      const data = await getOrdersByCustomerId(customerId);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Không hiển thị alert để tránh làm phiền user
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.tableNumber &&
            order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  };

  const openViewModal = (order) => {
    setCurrentOrder(order);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getStatusBadge = (status) => {
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

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "card":
        return "Thẻ tín dụng/ghi nợ";
      case "ewallet":
        return "Ví điện tử";
      default:
        return method;
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
        <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng, bàn..."
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
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {orders.length === 0
              ? "Bạn chưa có đơn hàng nào"
              : "Không tìm thấy đơn hàng phù hợp"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Đơn hàng #{order.id}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(order.orderDate)}</span>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {order.total.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{order.tableNumber || "Chưa gán bàn"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">
                      {order.items.length} món •{" "}
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      phần
                    </span>
                  </div>
                  <button
                    onClick={() => openViewModal(order)}
                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                Chi tiết đơn hàng #{currentOrder.id}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Thông tin đơn hàng
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{formatDate(currentOrder.orderDate)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{currentOrder.tableNumber || "Chưa gán bàn"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Trạng thái:</span>
                      {getStatusBadge(currentOrder.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Thông tin thanh toán
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Phương thức:</span>
                      <span>
                        {getPaymentMethodText(currentOrder.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-lg">
                        {currentOrder.total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Các món đã đặt
              </h3>
              <div className="bg-gray-50 rounded-md overflow-hidden">
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
    </div>
  );
};

export default UserOrdersPage;
