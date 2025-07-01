import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon as CartIcon,
  Trash2,
  Plus,
  Minus,
  CreditCard,
} from "lucide-react";

<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
  rel="stylesheet"
></link>;
const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotal([], parsedCart);
    }
  }, []);

  const calculateTotal = (selectedIds, items) => {
    const sum = items
      .filter((item) => selectedIds.includes(item.id))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const updateQuantity = (id, change) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
      Swal.fire({
        title: "Bạn chắc chắn muốn bỏ sản phẩm này?",
        text: "Hành động này không thể hoàn tác.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Có, xóa nó!",
        cancelButtonText: "Hủy",
        customClass: {
          title: "text-xl font-semibold",
          popup: "rounded-xl shadow-lg font-sans",
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded",
          cancelButton:
            "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          removeItem(id);
          Swal.fire({
            title: "Đã xóa!",
            text: "Sản phẩm đã được bỏ khỏi giỏ hàng.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-xl shadow-md font-sans",
            },
          });
        }
      });
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    setCartItems(updatedCart);
    calculateTotal(selectedItems, updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { cart: updatedCart } })
    );
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    const updatedSelected = selectedItems.filter((itemId) => itemId !== id);
    setCartItems(updatedCart);
    setSelectedItems(updatedSelected);
    calculateTotal(updatedSelected, updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { cart: updatedCart } })
    );
  };

  const toggleSelectItem = (id) => {
    const updatedSelected = selectedItems.includes(id)
      ? selectedItems.filter((itemId) => itemId !== id)
      : [...selectedItems, id];
    setSelectedItems(updatedSelected);
    calculateTotal(updatedSelected, cartItems);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
      calculateTotal([], cartItems);
    } else {
      const allIds = cartItems.map((item) => item.id);
      setSelectedItems(allIds);
      calculateTotal(allIds, cartItems);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Chưa chọn món",
        text: "Vui lòng chọn ít nhất một món để thanh toán.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const itemsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    localStorage.setItem("checkoutItems", JSON.stringify(itemsToCheckout));
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <CartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa thêm món ăn nào vào giỏ hàng
          </p>
          <Link
            to="/menu"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Xem thực đơn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.length === cartItems.length}
              onChange={toggleSelectAll}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-4"
            />
            <h2 className="font-semibold">Chọn tất cả</h2>
          </div>

          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="p-4 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-4"
                />
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.image || "/placeholder.svg?height=64&width=64"}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {item.price.toLocaleString("vi-VN")} ₫
                  </p>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="mx-2 w-8 text-center">{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="ml-4 text-right">
                  <p className="font-medium">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center mt-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </button>
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

        <div className="flex justify-between">
          <Link
            to="/menu"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Tiếp tục đặt món
          </Link>

          <button
            onClick={handleCheckout}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={selectedItems.length === 0}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Đặt món
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
