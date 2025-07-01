import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Tag, Clock, CheckCircle, XCircle, Search } from "lucide-react";

const PromotionsPage = () => {
  const [allPromotions, setAllPromotions] = useState([]);
  const [activePromotions, setActivePromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("startDateDesc");

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/KhuyenMaiManager`;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Fetch all promotions and active promotions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allResponse = await axios.get(`${API_BASE_URL}`);
        setAllPromotions(allResponse.data);
        const activeResponse = await axios.get(
          `${API_BASE_URL}/KhuyenMaiHoatDong`
        );
        setActivePromotions(activeResponse.data.map((p) => p.maKhuyenMai));
      } catch (error) {
        toast.error(
          `Lỗi: ${error.response?.data || "Không thể tải khuyến mãi"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open modal to check promo
  const handleOpenCheckModal = (promo) => {
    setSelectedPromo(promo);
    setTotalAmount("");
    setCheckResult(null);
    setShowModal(true);
  };

  // Check promo code
  const handleCheckPromo = async (e) => {
    e.preventDefault();
    if (!totalAmount) {
      toast.error("Vui lòng nhập tổng tiền đơn hàng");
      return;
    }

    try {
      setChecking(true);
      const response = await axios.get(
        `${API_BASE_URL}/KiemTraKhuyenMai/${
          selectedPromo.maKhuyenMai
        }?tongTien=${parseFloat(totalAmount)}`
      );
      setCheckResult(response.data);
      if (response.data.hopLe) {
        toast.success("Mã khuyến mãi hợp lệ!");
      } else {
        toast.error("Mã khuyến mãi không hợp lệ");
      }
    } catch (error) {
      setCheckResult(null);
      toast.error(
        `Lỗi: ${error.response?.data || "Không thể kiểm tra mã khuyến mãi"}`
      );
    } finally {
      setChecking(false);
    }
  };

  // Filter and sort promotions
  const filteredPromotions = allPromotions
    .filter((promo) => {
      if (filterStatus === "active")
        return activePromotions.includes(promo.maKhuyenMai);
      if (filterStatus === "inactive")
        return !activePromotions.includes(promo.maKhuyenMai);
      return true;
    })
    .filter(
      (promo) =>
        promo.tenKhuyenMai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.maKhuyenMai.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "startDateDesc")
        return new Date(b.ngayBatDau) - new Date(a.ngayBatDau);
      if (sortBy === "startDateAsc")
        return new Date(a.ngayBatDau) - new Date(b.ngayBatDau);
      if (sortBy === "endDateDesc")
        return new Date(b.ngayKetThuc) - new Date(a.ngayKetThuc);
      if (sortBy === "endDateAsc")
        return new Date(a.ngayKetThuc) - new Date(b.ngayKetThuc);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          Khuyến mãi đặc biệt
        </h1>

        {/* Search and Filter */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-300" />
            <input
              type="text"
              placeholder="Tìm kiếm khuyến mãi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-lg"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-lg"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-lg"
            >
              <option value="startDateDesc">Ngày bắt đầu (Mới nhất)</option>
              <option value="startDateAsc">Ngày bắt đầu (Cũ nhất)</option>
              <option value="endDateDesc">Ngày kết thúc (Mới nhất)</option>
              <option value="endDateAsc">Ngày kết thúc (Cũ nhất)</option>
            </select>
          </div>
        </div>

        {/* Promotions List */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {filteredPromotions.length === 0 ? (
            <div className="p-8 text-center text-gray-600 text-lg">
              Không tìm thấy khuyến mãi nào phù hợp.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredPromotions.map((promo) => {
                const isActive = activePromotions.includes(promo.maKhuyenMai);
                return (
                  <li
                    key={promo.maKhuyenMai}
                    className={`p-6 ${
                      isActive
                        ? "bg-gradient-to-r from-green-50 to-blue-50"
                        : "hover:bg-gray-50"
                    } transition-all duration-300 transform hover:scale-[1.01]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <Tag className="h-6 w-6 text-blue-600 mr-3 animate-pulse" />
                          <h3 className="text-xl font-semibold text-gray-800">
                            {promo.tenKhuyenMai}
                            {isActive && (
                              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white shadow-sm">
                                Đang hoạt động
                              </span>
                            )}
                            {!isActive && (
                              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white shadow-sm">
                                Không hoạt động
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>
                            <strong className="text-gray-800">Mã:</strong>{" "}
                            {promo.maKhuyenMai}
                          </p>
                          <p>
                            <strong className="text-gray-800">Giảm:</strong>{" "}
                            {promo.tyLeGiamGia}% cho đơn hàng từ{" "}
                            {promo.mucTienToiThieu.toLocaleString()} VNĐ
                          </p>
                          <p>
                            <strong className="text-gray-800">
                              Thời gian:
                            </strong>{" "}
                            {formatDate(promo.ngayBatDau)} -{" "}
                            {formatDate(promo.ngayKetThuc)}
                          </p>
                          <p>
                            <strong className="text-gray-800">
                              Trạng thái:
                            </strong>{" "}
                            {promo.trangThai}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenCheckModal(promo)}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        Kiểm tra
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Check Promo Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Kiểm Tra Mã: {selectedPromo.maKhuyenMai}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCheckPromo} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tổng tiền đơn hàng (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Nhập tổng tiền"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                </div>
                {checkResult && (
                  <div
                    className={`p-4 rounded-lg ${
                      checkResult.hopLe
                        ? "bg-gradient-to-r from-green-50 to-teal-50"
                        : "bg-gradient-to-r from-red-50 to-pink-50"
                    } transition-all duration-300`}
                  >
                    <div className="flex items-center mb-2">
                      {checkResult.hopLe ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mr-2 animate-bounce" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 mr-2 animate-pulse" />
                      )}
                      <h4 className="font-semibold text-gray-800">
                        {checkResult.hopLe ? "Mã hợp lệ" : "Mã không hợp lệ"}
                      </h4>
                    </div>
                    {checkResult.hopLe && (
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>
                          <strong className="text-gray-800">Khuyến mãi:</strong>{" "}
                          {checkResult.tenKhuyenMai}
                        </p>
                        <p>
                          <strong className="text-gray-800">Giảm:</strong>{" "}
                          {checkResult.tyLeGiamGia}%
                        </p>
                        <p>
                          <strong className="text-gray-800">
                            Số tiền giảm:
                          </strong>{" "}
                          {checkResult.tienGiam.toLocaleString()} VNĐ
                        </p>
                        <p>
                          <strong className="text-gray-800">
                            Tổng tiền sau giảm:
                          </strong>{" "}
                          {checkResult.tongTienSauGiam.toLocaleString()} VNĐ
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={checking}
                    className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      checking ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {checking ? (
                      <>
                        <Clock className="animate-spin inline-block mr-2 h-5 w-5" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      "Kiểm tra"
                    )}
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

export default PromotionsPage;
