import axios from "axios";
import {
  BanknoteIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderService } from "../../api/orderApi";
import React from "react";

const USER_API_URL = "http://localhost:5080/api/NguoiDungManager";
const PAYMENT_API_URL = "http://localhost:5080/api/Payment";

const api = {
  getUserById: (userId) => axios.get(`${USER_API_URL}/${userId}`),
  createVNPayPayment: (data) =>
    axios.post(`${PAYMENT_API_URL}/create-payment`, data),
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Mặc định là tiền mặt
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false); // Trạng thái chuyển hướng VNPay

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

  // Initialize user data
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

      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          setError(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
        } else {
          setError(
            "Lỗi tải thông tin người dùng: " +
              (err.response.data?.message || "Unknown error")
          );
        }
      } else {
        setError("Không thể kết nối đến server để lấy thông tin người dùng.");
      }

      // Fallback: sử dụng uid làm maKhachHang
      setCustomerInfo((prev) => ({
        ...prev,
        maKhachHang: uid,
      }));

      console.log("🔄 Sử dụng fallback maKhachHang:", uid);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    // Load các món được chọn từ localStorage
    const savedCheckoutItems = localStorage.getItem("checkoutItems");
    if (savedCheckoutItems) {
      const parsedItems = JSON.parse(savedCheckoutItems);
      setCartItems(parsedItems);

      // Tính tổng tiền
      const sum = parsedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setTotal(sum);
    } else {
      // Nếu không có món nào, quay lại giỏ hàng
      navigate("/cart");
    }

    // Load thông tin khách hàng nếu có
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

    let maDatMon = null; // Để rollback nếu lỗi

    try {
      // 1. Tạo DTO đặt món
      const datMonDTO = {
        MaBanAn: customerInfo.tableNumber,
        MaKhachHang: customerInfo.maKhachHang,
        SoDienThoai: customerInfo.phone,
        ThoiGianDat: new Date().toISOString(),
        TrangThai: "Chờ xác nhận",
        SoLuong: cartItems.reduce((total, item) => total + item.quantity, 0),
        TongTien: total,
        GhiChu: customerInfo.note,
        ChiTietDatMonAns: cartItems.map((item) => ({
          MaMon: item.id,
          SoLuong: item.quantity,
          Gia: item.price,
          TongTien: item.quantity * item.price,
        })),
      };

      // 2. Gửi đơn đặt món
      const datMonRes = await orderService.createDatMon(datMonDTO);
      maDatMon = datMonRes.data?.maDatMon;
      const maBanAn = datMonRes.data?.maBanAn;

      // 3. Xử lý thanh toán
      if (paymentMethod === "cash") {
        // Thanh toán tiền mặt
        const hoaDonDTO = {
          MaHoaDon: "",
          MaDatMon: maDatMon,
          MaBanAn: maBanAn,
          MaKhachHang: customerInfo.maKhachHang,
          ThoiGianDat: new Date().toISOString(),
          ThoiGianThanhToan: new Date().toISOString(),
          MaKhuyenMai: "KM001",
          TongTien: total,
          PhuongThucThanhToan: "cash",
          TrangThaiThanhToan: "processing",
          MaNhanVien: "NV001",
          GhiChu: customerInfo.note || "",
        };

        const res = await orderService.createHoaDon(hoaDonDTO);
        const maHoaDon = res.data?.data?.maHoaDon || "HD" + Date.now();

        // Thành công
        setOrderId(maHoaDon);
        setOrderComplete(true);

        // Dọn dữ liệu localStorage
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
        // Thanh toán VNPay
        const vnpayRequest = {
          OrderId: maDatMon,
          Amount: total,
          OrderDescription: `Thanh toan don hang ${maDatMon} tai Restaurant Quang Quy`,
          CustomerName: customerInfo.name,
          CustomerEmail: customerInfo.email,
          CustomerPhone: customerInfo.phone,
        };

        const vnpayRes = await api.createVNPayPayment(vnpayRequest);
        if (vnpayRes.data.success) {
          // Lưu thông tin hóa đơn vào localStorage để sử dụng sau khi quay lại từ VNPay
          localStorage.setItem(
            "pendingHoaDon",
            JSON.stringify({
              MaDatMon: maDatMon,
              MaBanAn: maBanAn,
              MaKhachHang: customerInfo.maKhachHang,
              TongTien: total,
              GhiChu: customerInfo.note,
            })
          );
          // Chuyển hướng đến URL thanh toán VNPay
          setRedirecting(true);
          setTimeout(() => {
            window.location.href = vnpayRes.data.paymentUrl;
          }, 1000); // Đợi 1 giây để hiển thị UI chuyển hướng
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

      // Rollback đơn đặt món nếu có lỗi
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
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
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
          {/* Tóm tắt đơn hàng */}
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
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span>{total.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>

          {/* Form thanh toán */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
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
                    required={paymentMethod !== "cash"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số bàn
                  </label>
                  <input
                    type="text"
                    name="tableNumber"
                    value={customerInfo.tableNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
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
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="cash"
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
                        value="vnpay"
                        checked={paymentMethod === "vnpay"}
                        onChange={() => setPaymentMethod("vnpay")}
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
                  ) : paymentMethod === "cash" ? (
                    "Hoàn tất đặt hàng"
                  ) : (
                    "Tiến hành thanh toán VNPay"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
