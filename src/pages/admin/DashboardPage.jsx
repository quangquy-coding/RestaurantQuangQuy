import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Coffee,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import axios from "axios";

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [popularDishes, setPopularDishes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:5080/api/ReportManager";
  const API_MONAN_URL = "http://localhost:5080/api/MonAnManager";
  const API_ORDER_URL = "http://localhost:5080/api/OrderManagement/all";

  // Hàm kiểm tra an toàn URL hình ảnh
  function getSafeImageSrc(src) {
    if (!src) return "/placeholder.svg?height=40&width=40";
    // Nếu là URL tương đối, thêm prefix
    if (src.startsWith("/")) {
      return `http://localhost:5080${src}`;
    }
    return src;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchWithErrorHandling = async (url, name) => {
          try {
            const response = await axios.get(url);
            return response.data;
          } catch (err) {
            console.error(
              `Error fetching ${name}:`,
              err.response?.data || err.message
            );
            return null;
          }
        };

        const [overviewData, popularDishesData, allDishesData, ordersData] =
          await Promise.all([
            fetchWithErrorHandling(`${API_BASE_URL}/TongQuan`, "TongQuan"),
            fetchWithErrorHandling(
              `${API_BASE_URL}/MonAnBanChay?top=4`,
              "MonAnBanChay"
            ),
            fetchWithErrorHandling(API_MONAN_URL, "MonAnManager"),
            fetchWithErrorHandling(API_ORDER_URL, "OrderManagement"),
          ]);

        if (
          !overviewData &&
          !popularDishesData &&
          !allDishesData &&
          !ordersData
        ) {
          throw new Error("Tất cả API call đều thất bại");
        }

        // Map overview data
        const summary = overviewData
          ? {
              revenue: {
                current: overviewData.doanhThuThangNay || 0,
                previous: overviewData.doanhThuThangTruoc || 0,
                percentChange: overviewData.tyLeTangTruong || 0,
              },
              orders: {
                current: overviewData.donHangHomNay || 0,
                previous: 0,
                percentChange: 0,
              },
              customers: {
                current: overviewData.tongKhachHang || 0,
                previous: 0,
                percentChange: 0,
              },
              dishes: {
                current: overviewData.tongMonAn || 0,
                previous: 0,
                percentChange: 0,
              },
            }
          : null;

        // Create a map for all dishes to lookup hinhAnh
        const dishImageMap = new Map();
        allDishesData?.forEach((dish) => {
          dishImageMap.set(dish.maMon, dish.hinhAnh);
        });

        // Map popular dishes with images
        const popularDishesMapped = popularDishesData?.monAnBanChay
          ? popularDishesData.monAnBanChay.map((item) => ({
              id: item.maMon,
              name: item.tenMon,
              orders: item.soLuongBan,
              rating: overviewData?.danhGiaTrungBinh || 4.5,
              image: getSafeImageSrc(dishImageMap.get(item.maMon)),
            }))
          : [];

        // Map recent orders (top 10)
        const recentOrdersMapped = ordersData
          ? ordersData
              .slice(0, 10) // Take top 10
              .map((order) => ({
                id: order.id,
                customer: order.customerName,
                items: order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                ),
                total: order.total,
                status: order.status,
                time: formatRelativeTime(new Date(order.orderDate)),
              }))
          : [];

        setSummaryData(summary);
        setPopularDishes(popularDishesMapped);
        setRecentOrders(recentOrdersMapped);
        setLoading(false);

        if (
          !overviewData ||
          !popularDishesData ||
          !allDishesData ||
          !ordersData
        ) {
          setError("Một số dữ liệu không tải được. Vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = (now - date) / 1000; // seconds
    if (diff < 60) return `${Math.floor(diff)} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "deposit":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "deposit":
        return "Đang chuẩn bị";
      case "pending":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Tổng quan</h1>

      {error && <div className="mb-6 text-red-500 text-center">{error}</div>}

      {/* Summary cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Tổng doanh thu tháng này
                </p>
                <h2 className="text-2xl font-bold">
                  {formatCurrency(summaryData.revenue.current)}
                </h2>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    summaryData.revenue.percentChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summaryData.revenue.percentChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {Math.abs(summaryData.revenue.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">so với tháng trước</span>
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
                <p className="text-sm text-gray-500 mb-1">
                  Tổng đơn hàng hôm nay
                </p>
                <h2 className="text-2xl font-bold">
                  {summaryData.orders.current}
                </h2>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    summaryData.orders.percentChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summaryData.orders.percentChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {Math.abs(summaryData.orders.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">so với hôm qua</span>
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
                <h2 className="text-2xl font-bold">
                  {summaryData.customers.current}
                </h2>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    summaryData.customers.percentChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summaryData.customers.percentChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {Math.abs(summaryData.customers.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">so với trước đó</span>
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
                <h2 className="text-2xl font-bold">
                  {summaryData.dishes.current}
                </h2>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    summaryData.dishes.percentChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summaryData.dishes.percentChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {Math.abs(summaryData.dishes.percentChange).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">so với trước đó</span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Coffee className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
              <Link
                to="/admin/orders"
                className="text-sm text-blue-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số món
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.items}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(order.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.time}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không có đơn hàng gần đây
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side content */}
        <div className="space-y-6">
          {/* Popular dishes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Món ăn phổ biến</h2>
                <Link
                  to="/admin/dishes"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-6">
              {popularDishes.length > 0 ? (
                <div className="space-y-4">
                  {popularDishes.map((dish) => (
                    <div key={dish.id} className="flex items-center">
                      <img
                        src={getSafeImageSrc(dish.image)}
                        alt={dish.name}
                        className="h-10 w-10 rounded object-cover"
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
              ) : (
                <p className="text-gray-500 text-center">
                  Không có món ăn phổ biến
                </p>
              )}
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
                    <p className="text-sm font-medium">
                      10:00 - Kiểm tra hàng tồn kho
                    </p>
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
                    <p className="text-sm font-medium">
                      16:30 - Cập nhật thực đơn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
