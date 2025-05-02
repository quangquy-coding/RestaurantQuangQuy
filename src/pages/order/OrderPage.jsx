import React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, ChevronDown, Plus, Minus, ShoppingCart, Clock, X } from "lucide-react"

// Mock data for menu items
const mockMenuItems = [
  {
    id: 1,
    name: "Phở bò tái",
    category: "Món chính",
    price: 85000,
    description: "Phở bò truyền thống với thịt bò tái, nước dùng đậm đà được ninh từ xương bò trong 24 giờ.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: false,
    preparationTime: 15,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Gỏi cuốn tôm thịt",
    category: "Món khai vị",
    price: 65000,
    description: "Gỏi cuốn tươi với tôm và thịt heo, cuốn cùng rau sống và bún.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: false,
    preparationTime: 10,
    rating: 4.6,
  },
  {
    id: 3,
    name: "Cơm rang hải sản",
    category: "Món chính",
    price: 95000,
    description: "Cơm rang với các loại hải sản tươi ngon như tôm, mực, cua, sò điệp.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: true,
    preparationTime: 20,
    rating: 4.9,
  },
  {
    id: 4,
    name: "Chè đậu đen",
    category: "Món tráng miệng",
    price: 35000,
    description: "Chè đậu đen nấu với nước cốt dừa, thơm ngọt và bổ dưỡng.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: false,
    preparationTime: 5,
    rating: 4.5,
  },
  {
    id: 5,
    name: "Nước ép cam",
    category: "Đồ uống",
    price: 45000,
    description: "Nước ép cam tươi, giàu vitamin C và tốt cho sức khỏe.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: false,
    preparationTime: 5,
    rating: 4.7,
  },
  {
    id: 6,
    name: "Bún chả Hà Nội",
    category: "Món chính",
    price: 75000,
    description: "Bún chả truyền thống kiểu Hà Nội với thịt lợn nướng, bún và nước mắm pha chua ngọt đặc trưng.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: true,
    preparationTime: 15,
    rating: 4.7,
  },
  {
    id: 7,
    name: "Bánh xèo",
    category: "Món chính",
    price: 80000,
    description: "Bánh xèo giòn với nhân tôm, thịt, giá đỗ, được ăn kèm với rau sống và nước mắm pha.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: false,
    preparationTime: 15,
    rating: 4.5,
  },
  {
    id: 8,
    name: "Cà phê sữa đá",
    category: "Đồ uống",
    price: 35000,
    description: "Cà phê đen đậm đà hòa quyện với sữa đặc, phục vụ với đá.",
    image: "/placeholder.svg?height=200&width=300",
    isAvailable: true,
    isSpecial: false,
    preparationTime: 5,
    rating: 4.8,
  },
]

// Mock data for categories
const mockCategories = [
  { id: 1, name: "Tất cả" },
  { id: 2, name: "Món chính" },
  { id: 3, name: "Món khai vị" },
  { id: 4, name: "Món tráng miệng" },
  { id: 5, name: "Đồ uống" },
]

const OrderPage = () => {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [sortOption, setSortOption] = useState("default")
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [tableNumber, setTableNumber] = useState("")
  const [note, setNote] = useState("")
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    // In a real app, you would fetch menu items from an API
    setMenuItems(mockMenuItems)
    setFilteredItems(mockMenuItems)

    // Check if there's a cart in localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      setCart(parsedCart)
    }
  }, [])

  useEffect(() => {
    // Calculate total amount whenever cart changes
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalAmount(total)

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    // Filter and sort menu items
    let filtered = [...menuItems]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Sort items
    switch (sortOption) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "preparation-time":
        filtered.sort((a, b) => a.preparationTime - b.preparationTime)
        break
      default:
        // Default sorting (by id)
        filtered.sort((a, b) => a.id - b.id)
    }

    setFilteredItems(filtered)
  }, [menuItems, searchTerm, selectedCategory, sortOption])

  const handleAddToCart = (item) => {
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id)

    if (existingItemIndex !== -1) {
      // Item already exists in cart, update quantity
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      setCart(updatedCart)
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return

    const updatedCart = cart.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })

    setCart(updatedCart)
  }

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!")
      return
    }

    if (!tableNumber) {
      alert("Vui lòng chọn số bàn!")
      return
    }

    // In a real app, you would send the order to an API
    // For now, we'll just simulate a successful order

    // Generate a random order number
    const randomOrderNumber = Math.floor(10000 + Math.random() * 90000).toString()
    setOrderNumber(randomOrderNumber)

    // Show success message
    setOrderSuccess(true)

    // Clear cart
    setCart([])
    localStorage.removeItem("cart")

    // Close order modal
    setIsOrderModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Đặt món</h1>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Giỏ hàng
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {mockCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="preparation-time">Thời gian chuẩn bị nhanh nhất</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                {item.isSpecial && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Đặc biệt
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{item.category}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center mb-4">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-500">{item.preparationTime} phút</span>
                  <div className="ml-auto flex items-center">
                    <svg
                      className="h-4 w-4 text-yellow-500 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-sm ml-1">{item.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{item.price.toLocaleString("vi-VN")} ₫</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="text-gray-500 mb-4">Không tìm thấy món ăn nào phù hợp</div>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("Tất cả")
                  setSortOption("default")
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg transform ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-50`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Giỏ hàng</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart className="h-12 w-12 mb-4" />
                  <p className="text-lg mb-4">Giỏ hàng của bạn đang trống</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Tiếp tục đặt món
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex border-b pb-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm">{item.price.toLocaleString("vi-VN")} ₫</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="ml-auto font-medium">
                            {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{totalAmount.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Thuế (10%):</span>
                  <span className="font-medium">{(totalAmount * 0.1).toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span>{(totalAmount * 1.1).toLocaleString("vi-VN")} ₫</span>
                </div>
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Tiến hành đặt món
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Modal */}
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsOrderModalOpen(false)}></div>

              <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Xác nhận đặt món</h3>
                  <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="mb-4">
                    <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Số bàn <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tableNumber"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Chọn số bàn</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          Bàn {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Yêu cầu đặc biệt, dị ứng, v.v."
                    ></textarea>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium mb-2">Tóm tắt đơn hàng</h4>
                    <div className="space-y-2 mb-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{totalAmount.toLocaleString("vi-VN")} ₫</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Thuế (10%):</span>
                        <span>{(totalAmount * 0.1).toLocaleString("vi-VN")} ₫</span>
                      </div>
                      <div className="flex justify-between font-bold mt-2">
                        <span>Tổng cộng:</span>
                        <span>{(totalAmount * 1.1).toLocaleString("vi-VN")} ₫</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Xác nhận đặt món
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Success Modal */}
        {orderSuccess && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50"></div>

              <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Đặt món thành công!</h3>
                  <p className="text-sm text-gray-500 mb-4">Đơn hàng của bạn đã được ghi nhận và đang được chuẩn bị.</p>
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-gray-700">
                      Mã đơn hàng: <span className="font-bold">{orderNumber}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Bàn số: <span className="font-bold">{tableNumber}</span>
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Link
                      to={`/order-detail/${orderNumber}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Xem chi tiết đơn hàng
                    </Link>
                    <button
                      onClick={() => setOrderSuccess(false)}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderPage
