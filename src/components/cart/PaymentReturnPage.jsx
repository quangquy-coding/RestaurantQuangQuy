"use client";
import React from "react";
import axios from "axios";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { orderService } from "../../api/orderApi";

const PAYMENT_API_URL = `${import.meta.env.VITE_API_BASE_URL}/Payment`;

const PaymentReturnPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        console.log("🔄 Processing payment return with URL:", location.search);

        const response = await axios.get(
          `${PAYMENT_API_URL}/payment-return${location.search}`
        );
        const result = response.data;

        console.log("✅ Payment result received:", result);
        setPaymentResult(result);

        if (result.success) {
          const pendingHoaDon = JSON.parse(
            localStorage.getItem("pendingHoaDon") || "{}"
          );

          if (!pendingHoaDon.MaDatMon) {
            console.warn("⚠️ No pending order found in localStorage");
          }

          const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const checkoutItems = JSON.parse(
            localStorage.getItem("checkoutItems") || "[]"
          );
          console.log("🛒 Cart before update:", savedCart);
          console.log("✅ Checkout items to remove:", checkoutItems);

          if (checkoutItems.length > 0) {
            const remainingItems = savedCart.filter(
              (item) => !checkoutItems.some((c) => c.id === item.id)
            );
            localStorage.setItem("cart", JSON.stringify(remainingItems));
            window.dispatchEvent(
              new CustomEvent("cartUpdated", {
                detail: { cart: remainingItems },
              })
            );
            console.log("🛒 Cart after update:", remainingItems);
          } else {
            console.warn("⚠️ No checkout items found to remove from cart.");
          }

          // Clear localStorage
          localStorage.removeItem("pendingHoaDon");
          localStorage.removeItem("checkoutItems");
          localStorage.removeItem("customerInfo");
          localStorage.removeItem("maDatBan");

          console.log("🧹 Cleared localStorage");
        } else {
          // Rollback order if payment failed
          const pendingHoaDon = JSON.parse(
            localStorage.getItem("pendingHoaDon") || "{}"
          );
          if (pendingHoaDon && pendingHoaDon.MaDatMon) {
            try {
              await orderService.deleteDatMon(pendingHoaDon.MaDatMon);
              console.log(
                `🧹 Đã rollback đơn đặt món: ${pendingHoaDon.MaDatMon}`
              );
            } catch (delErr) {
              console.error("❌ Lỗi khi rollback đơn đặt món:", delErr);
            }
            localStorage.removeItem("pendingHoaDon");
          }
          setError(result.message || "Đặt cọc thất bại. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("❌ Lỗi xử lý kết quả thanh toán:", err);

        // Log chi tiết lỗi
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Đã xảy ra lỗi khi xử lý kết quả thanh toán. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Clock className="animate-spin mx-auto h-16 w-16 text-blue-500 mb-4" />
          <p className="text-gray-600">Đang xử lý kết quả đặt cọc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đặt cọc thất bại</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {paymentResult && (
            <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
              {paymentResult.orderId && (
                <p className="text-sm">
                  <strong>Mã đơn hàng:</strong> {paymentResult.orderId}
                </p>
              )}
              <p className="text-sm">
                <strong>Lý do:</strong>{" "}
                {paymentResult.message || "Không xác định"}
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/checkout")}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex-1"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors flex-1"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentResult?.success) {
    return (
      <div className="min-h-screen bg-white-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đặt cọc thành công!</h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã đặt cọc tại Nhà Hàng Quang Quý
          </p>

          <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-md mb-6 text-left">
            <p className="text-sm">
              <strong>Mã hóa đơn:</strong> {paymentResult.orderId}
            </p>
            <p className="text-sm">
              <strong>Số tiền cọc:</strong>{" "}
              {paymentResult.amount?.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-sm">
              <strong>Mã giao dịch:</strong>{" "}
              {paymentResult.transactionId || "N/A"}
            </p>
            <p className="text-sm">
              <strong>Ngân hàng:</strong>{" "}
              {new URLSearchParams(location.search).get("vnp_BankCode") ||
                "N/A"}
            </p>
            <p className="text-sm">
              <strong>Loại thẻ:</strong>{" "}
              {new URLSearchParams(location.search).get("vnp_CardType") ||
                "N/A"}
            </p>
            <p className="text-sm">
              <strong>Thời gian:</strong>{" "}
              {paymentResult.paymentDate &&
              paymentResult.paymentDate !== "0001-01-01T00:00:00"
                ? new Date(paymentResult.paymentDate).toLocaleString("vi-VN")
                : "N/A"}
            </p>
            <p className="text-sm">
              <strong>Trạng thái:</strong>{" "}
              <span className="text-green-600 font-semibold">
                Đặt cọc thành công
              </span>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <strong>💡 Lưu ý:</strong> Bạn có thể thanh toán số tiền còn lại
              bằng tiền mặt khi đến nhà hàng. Vui lòng mang theo mã hóa đơn để
              xác nhận.
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

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <p className="text-gray-600">Đang xử lý...</p>
      </div>
    </div>
  );
};

export default PaymentReturnPage;
