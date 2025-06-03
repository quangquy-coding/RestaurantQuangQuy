import axios from "axios";
import {
  BanknoteIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Tag,
  XCircle,
} from "lucide-react";
import React from "react";
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
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);

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
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

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

  // Initialize user data and fetch promotions
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

    // Fetch active promotions
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

      if (maDatBan === "") {
        setError("Vui lòng chọn bàn trước khi thanh toán.");
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
      setError(
        err.response?.data?.message ||
          "Lỗi tải thông tin người dùng. Vui lòng thử lại."
      );
      setCustomerInfo((prev) => ({
        ...prev,
        maKhachHang: uid,
      }));
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
        toast.success(
          `Đã áp dụng mã ${
            promo.maKhuyenMai
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
    toast.success("Đã xóa mã khuyến mãi.");
  };

  useEffect(() => {
    // Load cart items
    const savedCheckoutItems = localStorage.getItem("checkoutItems");
    if (savedCheckoutItems) {
      const parsedItems = JSON.parse(savedCheckoutItems);
      setCartItems(parsedItems);
      const sum = parsedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setTotal(sum);
      setFinalTotal(sum); // Initialize final total
    } else {
      navigate("/cart");
    }

    // Load customer info
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
      // Create order DTO
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

      // Submit order
      const datMonRes = await orderService.createDatMon(datMonDTO);
      maDatMon = datMonRes.data?.maDatMon;
      const maBanAn = datMonRes.data?.maBanAn;

      // Process payment
      if (paymentMethod === "Tiền mặt") {
        const hoaDonDTO = {
          MaHoaDon: "",
          MaDatMon: maDatMon,
          MaBanAn: maBanAn,
          MaKhachHang: customerInfo.maKhachHang,
          ThoiGianDat: new Date().toISOString(),
          ThoiGianThanhToan: new Date().toISOString(),
          MaKhuyenMai: selectedPromo?.maKhuyenMai || null,
          TongTien: finalTotal,
          PhuongThucThanhToan: "Tiền mặt",
          TrangThaiThanhToan: "processing",
          MaNhanVien: "NV001",
          GhiChu: customerInfo.note || "",
        };

        const res = await orderService.createHoaDon(hoaDonDTO);
        const maHoaDon = res.data?.maHoaDon || "HD" + Date.now();

        setOrderId(maHoaDon);
        setOrderComplete(true);

        // Clean up localStorage
        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("customerInfo");

        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const remainingItems = savedCart.filter(
          (item) => !cartItems.some((c) => c.id === item.id)
        );
        localStorage.setItem("cart", JSON.stringify(remainingItems));
        window.dispatchEvent(
          new CustomEvent("cartUpdated", { detail: { cart: remainingItems } })
        );
      } else {
        // VNPay payment
        const vnpayRequest = {
          OrderId: maDatMon,
          Amount: finalTotal,
          OrderDescription: `Thanh toán đơn hàng ${maDatMon} tại Restaurant Quang Quý`,
          CustomerName: customerInfo.name,
          CustomerEmail: customerInfo.email,
          CustomerPhone: customerInfo.phone,
        };

        const vnpayRes = await api.createVNPayPayment(vnpayRequest);
        if (vnpayRes.data.success) {
          localStorage.setItem(
            "pendingHoaDon",
            JSON.stringify({
              MaDatMon: maDatMon,
              MaBanAn: maBanAn,
              MaKhachHang: customerInfo.maKhachHang,
              TongTien: finalTotal,
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
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi đơn hàng:", err);
      setError(
        err.message || "Đã xảy ra lỗi khi xử lý đơn hàng. Vui lòng thử lại."
      );

      // Rollback order if error
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
      <div className="min-h-screen bg-red-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Clock className="animate-spin mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            Đang chuyển hướng đến VNPay...
          </h1>
          <p className="text-gray-600 mb-4">
            Vui lòng chờ trong giây lát để hoàn tất thanh toán.
          </p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-red-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đặt món thành công!</h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã đặt món tại nhà hàng chúng tôi
          </p>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="font-medium">Mã đơn hàng: {orderId}</p>
            <p className="text-sm text-gray-500">
              Vui lòng lưu lại mã đơn hàng để tra cứu
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors w-full"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Không có món nào để thanh toán. Quay lại{" "}
          <Link to="/cart" className="text-blue-600">
            giỏ hàng
          </Link>
          .
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/checkout")}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
            </div>
            <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {cartItems.map((item) => (
                <li key={item.id} className="p-4 flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image || "/placeholder.svg?height=48&width=48"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-gray-500 text-xs">
                      {item.quantity} x {item.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>{total.toLocaleString("vi-VN")} ₫</span>
              </div>
              {selectedPromo && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá ({selectedPromo.maKhuyenMai}):</span>
                  <span>-{discount.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span>{finalTotal.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Thông tin thanh toán</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={paymentMethod !== "Tiền mặt"}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã bàn đặt
                  </label>
                  <input
                    type="text"
                    name="tableNumber"
                    value={customerInfo.tableNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khuyến mãi
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedPromo?.maKhuyenMai || ""}
                      readOnly
                      placeholder="Chọn mã khuyến mãi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    {selectedPromo ? (
                      <button
                        type="button"
                        onClick={removePromotion}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPromoModal(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Chọn
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={customerInfo.note}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="radio"
                        id="Tiền mặt"
                        name="paymentMethod"
                        value="Tiền mặt"
                        checked={paymentMethod === "Tiền mặt"}
                        onChange={() => setPaymentMethod("Tiền mặt")}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="Tiền mặt"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50"
                      >
                        <BanknoteIcon className="mb-2 h-6 w-6 text-gray-700 peer-checked:text-blue-600" />
                        <span className="text-sm">Tiền mặt</span>
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="vnpay"
                        name="paymentMethod"
                        value="VNPay"
                        checked={paymentMethod === "VNPay"}
                        onChange={() => setPaymentMethod("VNPay")}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="vnpay"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50"
                      >
                        <CreditCard className="mb-2 h-6 w-6 text-gray-700 peer-checked:text-blue-600" />
                        <span className="text-sm">VNPay</span>
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || userLoading || redirecting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center disabled:bg-gray-400"
                >
                  {loading || redirecting ? (
                    <>
                      <Clock className="animate-spin mr-2 h-5 w-5" />
                      Đang xử lý...
                    </>
                  ) : paymentMethod === "Tiền mặt" ? (
                    "Hoàn tất đặt món"
                  ) : (
                    "Tiến hành thanh toán VNPay"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Promotions Modal */}
        {showPromoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chọn Mã Khuyến Mãi
                </h3>
                <button
                  onClick={() => setShowPromoModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              {promotions.length === 0 ? (
                <p className="text-gray-600 text-center">
                  Không có mã khuyến mãi nào đang hoạt động.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {promotions.map((promo) => (
                    <li
                      key={promo.maKhuyenMai}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => applyPromotion(promo)}
                    >
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <h4 className="font-medium">{promo.tenKhuyenMai}</h4>
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
