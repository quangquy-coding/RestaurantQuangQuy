"use client";
import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAllOrdersByCustomer,
  updateOrderFoodStatus,
} from "../../api/orderApi";
import { getAllDanhGia, themDanhGia } from "../../api/danhGiaApi";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    maKhachHang: "",
    maHoaDon: "",
    noiDungPhanHoi: "",
    xepHang: 5,
    hinhAnhDanhGia: "",
    preview: "", // Added for image preview
  });
  const [imageFile, setImageFile] = useState(null);

  const StarDisplay = ({ value }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          fill={value >= star ? "#facc15" : "none"}
          stroke="#facc15"
          style={{ width: 20, height: 20, marginRight: 2 }}
        />
      ))}
    </div>
  );

  const StarRating = ({ value, onChange }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: "pointer" }}
          onClick={() => onChange(star)}
        >
          <Star
            fill={value >= star ? "#facc15" : "none"}
            stroke="#facc15"
            style={{ width: 24, height: 24 }}
          />
        </span>
      ))}
    </div>
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, selectedStatus, orders]);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem("usersId");
      if (!userId) return;
      setLoading(true);
      setError(null);
      const [ordersData, reviewsData] = await Promise.all([
        getAllOrdersByCustomer(userId),
        getAllDanhGia(),
      ]);

      console.log("Raw API response:", ordersData);

      // Map orders to match expected structure
      const mappedOrders = ordersData.map((order) => {
        console.log("Processing order:", order);
        return {
          id: order.maHoaDon || order.id,
          customerName: order.tenKhachHang || order.customerName,
          customerId: order.maKhachHang || order.customerId,
          orderDate: order.ngayDat || order.orderDate,
          total: order.tongTien || order.total,
          paymentMethod: order.phuongThucThanhToan || order.paymentMethod,
          status: order.trangThai || order.status,
          tables: order.banList || order.tables || [],
          items: order.chiTietDonHang || order.items || [],
          orderInfo: {
            maDatMon: order.maDatMon || order.orderInfo?.maDatMon,
            trangThai: order.trangThai || order.orderInfo?.trangThai,
          },
        };
      });

      console.log("Mapped orders:", mappedOrders);
      setOrders(mappedOrders);
      setFilteredOrders(mappedOrders);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      toast.error("Lỗi tải dữ liệu!");
      setOrders([]);
      setFilteredOrders([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const orderId = order.id?.toString().toLowerCase() || '';
        const customerName = order.customerName?.toLowerCase() || '';
        const tableNames = order.tables?.map(table => table.tenBan?.toLowerCase() || '').join(' ') || '';
        
        return orderId.includes(searchLower) || 
               customerName.includes(searchLower) || 
               tableNames.includes(searchLower);
      });
    }

    // Lọc theo trạng thái
    if (selectedStatus) {
      filtered = filtered.filter((order) => {
        const orderStatus = order.orderInfo?.trangThai || order.status;
        return orderStatus?.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    setFilteredOrders(filtered);
  };

  const openViewModal = (order) => {
    setCurrentOrder(order);
    setIsViewModalOpen(true);
  };

  const openReviewModal = (order) => {
    if (!order.customerId) {
      toast.error("Không thể đánh giá: Thiếu thông tin khách hàng.");
      return;
    }
    setCurrentOrder(order);
    setReviewForm({
      maKhachHang: order.customerId,
      maHoaDon: order.id,
      noiDungPhanHoi: "",
      xepHang: 5,
      hinhAnhDanhGia: "",
      preview: "",
    });
    setImageFile(null);
    setIsReviewModalOpen(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Không có file được chọn.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một file hình ảnh hợp lệ.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "demo_preset"); // Replace with your Cloudinary preset

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dlozjvjhf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setReviewForm((prev) => ({
          ...prev,
          hinhAnhDanhGia: data.secure_url,
          preview: data.secure_url,
        }));
        setImageFile(file);
      } else {
        toast.error(
          "Lỗi upload ảnh lên Cloudinary: " +
            (data.error?.message || "Unknown error")
        );
      }
    } catch (err) {
      toast.error("Lỗi upload ảnh lên Cloudinary");
      console.error("Cloudinary upload error:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.maKhachHang) {
      toast.error("Thiếu thông tin khách hàng.");
      return;
    }
    if (!reviewForm.maHoaDon) {
      toast.error("Mã hóa đơn không hợp lệ.");
      return;
    }
    try {
      const reviewData = {
        maKhachHang: reviewForm.maKhachHang,
        maHoaDon: reviewForm.maHoaDon,
        noiDungPhanHoi: reviewForm.noiDungPhanHoi,
        xepHang: parseInt(reviewForm.xepHang), // Ensure xepHang is an integer
        hinhAnhDanhGia: reviewForm.hinhAnhDanhGia || null, // Send null if no image
      };
      await themDanhGia(reviewData);
      toast.success("Gửi đánh giá thành công!");
      setIsReviewModalOpen(false);
      setReviewForm({
        maKhachHang: "",
        maHoaDon: "",
        noiDungPhanHoi: "",
        xepHang: 5,
        hinhAnhDanhGia: "",
        preview: "",
      });
      setImageFile(null);
      await fetchData();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(`Lỗi khi gửi đánh giá: ${error.message}`);
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      console.log("Order data:", order);

      toast((t) => (
        <div className="flex flex-col items-center">
          <p className="mb-4">Bạn có chắc chắn muốn hủy đơn hàng này?</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => {
                toast.dismiss(t.id);
                confirmCancelOrder(order);
              }}
            >
              Xác nhận
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: "top-center",
      });

    } catch (error) {
      console.error("Error cancelling order:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  const confirmCancelOrder = async (order) => {
    try {
      // Lấy mã đặt món từ orderInfo
      const orderId = order.orderInfo?.maDatMon;

      if (!orderId) {
        console.error("Không tìm thấy mã đặt món trong đơn hàng");
        toast.error("Không thể hủy đơn hàng: Thiếu thông tin mã đặt món");
        return;
      }

      console.log("Using order ID for cancellation:", orderId);

      await updateOrderFoodStatus(orderId, "cancelled");
      console.log("Order cancelled successfully");
      toast.success("Hủy đơn hàng thành công!");

      // Refresh data after cancellation
      await fetchData();
    } catch (error) {
      console.error("Error in confirmCancelOrder:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng");
    }
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

  const getStatusBadge = (status, order) => {
    // Kiểm tra cả status chính và status trong orderInfo
    const orderStatus = order.orderInfo?.trangThai || status;

    // Nếu status là null hoặc undefined, trả về pending
    if (!orderStatus) {
      return (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Chờ xử lý
          </span>
          <button
            onClick={() => handleCancelOrder(order)}
            className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
          >
            Hủy đơn
          </button>
        </div>
      );
    }

    // Chuyển status về chữ thường để so sánh
    const normalizedStatus = orderStatus.toLowerCase().trim();

    // Kiểm tra nếu đơn hàng đã bị hủy
    if (normalizedStatus === "cancelled" || normalizedStatus === "đã hủy") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Đã hủy
        </span>
      );
    }

    switch (normalizedStatus) {
      case "pending":
      case "chờ xử lý":
      case "chờ xử lí":
        return (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              Chờ xử lý
            </span>
            <button
              onClick={() => handleCancelOrder(order)}
              className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
            >
              Hủy đơn
            </button>
          </div>
        );
      case "processing":
      case "đang xử lý":
      case "đang xử lí":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Đang xử lý
          </span>
        );
      case "completed":
      case "hoàn thành":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Hoàn thành
          </span>
        );
      default:
        // Nếu không khớp với bất kỳ trạng thái nào, mặc định là pending
        return (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              Chờ xử lý
            </span>
            <button
              onClick={() => handleCancelOrder(order)}
              className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
            >
              Hủy đơn
            </button>
          </div>
        );
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "Tiền mặt";
      case "vnpay":
        return "VNPay";
      default:
        return method || "Không xác định";
    }
  };

  const getOrderReview = (orderId) => {
    return reviews.find((review) => review.maHoaDon === orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <p className="text-red-600 text-xl font-semibold">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
            Đơn hàng của tôi
          </h1>
          {/* <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Làm mới
          </button> */}
        </div>

        {/* Search and filter */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, khách hàng, bàn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600 text-lg font-medium">
              {orders.length === 0
                ? "Chưa có đơn hàng nào"
                : "Không tìm thấy đơn hàng phù hợp"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const review = getOrderReview(order.id);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Đơn hàng #{order.id}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        Khách hàng: {order.customerName}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status, order)}
                      <div className="text-xl font-bold text-gray-900 mt-2">
                        {order.total?.toLocaleString("vi-VN")} VNĐ
                      </div>
                      {review && (
                        <div className="flex items-center justify-end mt-2">
                          <StarDisplay value={review.xepHang} />
                          <span className="text-sm text-gray-600 ml-2">
                            {review.xepHang} / 5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1.5 text-indigo-600" />
                      {order.tables?.length > 0 ? (
                        order.tables.map((table) => table.tenBan).join(", ")
                      ) : (
                        <span className="text-amber-600 italic">
                          Chưa gán bàn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 mr-1.5 text-indigo-600" />
                      <span>{getPaymentMethodText(order.paymentMethod)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">
                          {order.items?.length || 0} món •{" "}
                          {order.items?.reduce(
                            (sum, item) => sum + (item.quantity || 0),
                            0
                          ) || 0}{" "}
                          phần
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openViewModal(order)}
                          className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            type="button"
                            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Hủy đơn
                          </button>
                        )}
                        {order.status === "completed" && !review && (
                          <button
                            onClick={() => openReviewModal(order)}
                            type="button"
                            className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Order Modal */}
        {isViewModalOpen && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết đơn hàng #{currentOrder.id}
                </h2>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Thông tin đơn hàng
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-3">
                        <span className="font-medium text-gray-700 mr-2">
                          Khách hàng:
                        </span>
                        <span>{currentOrder.customerName}</span>
                      </div>
                      <div className="flex items-center mb-3">
                        <Calendar className="h-4 w-4 text-indigo-500 mr-2" />
                        <span>{formatDate(currentOrder.orderDate)}</span>
                      </div>
                      <div className="flex items-center mb-3">
                        <MapPin className="h-4 w-4 text-indigo-500 mr-2" />
                        {currentOrder.tables?.length > 0 ? (
                          currentOrder.tables
                            .map((table) => table.tenBan)
                            .join(", ")
                        ) : (
                          <span className="text-amber-600 italic">
                            Chưa gán bàn
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">
                          Trạng thái:
                        </span>
                        {getStatusBadge(currentOrder.status, currentOrder)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Thông tin thanh toán
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-3">
                        <span className="font-medium text-gray-700 mr-2">
                          Phương thức thanh toán:
                        </span>
                        <span>
                          {getPaymentMethodText(currentOrder.paymentMethod)}
                        </span>
                      </div>
                      <div className="flex items-center mb-3">
                        <span className="font-medium text-gray-700 mr-2">
                          Trạng thái thanh toán:
                        </span>
                        <span className="text-green-600 font-semibold">
                          {currentOrder.status === "completed"
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="font-bold text-xl text-gray-900">
                          {currentOrder.total?.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-500 mb-3">
                  Các món đã đặt
                </h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Món ăn
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Đơn giá
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentOrder.items?.map((item) => (
                        <tr
                          key={item.id || item.maMon}
                          className="hover:bg-gray-100"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.name || item.tenMon}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">
                            {item.quantity || item.soLuong}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">
                            {(item.price || item.donGia)?.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                            {(
                              (item.quantity || item.soLuong) *
                              (item.price || item.donGia)
                            )?.toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-sm font-semibold text-gray-900 text-right"
                        >
                          Tổng cộng:
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          {currentOrder.total?.toLocaleString("vi-VN")} VNĐ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {getOrderReview(currentOrder.id) && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">
                      Đánh giá
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-3">
                        {getOrderReview(currentOrder.id).avatar ? (
                          <img
                            src={getOrderReview(currentOrder.id).avatar}
                            alt="Customer avatar"
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/40";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span className="text-gray-600 text-sm">
                              {getOrderReview(currentOrder.id)
                                .tenKhachHang?.[0] || "K"}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center">
                            <StarDisplay
                              value={getOrderReview(currentOrder.id).xepHang}
                            />
                            <span className="font-medium ml-2">
                              {getOrderReview(currentOrder.id).xepHang} / 5
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Đánh giá bởi:{" "}
                            {getOrderReview(currentOrder.id).tenKhachHang}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getOrderReview(currentOrder.id).noiDungPhanHoi}
                      </p>
                      {getOrderReview(currentOrder.id).hinhAnhDanhGia && (
                        <img
                          src={getOrderReview(currentOrder.id).hinhAnhDanhGia}
                          alt="Review image"
                          className="mt-3 w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      )}
                      <div className="text-sm text-gray-500 mt-2">
                        Ngày:{" "}
                        {formatDate(
                          getOrderReview(currentOrder.id).ngayDanhGia
                        )}
                      </div>
                      {getOrderReview(currentOrder.id).phanHoiDanhGia && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Phản hồi từ nhà hàng
                          </h4>
                          <p className="text-sm text-gray-600">
                            {getOrderReview(currentOrder.id).phanHoiDanhGia}
                          </p>
                          <div className="text-sm text-gray-500 mt-2">
                            Ngày: {formatDate(new Date().toISOString())}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setCurrentOrder(null);
                    setIsViewModalOpen(false);
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Đánh giá đơn hàng #{currentOrder.id}
                </h2>
              </div>
              <form onSubmit={handleReviewSubmit} className="p-8">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Khách hàng
                  </label>
                  <input
                    type="text"
                    value={currentOrder.customerName}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm đánh giá
                  </label>
                  <StarRating
                    value={reviewForm.xepHang}
                    onChange={(val) =>
                      setReviewForm({ ...reviewForm, xepHang: val })
                    }
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {reviewForm.xepHang} sao
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nội dung đánh giá
                  </label>
                  <textarea
                    value={reviewForm.noiDungPhanHoi}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        noiDungPhanHoi: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    rows="5"
                    placeholder="Nhập nội dung đánh giá..."
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hình ảnh (tùy chọn)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />
                  {reviewForm.preview && (
                    <div className="mt-2">
                      <img
                        src={reviewForm.preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {imageFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Đã chọn: {imageFile.name}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
