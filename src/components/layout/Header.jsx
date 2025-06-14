import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Tag,
  Home,
  Menu,
  Users,
  Info,
  Phone,
  LogOut,
  Newspaper,
  User,
  Settings,
  Trophy,
  History,
} from "lucide-react";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Header = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const role = localStorage.getItem("role");
  // Listen for login state (token in localStorage)
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    window.addEventListener("loginSuccess", checkLogin); // listen for manual login event

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("loginSuccess", checkLogin);
    };
  }, []);
  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập",
        text: "Bạn cần đăng nhập để xem giỏ hàng.",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (role === "Admin") {
      Swal.fire({
        icon: "error",
        title: "Trang không dành cho quản trị viên",
        text: "Bạn không thể xem giỏ hàng với vai trò quản trị viên!",
        confirmButtonText: "OK",
      });
      return;
    }

    navigate("/cart");
  };

  const handleOrdersClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (role === "Admin") {
      Swal.fire({
        icon: "error",
        title: "Trang không dành cho quản trị viên",
        text: "Bạn không thể xem đơn hàng với vai trò quản trị viên!",
        confirmButtonText: "OK",
      });
      return;
    }

    navigate("/orders");
  };
  // Listen for cart updates
  useEffect(() => {
    // Tính số loại sản phẩm khác nhau trong giỏ hàng (không phải tổng quantity)
    const updateCartCount = (cart) => {
      // không cho hiển thị giỏ hàng nếu không phải khách hàng
      if (role === "Admin") {
        setCartCount(0);
        return;
      }
      if (cart && Array.isArray(cart)) {
        // Đếm số loại sản phẩm khác nhau (mỗi id là 1 loại)
        const count = cart.length;
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };

    // Lắng nghe sự kiện thêm vào giỏ hàng (custom event 'cartUpdated')
    const handleCartUpdated = (e) => {
      const updatedCart = e.detail.cart;
      updateCartCount(updatedCart);
    };

    // Lấy cart từ localStorage khi load trang
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    updateCartCount(savedCart);

    // Lắng nghe thay đổi localStorage (các tab khác)
    const handleStorage = () => {
      const latestCart = JSON.parse(localStorage.getItem("cart"));
      updateCartCount(latestCart);
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("loginSuccess")); // trigger update
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const navItems = [
    { name: "Trang chủ", path: "/", icon: <Home className="h-5 w-5" /> },
    {
      name: "Đặt bàn",
      path: "/reservation",
      icon: <Users className="h-5 w-5" />,
    },
    { name: "Danh mục", path: "/menu", icon: <Menu className="h-5 w-5" /> },
    {
      name: "Khuyến mãi",
      path: "/promotions",
      icon: <Tag className="h-5 w-5" />,
    },
    { name: "Giới thiệu", path: "/about", icon: <Info className="h-5 w-5" /> },
    { name: "Liên hệ", path: "/contact", icon: <Phone className="h-5 w-5" /> },
    {
      name: "Blog ẩm thực",
      path: "/blog",
      icon: <Newspaper className="h-5 w-5" />,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans font-medium ${
        isScrolled ? "bg-black shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/">
            <img src={Logo} alt="logo" className="h-8 md:h-10" />
          </Link>

          <div className="flex items-center space-x-2">
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
                className={`flex flex-col items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200 hover:text-rose-600 ${
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
              to="#" // hoặc to="javascript:void(0)"
              onClick={handleCartClick}
              className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:text-rose-600 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && token && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-bold border border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User login / logout */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:text-rose-600 transition"
                >
                  <User className="h-5 w-5 text-blue-600" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-lg w-48 z-50">
                    <ul className="text-sm">
                      <li>
                        <Link
                          to="/account-settings"
                          className="flex items-center gap-2 px-4 py-2 hover:text-rose-600"
                        >
                          <Settings className="h-4 w-4" />
                          Quản lý tài khoản
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/orders"
                          onClick={handleOrdersClick}
                          className="flex items-center gap-2 px-4 py-2 hover:text-rose-600"
                        >
                          <History className="h-4 w-4" />
                          Đơn hàng
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          to="/loyalty-program"
                          className="flex items-center gap-2 px-4 py-2 hover:text-rose-600"
                        >
                          <Trophy className="h-4 w-4" />
                          Ưu đãi
                        </Link>
                      </li> */}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:text-orange-500"
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
  );
};

export default Header;
