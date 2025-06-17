"use client";
import React from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Clock, CreditCard, Tag, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderService } from "../../api/orderApi";
import { toast } from "react-hot-toast";

const USER_API_URL = "http://localhost:5080/api/NguoiDungManager";
const PAYMENT_API_URL = "http://localhost:5080/api/Payment";
const PROMO_API_URL = "http://localhost:5080/api/KhuyenMaiManager";

const api = {
  getUserById: (userId) => axios.get(`${USER_API_URL}/${userId}`),
  createVNPayPayment: (data) =>
    axios.post(`${PAYMENT_API_URL}/create-payment`, data),
  getActivePromotions: () => axios.get(`${PROMO_API_URL}/KhuyenMaiHoatDong`),
  checkPromotion: (maKhuyenMai, tongTien) =>
    axios.get(
      `${PROMO_API_URL}/KiemTraKhuyenMai/${maKhuyenMai}?tongTien=${tongTien}`
    ),
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    maDatBan: "",
    name: "",
    phone: "",
    email: "",
    tableNumber: "",
    guestCount: 1,
    note: "",
    maKhachHang: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("usersId");
    setIsLoggedIn(!!token);

    if (uid) {
      setUserId(uid);
      fetchUserData(uid);
    } else {
      setCustomerInfo((prev) => ({
        ...prev,
        maKhachHang: "GUEST_" + Date.now(),
      }));
    }

    fetchPromotions();
  }, []);

  const fetchUserData = async (uid) => {
    setUserLoading(true);
    try {
      const response = await api.getUserById(uid);
      const userData = response.data;
      const customerCode = userData.maKhachHang || userData.maTaiKhoan || uid;
      const userName =
        userData.tenKhachHang ||
        userData.hoTenNhanVien ||
        userData.tenTaiKhoan ||
        "";
      const userPhone = userData.soDienThoai || "";
      const userEmail = userData.email || "";
      const maDatBan = localStorage.getItem("maDatBan") || "";

      if (!maDatBan) {
        // thông báo bằng sweetalert
        Swal.fire({
          icon: "warning",
          title: "Chưa đặt bàn",
          text: "Vui lòng đặt bàn trước khi thanh toán.",
          confirmButtonText: "Đặt bàn ngay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/reservation");
          }
        });

        // // Chuyển hướng trang sau 3 giây
        // setTimeout(function () {
        //   window.location.href = "/reservation";
        // }, 5000); // 3000 milliseconds = 3 giây
        return;
      }

      setCustomerInfo({
        name: userName,
        email: userEmail,
        phone: userPhone,
        note: "",
        maKhachHang: customerCode,
        tableNumber: maDatBan,
        guestCount: 1,
      });
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin người dùng:", err);
      setError("Lỗi tải thông tin người dùng. Vui lòng thử lại.");
    } finally {
      setUserLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await api.getActivePromotions();
      setPromotions(response.data);
    } catch (err) {
      console.error("❌ Lỗi lấy khuyến mãi:", err);
      toast.error("Không thể tải danh sách khuyến mãi.");
    }
  };

  const applyPromotion = async (promo) => {
    try {
      const response = await api.checkPromotion(promo.maKhuyenMai, total);
      const result = response.data;
      if (result.hopLe) {
        setSelectedPromo(promo);
        setDiscount(result.tienGiam);
        setFinalTotal(result.tongTienSauGiam);

        const newDeposit = result.tongTienSauGiam * 0.3;
        setDeposit(newDeposit);
        setRemainingAmount(result.tongTienSauGiam - newDeposit);

        toast.success(
          `Đã áp dụng mã ${
            promo.tenKhuyenMai
          }! Giảm ${result.tienGiam.toLocaleString()} VNĐ`
        );
        setShowPromoModal(false);
      } else {
        toast.error("Mã khuyến mãi không hợp lệ.");
      }
    } catch (err) {
      console.error("❌ Lỗi kiểm tra khuyến mãi:", err);
      toast.error("Số tiền không đủ để áp dụng mã, vui lòng thử lại.");
    }
  };

  const removePromotion = () => {
    setSelectedPromo(null);
    setDiscount(0);
    setFinalTotal(total);

    const newDeposit = total * 0.3;
    setDeposit(newDeposit);
    setRemainingAmount(total - newDeposit);

    toast.success("Đã xóa mã khuyến mãi.");
  };

  useEffect(() => {
    const savedCheckoutItems = localStorage.getItem("checkoutItems");
    if (savedCheckoutItems) {
      const parsedItems = JSON.parse(savedCheckoutItems);
      setCartItems(parsedItems);
      const sum = parsedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setTotal(sum);
      setFinalTotal(sum);

      const initialDeposit = sum * 0.3;
      setDeposit(initialDeposit);
      setRemainingAmount(sum - initialDeposit);
    } else {
      navigate("/cart");
    }

    const savedCustomerInfo = localStorage.getItem("customerInfo");
    if (savedCustomerInfo) {
      setCustomerInfo(JSON.parse(savedCustomerInfo));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let maDatMon = null;

    try {
      if (
        !customerInfo.name ||
        !customerInfo.phone ||
        !customerInfo.email ||
        !customerInfo.tableNumber
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin cần thiết.");
      }

      // Validate deposit amount for VNPay
      if (deposit < 5000) {
        throw new Error(
          "Số tiền cọc phải từ 5,000 VNĐ trở lên để thanh toán qua VNPay"
        );
      }

      if (deposit >= 1000000000) {
        throw new Error("Số tiền cọc phải dưới 1 tỷ VNĐ");
      }

      const datMonDTO = {
        MaBanAn: customerInfo.tableNumber,
        MaKhachHang: customerInfo.maKhachHang,
        SoDienThoai: customerInfo.phone,
        ThoiGianDat: new Date().toISOString(),
        TrangThai: "Chờ xử lí",
        SoLuong: cartItems.reduce((total, item) => total + item.quantity, 0),
        TongTien: finalTotal,
        GhiChu: customerInfo.note,
        ChiTietDatMonAns: cartItems.map((item) => ({
          MaMon: item.id,
          SoLuong: item.quantity,
          Gia: item.price,
          TongTien: item.quantity * item.price,
        })),
      };

      const datMonRes = await orderService.createDatMon(datMonDTO);
      maDatMon = datMonRes.data?.maDatMon;
      const maBanAn = datMonRes.data?.maBanAn || customerInfo.tableNumber;

      if (!maDatMon) {
        throw new Error("Không thể tạo đơn đặt món.");
      }

      // Create VNPay payment URL
      const vnpayRequest = {
        OrderId: maDatMon,
        Amount: total,
        SoTienCoc: deposit,
        SoTienConLai: remainingAmount,
        TienGiam: discount,
        OrderDescription: `Dat coc don hang ${maDatMon} tai Nha Hang Quang Quy`,
        CustomerName: customerInfo.name,
        CustomerEmail: customerInfo.email,
        CustomerPhone: customerInfo.phone,
      };

      const vnpayRes = await api.createVNPayPayment(vnpayRequest);
      if (vnpayRes.data.success) {
        // Store pending order info for later processing
        localStorage.setItem(
          "pendingHoaDon",
          JSON.stringify({
            MaDatMon: maDatMon,
            MaBanAn: maBanAn,
            MaKhachHang: customerInfo.maKhachHang,
            TongTien: total,
            SoTienCoc: deposit,
            SoTienConLai: remainingAmount,
            TienGiam: discount,
            MaKhuyenMai: selectedPromo?.maKhuyenMai || null,
            GhiChu: customerInfo.note,
          })
        );

        setRedirecting(true);
        setTimeout(() => {
          window.location.href = vnpayRes.data.paymentUrl;
        }, 1000);
      } else {
        throw new Error(
          vnpayRes.data.message || "Lỗi tạo URL thanh toán VNPay"
        );
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi đơn hàng:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Đã xảy ra lỗi khi xử lý đơn hàng. Vui lòng thử lại."
      );

      if (maDatMon) {
        try {
          await orderService.deleteDatMon(maDatMon);
          console.log(`🧹 Đã rollback đơn đặt món: ${maDatMon}`);
        } catch (delErr) {
          console.error("❌ Lỗi khi rollback đơn đặt món:", delErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <Clock className="animate-spin mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Đang chuyển hướng đến VNPay...
          </h1>
          <p className="text-gray-600">
            Vui lòng chờ trong giây lát để hoàn tất thanh toán đặt cọc.
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Không có món nào để thanh toán. Quay lại{" "}
            <Link
              to="/cart"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              giỏ hàng
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              navigate("/checkout");
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-4 tracking-tight">
          Đặt cọc bàn ăn
        </h1>

        {/* Thông báo đặt cọc */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Thông tin đặt cọc
              </h3>
              <p className="text-amber-700 leading-relaxed">
                <strong>
                  Bạn vui lòng đặt cọc để đảm bảo có bàn, bạn có thể thanh toán
                  bằng tiền mặt khi ăn xong. Xin cảm ơn!
                </strong>
              </p>
              <p className="text-amber-600 text-sm mt-2">
                💡 Số tiền cọc: 30% tổng hóa đơn | Số tiền còn lại sẽ thanh toán
                tại nhà hàng
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Tóm tắt đơn hàng
              </h2>
            </div>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {cartItems.map((item) => (
                <li key={item.id} className="p-6 flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={item.image || "/placeholder.svg?height=64&width=64"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {item.quantity} x {item.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-6 bg-gradient-to-r from-white to-teal-50">
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Tạm tính:</span>
                <span>{total.toLocaleString("vi-VN")} ₫</span>
              </div>
              {selectedPromo && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá ({selectedPromo.maKhuyenMai}):</span>
                  <span>-{discount.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>Tổng hóa đơn:</span>
                  <span className="font-semibold">
                    {finalTotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between mb-2 text-blue-600 font-medium">
                  <span>💰 Số tiền cọc (30%):</span>
                  <span>{deposit.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between text-orange-600 font-medium">
                  <span>💵 Thanh toán tại nhà hàng:</span>
                  <span>{remainingAmount.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Thông tin đặt cọc
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white0 shadow-sm hover:shadow-md transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white0 shadow-sm hover:shadow-md transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white0 shadow-sm hover:shadow-md transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã bàn đặt *
                </label>
                <input
                  type="text"
                  name="tableNumber"
                  value={customerInfo.tableNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white0 shadow-sm hover:shadow-md transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã khuyến mãi
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={selectedPromo?.maKhuyenMai || ""}
                    readOnly
                    placeholder="Chọn mã khuyến mãi"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                  />
                  {selectedPromo ? (
                    <button
                      type="button"
                      onClick={removePromotion}
                      className="px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Xóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPromoModal(true)}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Chọn
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={customerInfo.note}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white0 shadow-sm hover:shadow-md transition-all duration-300"
                  placeholder="Yêu cầu đặc biệt về món ăn, thời gian..."
                ></textarea>
              </div>

              {/* Phương thức thanh toán - chỉ VNPay */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Phương thức thanh toán đặt cọc
                </label>
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-10 w-10 text-blue-700 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">VNPay</h3>
                      <p className="text-sm text-blue-700">
                        Thanh toán nhanh chóng và an toàn qua VNPay
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Warning */}
              {deposit < 5000 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 flex items-start gap-3">
                  <svg
                    className="h-6 w-6 text-yellow-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Số tiền cọc ({deposit.toLocaleString("vi-VN")} ₫) không đủ
                      để thanh toán qua VNPay.
                      <span className="font-semibold">Tối thiểu 5,000 ₫</span>.
                      Vui lòng thêm món để đạt mức tối thiểu.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading || userLoading || redirecting || deposit < 5000
                }
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {loading || redirecting ? (
                  <>
                    <Clock className="animate-spin mr-2 h-5 w-5" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Đặt cọc qua VNPay ({deposit.toLocaleString("vi-VN")} ₫)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {showPromoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Chọn Mã Khuyến Mãi
                </h3>
                <button
                  onClick={() => setShowPromoModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-all duration-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              {promotions.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  Không có mã khuyến mãi nào đang hoạt động.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  {promotions.map((promo) => (
                    <li
                      key={promo.maKhuyenMai}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300"
                      onClick={() => applyPromotion(promo)}
                    >
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-blue-600 mr-3 animate-pulse" />
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {promo.tenKhuyenMai}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Mã: {promo.maKhuyenMai} | Giảm: {promo.tyLeGiamGia}%
                            | Tối thiểu:{" "}
                            {promo.mucTienToiThieu.toLocaleString()} VNĐ
                          </p>
                          <p className="text-sm text-gray-600">
                            Hết hạn: {formatDate(promo.ngayKetThuc)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
