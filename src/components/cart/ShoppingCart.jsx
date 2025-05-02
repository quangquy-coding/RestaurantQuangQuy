import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartIcon as CartIcon, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Mặc định không chọn món nào
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotal([], parsedCart); // Không chọn món nào khi vào trang
    }
  }, []);

  const calculateTotal = (selectedIds, items) => {
    const sum = items
      .filter(item => selectedIds.includes(item.id))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const updateQuantity = (id, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    calculateTotal(selectedItems, updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    const updatedSelected = selectedItems.filter(itemId => itemId !== id);
    setCartItems(updatedCart);
    setSelectedItems(updatedSelected);
    calculateTotal(updatedSelected, updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const toggleSelectItem = (id) => {
    const updatedSelected = selectedItems.includes(id)
      ? selectedItems.filter(itemId => itemId !== id) // Bỏ chọn
      : [...selectedItems, id]; // Chọn thêm

    setSelectedItems(updatedSelected);
    calculateTotal(updatedSelected, cartItems);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      // Nếu tất cả đã được chọn, bỏ chọn tất cả
      setSelectedItems([]);
      calculateTotal([], cartItems);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả
      const allIds = cartItems.map(item => item.id);
      setSelectedItems(allIds);
      calculateTotal(allIds, cartItems);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một món để thanh toán."); // Hiển thị thông báo lỗi
      return;
    }
  
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    localStorage.setItem("checkoutItems", JSON.stringify(itemsToCheckout)); // Lưu các món được chọn vào localStorage
    navigate("/checkout"); // Điều hướng đến trang thanh toán
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <CartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2 ">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Bạn chưa thêm món ăn nào vào giỏ hàng</p>
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
    <div className="min-h-screen bg-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.length === cartItems.length} // Kiểm tra nếu tất cả đã được chọn
              onChange={toggleSelectAll}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-4"
            />
            <h2 className="font-semibold">Chọn tất cả</h2>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {cartItems.map(item => (
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
                  <p className="text-gray-500 text-sm">{item.price.toLocaleString('vi-VN')} ₫</p>
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
                  <p className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</p>
                  
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
              <span>{total.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span>{total.toLocaleString('vi-VN')} ₫</span>
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
            disabled={selectedItems.length === 0} // Vô hiệu hóa nếu không có món nào được chọn
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;