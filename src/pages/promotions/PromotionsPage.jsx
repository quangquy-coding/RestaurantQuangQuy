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

  const API_BASE_URL = "http://localhost:5080/api/KhuyenMaiManager";

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Tất Cả Khuyến Mãi
        </h1>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã khuyến mãi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="startDateDesc">Ngày bắt đầu (Mới nhất)</option>
              <option value="startDateAsc">Ngày bắt đầu (Cũ nhất)</option>
              <option value="endDateDesc">Ngày kết thúc (Mới nhất)</option>
              <option value="endDateAsc">Ngày kết thúc (Cũ nhất)</option>
            </select>
          </div>
        </div>

        {/* Promotions List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {filteredPromotions.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
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
                      isActive ? "bg-green-50" : "hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Tag className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-medium text-gray-800">
                            {promo.tenKhuyenMai}
                            {isActive && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Đang hoạt động
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Mã:</strong> {promo.maKhuyenMai}
                          </p>
                          <p>
                            <strong>Giảm:</strong> {promo.tyLeGiamGia}% cho đơn
                            hàng từ {promo.mucTienToiThieu.toLocaleString()} VNĐ
                          </p>
                          <p>
                            <strong>Thời gian:</strong>{" "}
                            {formatDate(promo.ngayBatDau)} -{" "}
                            {formatDate(promo.ngayKetThuc)}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong> {promo.trangThai}
                          </p>
                          <p>
                            <strong>Số hóa đơn sử dụng:</strong>{" "}
                            {promo.soHoaDonSuDung}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenCheckModal(promo)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Kiểm Tra Mã Khuyến Mãi: {selectedPromo.maKhuyenMai}
              </h3>
              <form onSubmit={handleCheckPromo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tổng tiền đơn hàng (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Nhập tổng tiền"
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {checkResult && (
                  <div
                    className={`p-4 rounded-md ${
                      checkResult.hopLe ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center">
                      {checkResult.hopLe ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 mr-2" />
                      )}
                      <h4 className="font-medium text-gray-800">
                        {checkResult.hopLe ? "Mã hợp lệ" : "Mã không hợp lệ"}
                      </h4>
                    </div>
                    {checkResult.hopLe && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <strong>Khuyến mãi:</strong>{" "}
                          {checkResult.tenKhuyenMai}
                        </p>
                        <p>
                          <strong>Giảm:</strong> {checkResult.tyLeGiamGia}%
                        </p>
                        <p>
                          <strong>Số tiền giảm:</strong>{" "}
                          {checkResult.tienGiam.toLocaleString()} VNĐ
                        </p>
                        <p>
                          <strong>Tổng tiền sau giảm:</strong>{" "}
                          {checkResult.tongTienSauGiam.toLocaleString()} VNĐ
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={checking}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                      checking ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {checking ? "Đang kiểm tra..." : "Kiểm tra"}
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
