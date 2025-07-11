import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useDebounce } from "use-debounce";
import Swal from "sweetalert2";
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/DanhGiaManager`;

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const role = localStorage.getItem("role");
  const isAdmin =
    role === "Admin" ||
    role === "admin" ||
    role === "Q001" ||
    role === "Quản trị viên";
  useEffect(() => {
    fetchReviews();
  }, [filterRating, debouncedSearchQuery]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url;
      if (debouncedSearchQuery) {
        url = `${API_BASE_URL}/search?query=${encodeURIComponent(
          debouncedSearchQuery
        )}`;
      } else {
        url =
          filterRating === "all"
            ? API_BASE_URL
            : `${API_BASE_URL}/LocTheoXepHang/${filterRating}`;
      }

      const response = await axios.get(url);
      const fetchedReviews = response.data.map((review) => ({
        id: review.maDanhGia,
        customerName: review.tenKhachHang || "Khách hàng ẩn danh",
        customerEmail: review.email || "N/A",
        customerAvatar: review.avatar || "/placeholder.svg",
        maKhachHang: review.maKhachHang,
        maHoaDon: review.maHoaDon,
        content: review.noiDungPhanHoi || "",
        date: review.ngayDanhGia,
        rating: review.xepHang,
        reply: review.phanHoiDanhGia
          ? {
              content: review.phanHoiDanhGia,
              date: new Date().toISOString().split("T")[0], // Simulated date
              staffName: "Chủ nhà hàng",
            }
          : null,
        images: review.hinhAnhDanhGia ? [review.hinhAnhDanhGia] : [],
        tongTienHoaDon: review.tongTienHoaDon,
        status: "published", // Simulated status
      }));

      setReviews(fetchedReviews);
      setLoading(false);
    } catch (error) {
      toast.error("Lỗi khi tải đánh giá: " + error.message);
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, status: newStatus } : review
      )
    );
    toast.success(
      `Đã cập nhật trạng thái thành ${
        newStatus === "published"
          ? "công khai"
          : newStatus === "hidden"
          ? "ẩn"
          : "chờ duyệt"
      }!`
    );
  };

  // ...existing code...
  const handleDeleteReview = async (id) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Cảnh báo",
        text: "Chỉ quản trị viên mới được xóa đánh giá",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tôi đã hiểu",
      });
      return;
    }
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa đánh giá này?",
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
        await axios.delete(`${API_BASE_URL}/${id}`);
        setReviews((prev) => prev.filter((review) => review.id !== id));
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Đã xóa đánh giá thành công!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Lỗi khi xóa đánh giá: " + error.message,
        });
      }
    }
  };
  // ...existing code...

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply ? review.reply.content : "");
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi!");
      return;
    }

    try {
      const review = reviews.find((r) => r.id === selectedReview.id);
      await axios.put(`${API_BASE_URL}/${selectedReview.id}`, {
        maKhachHang: review.maKhachHang,
        maHoaDon: review.maHoaDon,
        noiDungPhanHoi: review.content,
        xepHang: review.rating,
        phanHoiDanhGia: replyText,
        hinhAnhDanhGia: review.images[0] || null,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id
            ? {
                ...r,
                reply: {
                  content: replyText,
                  date: new Date().toISOString().split("T")[0],
                  staffName: "Chủ nhà hàng",
                },
              }
            : r
        )
      );

      toast.success("Đã gửi phản hồi thành công!");
      handleCloseReplyModal();
    } catch (error) {
      toast.error("Lỗi khi gửi phản hồi: " + error.message);
    }
  };

  // Apply status filter client-side
  let filteredReviews = reviews;
  if (filterStatus !== "all") {
    filteredReviews = filteredReviews.filter(
      (review) => review.status === filterStatus
    );
  }

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 w-full text-center">
          Quản lý đánh giá
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
              <option value="published">Đã đăng</option>
              <option value="pending">Chờ duyệt</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ratingFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Đánh giá
            </label>
            <select
              id="ratingFilter"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          <div className="ml-auto">
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {currentReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery
              ? `Không tìm thấy đánh giá nào cho "${searchQuery}".`
              : "Không tìm thấy đánh giá nào phù hợp với bộ lọc."}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <div className="flex items-start">
                  <img
                    src={review.customerAvatar}
                    alt={review.customerName}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {review.customerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {review.customerEmail}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                            review.status === "published"
                              ? "bg-green-100 text-green-800"
                              : review.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {review.status === "published"
                            ? "Đã đăng"
                            : review.status === "pending"
                            ? "Chờ duyệt"
                            : "Đã ẩn"}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mã hóa đơn: {review.maHoaDon}
                    </p>

                    {/* Review Images */}
                    {review.images.length > 0 && (
                      <div className="flex mt-3 space-x-2 overflow-x-auto pb-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {/* Reply */}
                    {review.reply && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-gray-900">
                            Phản hồi từ {review.reply.staffName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.reply.date}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-1">
                          {review.reply.content}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenReplyModal(review)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {review.reply ? "Chỉnh sửa phản hồi" : "Phản hồi"}
                        </button>
                      )}
                      {isAdmin && review.status === "published" && (
                        <button
                          onClick={() =>
                            handleStatusChange(review.id, "hidden")
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Ẩn đánh giá
                        </button>
                      )}
                      {isAdmin && review.status === "hidden" && (
                        <button
                          onClick={() =>
                            handleStatusChange(review.id, "published")
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-800"
                        >
                          Hiện đánh giá
                        </button>
                      )}
                      {isAdmin && review.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(review.id, "published")
                            }
                            className="text-sm font-medium text-green-600 hover:text-green-800"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(review.id, "hidden")
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Trước
            </button>
            <div className="flex mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 mx-1 rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sau
            </button>
          </nav>
        </div>
      )}

      {/* Reply Modal */}
      {isReplyModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedReview.reply
                  ? "Chỉnh sửa phản hồi"
                  : "Phản hồi đánh giá"}
              </h3>
            </div>
            <form onSubmit={handleSubmitReply}>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={selectedReview.customerAvatar}
                      alt={selectedReview.customerName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="font-medium text-gray-800">
                      {selectedReview.customerName}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedReview.content}</p>
                </div>
                <div>
                  <label
                    htmlFor="replyText"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nội dung phản hồi
                  </label>
                  <textarea
                    id="replyText"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung phản hồi..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseReplyModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedReview.reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
