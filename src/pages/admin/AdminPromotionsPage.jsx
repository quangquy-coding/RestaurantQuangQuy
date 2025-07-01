import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { Edit, Trash2, Search, Eye } from "lucide-react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState({
    maKhuyenMai: null,
    tenKhuyenMai: "",
    mucTienToiThieu: "",
    tyLeGiamGia: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    trangThai: "Hoạt động",
    soHoaDonSuDung: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkPromoCode, setCheckPromoCode] = useState("");
  const [checkTotalAmount, setCheckTotalAmount] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [promotionDetail, setPromotionDetail] = useState(null);
  const role = localStorage.getItem("role");
  const isAdmin =
    role === "Admin" ||
    role === "admin" ||
    role === "Q001" ||
    role === "Quản trị viên";

  // Base URL của API
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/KhuyenMaiManager`;

  // Hàm chuyển đổi DateOnly sang định dạng yyyy-MM-dd
  const formatDateForInput = (dateOnly) => {
    if (!dateOnly) return "";
    const [year, month, day] = dateOnly.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Hàm chuyển đổi định dạng ngày từ yyyy-MM-dd sang DateOnly
  const formatDateToDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  // Lấy danh sách khuyến mãi
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          filterStatus === "active"
            ? `${API_BASE_URL}/KhuyenMaiHoatDong`
            : `${API_BASE_URL}`
        );
        setPromotions(response.data);
      } catch (error) {
        toast.error(
          `Lỗi: ${error.response?.data || "Không thể lấy danh sách khuyến mãi"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [filterStatus]);

  // Mở modal để thêm hoặc sửa khuyến mãi
  const handleOpenModal = async (promotion = null) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được thêm hoặc sửa khuyến mãi",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    if (promotion) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/${promotion.maKhuyenMai}`
        );
        const data = response.data;
        setCurrentPromotion({
          maKhuyenMai: data.maKhuyenMai,
          tenKhuyenMai: data.tenKhuyenMai,
          mucTienToiThieu: data.mucTienToiThieu,
          tyLeGiamGia: data.tyLeGiamGia,
          ngayBatDau: formatDateForInput(data.ngayBatDau),
          ngayKetThuc: formatDateForInput(data.ngayKetThuc),
          trangThai: data.trangThai,
          soHoaDonSuDung: data.soHoaDonSuDung,
        });
        setIsEditing(true);
      } catch (error) {
        toast.error(
          `Lỗi: ${error.response?.data || "Không thể lấy thông tin khuyến mãi"}`
        );
      }
    } else {
      setCurrentPromotion({
        maKhuyenMai: null,
        tenKhuyenMai: "",
        mucTienToiThieu: "",
        tyLeGiamGia: "",
        ngayBatDau: "",
        ngayKetThuc: "",
        trangThai: "Hoạt động",
        soHoaDonSuDung: 0,
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCheckResult(null);
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPromotion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gửi dữ liệu thêm hoặc sửa khuyến mãi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được thêm hoặc sửa khuyến mãi",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    const promotionData = {
      tenKhuyenMai: currentPromotion.tenKhuyenMai,
      mucTienToiThieu: parseFloat(currentPromotion.mucTienToiThieu) || 0,
      tyLeGiamGia: parseFloat(currentPromotion.tyLeGiamGia) || 0,
      ngayBatDau: formatDateToDateOnly(currentPromotion.ngayBatDau),
      ngayKetThuc: formatDateToDateOnly(currentPromotion.ngayKetThuc),
      trangThai: currentPromotion.trangThai,
    };

    try {
      if (isEditing) {
        const response = await axios.put(
          `${API_BASE_URL}/${currentPromotion.maKhuyenMai}`,
          promotionData
        );
        setPromotions((prev) =>
          prev.map((p) =>
            p.maKhuyenMai === currentPromotion.maKhuyenMai
              ? { ...p, ...promotionData }
              : p
          )
        );
        toast.success(response.data.message);
      } else {
        const response = await axios.post(`${API_BASE_URL}`, promotionData);
        setPromotions((prev) => [
          ...prev,
          { ...promotionData, maKhuyenMai: response.data.maKhuyenMai },
        ]);
        toast.success(response.data.message);
      }
      handleCloseModal();
    } catch (error) {
      toast.error(`Lỗi: ${error.response?.data || "Thao tác thất bại"}`);
    }
  };

  // Xóa khuyến mãi
  const handleDeletePromotion = async (id) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được xóa khuyến mãi",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa khuyến mãi này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        setPromotions((prev) => prev.filter((p) => p.maKhuyenMai !== id));
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: response.data.message || "Xóa khuyến mãi thành công.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data || "Xóa khuyến mãi thất bại",
        });
      }
    }
  };

  // Tìm kiếm khuyến mãi
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Kiểm tra mã khuyến mãi
  const handleCheckPromo = async (e) => {
    e.preventDefault();
    if (!checkPromoCode || !checkTotalAmount) {
      toast.error("Vui lòng nhập mã khuyến mãi và tổng tiền đơn hàng");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/KiemTraKhuyenMai/${checkPromoCode}?tongTien=${parseFloat(
          checkTotalAmount
        )}`
      );
      setCheckResult(response.data);
      toast.success("Kiểm tra mã khuyến mãi thành công!");
    } catch (error) {
      setCheckResult(null);
      toast.error(
        `Lỗi: ${error.response?.data || "Kiểm tra mã khuyến mãi thất bại"}`
      );
    }
  };

  // Hàm mở modal xem chi tiết khuyến mãi
  const handleViewDetail = (promotion) => {
    setPromotionDetail(promotion);
    setIsDetailModalOpen(true);
  };

  // Lọc khuyến mãi theo trạng thái và tìm kiếm
  const filteredPromotions = promotions.filter(
    (p) =>
      (filterStatus === "all" ||
        (filterStatus === "active"
          ? p.trangThai === "Hoạt động"
          : p.trangThai !== "Hoạt động")) &&
      (p.tenKhuyenMai.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.maKhuyenMai.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Thêm state phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Quản lý khuyến mãi
      </h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Trạng thái
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm khuyến mãi..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Check Promotion Code */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Kiểm tra mã khuyến mãi
        </h3>
        <form onSubmit={handleCheckPromo} className="flex flex-wrap gap-4">
          <div>
            <label
              htmlFor="checkPromoCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mã khuyến mãi
            </label>
            <input
              type="text"
              id="checkPromoCode"
              value={checkPromoCode}
              onChange={(e) => setCheckPromoCode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mã khuyến mãi"
            />
          </div>
          <div>
            <label
              htmlFor="checkTotalAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tổng tiền đơn hàng (VNĐ)
            </label>
            <input
              type="number"
              id="checkTotalAmount"
              value={checkTotalAmount}
              onChange={(e) => setCheckTotalAmount(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tổng tiền"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-6"
          >
            Kiểm tra
          </button>
        </form>
        {checkResult && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <p>
              <strong>Khuyến mãi:</strong> {checkResult.tenKhuyenMai}
            </p>
            <p>
              <strong>Tỷ lệ giảm giá:</strong> {checkResult.tyLeGiamGia}%
            </p>
            <p>
              <strong>Tiền giảm:</strong>{" "}
              {checkResult.tienGiam.toLocaleString()} VNĐ
            </p>
            <p>
              <strong>Tổng tiền sau giảm:</strong>{" "}
              {checkResult.tongTienSauGiam.toLocaleString()} VNĐ
            </p>
          </div>
        )}
      </div>

      {/* Promotions Chart */}
      {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Thống kê sử dụng khuyến mãi
        </h3>
        <div className="h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div> */}

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách khuyến mãi
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm khuyến mãi
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khuyến mãi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sử dụng
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPromotions.map((promotion) => (
                <motion.tr
                  key={promotion.maKhuyenMai}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {promotion.tenKhuyenMai}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-md">
                      {promotion.maKhuyenMai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promotion.tyLeGiamGia}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {promotion.mucTienToiThieu.toLocaleString()}đ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(promotion.ngayBatDau).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      đến{" "}
                      {new Date(promotion.ngayKetThuc).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promotion.soHoaDonSuDung}
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promotion.trangThai === "Hoạt động"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {promotion.trangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(promotion)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(promotion)}
                      className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                      title="Sửa"
                      disabled={!isAdmin}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeletePromotion(promotion.maKhuyenMai)
                      }
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                      title="Xóa"
                      disabled={!isAdmin}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Phân trang dưới bảng */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 px-6 py-3 border-t">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md border ${
                  page === currentPage
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mr-50">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="tenKhuyenMai"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên khuyến mãi
                  </label>
                  <input
                    type="text"
                    id="tenKhuyenMai"
                    name="tenKhuyenMai"
                    value={currentPromotion.tenKhuyenMai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="mucTienToiThieu"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Giá trị đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    id="mucTienToiThieu"
                    name="mucTienToiThieu"
                    value={currentPromotion.mucTienToiThieu}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tyLeGiamGia"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tỷ lệ giảm giá (%)
                  </label>
                  <input
                    type="number"
                    id="tyLeGiamGia"
                    name="tyLeGiamGia"
                    value={currentPromotion.tyLeGiamGia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ngayBatDau"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    id="ngayBatDau"
                    name="ngayBatDau"
                    value={currentPromotion.ngayBatDau}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="ngayKetThuc"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="ngayKetThuc"
                    name="ngayKetThuc"
                    value={currentPromotion.ngayKetThuc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="trangThai"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="trangThai"
                    name="trangThai"
                    value={currentPromotion.trangThai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Không hoạt động">Không hoạt động</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết khuyến mãi */}
      {isDetailModalOpen && promotionDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
              Chi tiết khuyến mãi
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">
                  Tên khuyến mãi:{" "}
                </span>
                <span>{promotionDetail.tenKhuyenMai}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Mã khuyến mãi:{" "}
                </span>
                <span>{promotionDetail.maKhuyenMai}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Tỷ lệ giảm giá:{" "}
                </span>
                <span>{promotionDetail.tyLeGiamGia}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Giá trị đơn hàng tối thiểu:{" "}
                </span>
                <span>
                  {promotionDetail.mucTienToiThieu.toLocaleString()} VNĐ
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Thời gian áp dụng:{" "}
                </span>
                <span>
                  {new Date(promotionDetail.ngayBatDau).toLocaleDateString(
                    "vi-VN"
                  )}{" "}
                  -{" "}
                  {new Date(promotionDetail.ngayKetThuc).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Trạng thái: </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    promotionDetail.trangThai === "Hoạt động"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {promotionDetail.trangThai}
                </span>
              </div>
              {/* <div>
                <span className="font-medium text-gray-700">Số hóa đơn đã sử dụng: </span>
                <span>{promotionDetail.soHoaDonSuDung}</span>
              </div> */}
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default AdminPromotionsPage;
