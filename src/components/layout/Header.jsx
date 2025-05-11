import React, { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ShoppingCart,
  Home,
  Menu,
  Users,
  Info,
  Phone,
  LogOut,
  Newspaper,
  User,
  Settings,Trophy 
  ,History 
} from "lucide-react"
import Logo from "../../assets/logo.png"

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      const count = parsedCart.reduce((acc, item) => acc + item.quantity, 0)
      setCartCount(count)
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const updateCartCount = (cart) => {
      if (cart && Array.isArray(cart)) {
        const count = cart.reduce((acc, item) => acc + item.quantity, 0)
        setCartCount(count)
      } else {
        setCartCount(0)
      }
    }

    const handleCartUpdated = (e) => {
      const updatedCart = e.detail.cart
      updateCartCount(updatedCart)
    }

    const savedCart = JSON.parse(localStorage.getItem("cart"))
    updateCartCount(savedCart)

    const handleStorage = () => {
      const latestCart = JSON.parse(localStorage.getItem("cart"))
      updateCartCount(latestCart)
    }

    window.addEventListener("cartUpdated", handleCartUpdated)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    window.location.href = "/login"
  }

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const navItems = [
    { name: "Trang chủ", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Danh mục", path: "/menu", icon: <Menu className="h-5 w-5" /> },
    { name: "Đặt bàn", path: "/reservation", icon: <Users className="h-5 w-5" /> },
    { name: "Giới thiệu", path: "/about", icon: <Info className="h-5 w-5" /> },
    { name: "Liên hệ", path: "/contact", icon: <Phone className="h-5 w-5" /> },
    { name: "Blog ẩm thực", path: "/blog", icon: <Newspaper className="h-5 w-5" /> },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans font-medium ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="logo" className="h-8 md:h-10" />
            <Link
              to="/"
              className="text-lg md:text-2xl font-bold text-blue-600 hidden sm:inline"
            >
              Nhà hàng Quang Quý
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex justify-center gap-2 md:gap-3 lg:gap-4 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200 hover:bg-gray-100 ${
                  location.pathname === item.path
                    ? "text-blue-600 bg-gray-100"
                    : "text-gray-600"
                }`}
              >
                {item.icon}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User login / logout */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 transition"
                >
                  <User className="h-5 w-5 text-blue-600" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-lg w-48 z-50">
                    <ul className="text-sm">
                      <li>
                        <Link
                          to="/account-settings"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" />
                          Quản lý tài khoản
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          <History  className="h-4 w-4" />
                          Đơn hàng
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/loyalty-program"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          <Trophy  className="h-4 w-4" />
                        Ưu đãi
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-600 text-white hover:bg-blue-700 transition rounded-full"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
