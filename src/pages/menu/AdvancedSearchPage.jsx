"use client";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Sliders, ShoppingCart } from "lucide-react";
import {
  getAllDishes,
  searchDishes,
  getCategories,
  getStatusOptions,
} from "../../api/menuApi";

const AdvancedSearchPage = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [showFilters, setShowFilters] = useState(false); // Filters closed by default
  const [isLoading, setIsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [sortBy, setSortBy] = useState("name");
  const role = localStorage.getItem("role");
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const dishesData = await getAllDishes();
        setDishes(dishesData);
        setFilteredDishes(dishesData);
        const categoriesData = await getCategories();
        setCategories([
          { maDanhMuc: "Tất cả", tenDanhMuc: "Tất cả" },
          ...categoriesData,
        ]);
        const statusData = await getStatusOptions();
        setStatusOptions(["Tất cả", ...statusData]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter and search dishes
  useEffect(() => {
    const filterDishes = async () => {
      try {
        let filtered = dishes;
        if (
          searchTerm ||
          selectedCategory !== "Tất cả" ||
          selectedStatus !== "Tất cả"
        ) {
          const searchResults = await searchDishes(
            searchTerm || undefined,
            selectedCategory !== "Tất cả" ? selectedCategory : undefined,
            selectedStatus !== "Tất cả" ? selectedStatus : undefined
          );
          filtered = searchResults;
        }
        filtered = filtered.filter(
          (dish) => dish.gia >= priceRange[0] && dish.gia <= priceRange[1]
        );
        if (maxPrepTime < 60) {
          filtered = filtered.filter((dish) => {
            const prepTime = dish.thoiGianMon || 30;
            return prepTime <= maxPrepTime;
          });
        }
        switch (sortBy) {
          case "price-asc":
            filtered.sort((a, b) => a.gia - b.gia);
            break;
          case "price-desc":
            filtered.sort((a, b) => b.gia - a.gia);
            break;
          case "name":
          default:
            filtered.sort((a, b) => a.tenMon.localeCompare(b.tenMon));
            break;
        }
        setFilteredDishes(filtered);
      } catch (error) {
        console.error("Error filtering dishes:", error);
      }
    };
    filterDishes();
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    dishes,
    priceRange,
    maxPrepTime,
    sortBy,
  ]);

  // Grouped functions
  const addToCart = (dish) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để thêm món vào giỏ hàng!", {
        duration: 2000,
        position: "top-right",
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
          fontSize: "16px",
        },
      });
      return;
    }
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === dish.maMon
    );
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: dish.maMon,
        name: dish.tenMon,
        price: dish.gia,
        image: dish.hinhAnh,
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    const cartUpdatedEvent = new CustomEvent("cartUpdated", {
      detail: { cart },
    });
    window.dispatchEvent(cartUpdatedEvent);
    toast.success(`Đã thêm món ${dish.tenMon} vào giỏ hàng!`, {
      duration: 2000,
      position: "top-right",
      style: {
        backgroundColor: "#4CAF50",
        color: "#fff",
        fontSize: "16px",
      },
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tất cả");
    setSelectedStatus("Tất cả");
    setPriceRange([0, 200000]);
    setMaxPrepTime(60);
    setSortBy("name");
    setShowFilters(false); // Close modal on mobile
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const parseIngredients = (ingredientsString) => {
    if (!ingredientsString) return [];
    return ingredientsString
      .split(",")
      .map((item) => item.trim())
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-white-100 flex flex-col">
      {/* Header with search and filters */}
      <div className="bg-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-700">
              Thực Đơn
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm sm:text-base shadow-md w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  showFilters
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label="Bộ lọc"
              >
                <Sliders className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Category filters */}
          <div className="mt-4 pb-2 overflow-x-auto overflow-y-hidden">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.maDanhMuc}
                  onClick={() => setSelectedCategory(category.maDanhMuc)}
                  className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                    selectedCategory === category.maDanhMuc
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {category.tenDanhMuc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal for Mobile */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-3 max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-out translate-y-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-amber-700">
                Bộ Lọc Nâng Cao
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-800 hover:text-gray-600 transition-colors duration-400"
                aria-label="Đóng bộ lọc"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Status filter */}
            <div className="mb-3">
              <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                Trạng thái
              </h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
              >
                {statusOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <h3 className="text-xs font-medium text-gray-700 mb-1.5">Giá</h3>
              <div className="flex justify-between mb-1.5">
                <span className="text-[0.65rem] text-gray-600">
                  {formatPrice(priceRange[0])}
                </span>
                <span className="text-[0.65rem] text-gray-600">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full h-1 bg-amber-100 rounded-lg cursor-pointer accent-amber-500"
              />
            </div>
            {/* Prep time */}
            <div className="mb-3">
              <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                Thời gian chuẩn bị (tối đa)
              </h3>
              <div className="flex justify-between mb-1.5">
                <span className="text-[0.65rem] text-gray-600">10 phút</span>
                <span className="text-[0.65rem] text-gray-600">
                  {maxPrepTime} phút
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={maxPrepTime}
                onChange={(e) => setMaxPrepTime(parseInt(e.target.value))}
                className="w-full h-1 bg-amber-100 rounded-lg cursor-pointer accent-amber-500"
              />
            </div>
            {/* Sort options */}
            <div className="mb-3">
              <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                Sắp xếp theo
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
              >
                <option value="name">Tên món ăn</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="w-full px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-all duration-200"
            >
              Đặt Lại
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 h-full">
          {/* Advanced filters sidebar */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center md:hidden">
              <div className="w-full max-w-md bg-white rounded-2xl p-4 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-bold text-amber-700">
                    Bộ Lọc Nâng Cao
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-600 hover:text-gray-400 transition-colors duration-200"
                    aria-label="Đóng bộ lọc"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Trạng thái */}
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                    Trạng thái
                  </h3>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                  >
                    {statusOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Giá */}
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                    Giá
                  </h3>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[0.65rem] text-gray-600">
                      {formatPrice(priceRange[0])}
                    </span>
                    <span className="text-[0.65rem] text-gray-600">
                      {formatPrice(priceRange[1])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-1 bg-amber-100 rounded-lg cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Thời gian chuẩn bị */}
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                    Thời gian chuẩn bị (tối đa)
                  </h3>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[0.65rem] text-gray-600">
                      10 phút
                    </span>
                    <span className="text-[0.65rem] text-gray-600">
                      {maxPrepTime} phút
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={maxPrepTime}
                    onChange={(e) => setMaxPrepTime(parseInt(e.target.value))}
                    className="w-full h-1 bg-amber-100 rounded-lg cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Sắp xếp */}
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-1.5">
                    Sắp xếp theo
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                  >
                    <option value="name">Tên món ăn</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-all duration-200"
                >
                  Đặt Lại
                </button>
              </div>
            </div>
          )}

          {/* Dishes grid */}
          <div className={`${showFilters ? "md:w-4/5" : "w-full"}`}>
            {isLoading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm sm:text-base">
                  Đang tải món ăn...
                </p>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Không tìm thấy món ăn phù hợp
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 sm:px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-all duration-200"
                >
                  Đặt Lại Bộ Lọc
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-4 gap-4 sm:gap-6">
                {filteredDishes.map((dish) => (
                  <li key={dish.maMon} className="relative group">
                    <Link to={`/menu/${dish.maMon}`} className="block h-full">
                      <div className="flex flex-col h-full bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-b from-amber-50 to-white border border-amber-100">
                        {/* Dish image */}
                        <div className="relative overflow-hidden rounded-t-xl">
                          <img
                            src={dish.hinhAnh || "/placeholder-dish.jpg"}
                            alt={dish.tenMon}
                            className="w-full h-32 sm:h-48 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-105 aspect-square"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "/placeholder-dish.jpg";
                            }}
                          />
                          {/* Status badge */}
                          {dish.tinhTrang && (
                            <div
                              className={`absolute bottom-2 left-2 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                                dish.tinhTrang === "Phổ biến"
                                  ? "bg-green-500"
                                  : dish.tinhTrang === "Món đặc biệt"
                                  ? "bg-purple-500 animate-pulse"
                                  : dish.tinhTrang === "Món mới"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-red-500"
                              }`}
                            >
                              {dish.tinhTrang}
                            </div>
                          )}
                          {/* Cart button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const isAdmin = role === "Admin";
                              if (isAdmin) {
                                toast.error(
                                  "Bạn không thể thêm món vào giỏ hàng khi đăng nhập với vai trò quản trị viên!",
                                  {
                                    duration: 2000,
                                    position: "top-right",
                                    style: {
                                      backgroundColor: "#f44336",
                                      color: "#fff",
                                      fontSize: "16px",
                                    },
                                  }
                                );
                                return;
                              }
                              addToCart(dish);
                            }}
                            className={`absolute top-2 right-2 p-2.5 rounded-full shadow-md transition-all duration-200 ${
                              dish.tinhTrang === "Hết hàng"
                                ? "bg-gray-300 opacity-50 cursor-not-allowed"
                                : "bg-amber-500 text-white hover:bg-amber-600 hover:scale-110 hover:rotate-12"
                            }`}
                            disabled={dish.tinhTrang === "Hết hàng"}
                            aria-label={`Thêm ${dish.tenMon} vào giỏ hàng`}
                          >
                            <ShoppingCart className="h-5 w-5" />
                          </button>
                        </div>
                        {/* Card content */}
                        <div className="p-3 sm:p-4 flex flex-col flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-1">
                            {dish.tenMon}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                            {dish.moTa || "Không có mô tả"}
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                            {parseIngredients(dish.thanhPhan).map(
                              (ingredient, index) => (
                                <span
                                  key={index}
                                  className="bg-amber-50 text-xs sm:text-sm font-medium px-2 py-1 rounded-full text-amber-700"
                                >
                                  {ingredient}
                                </span>
                              )
                            )}
                            {dish.thanhPhan &&
                              dish.thanhPhan.split(",").length > 3 && (
                                <span className="bg-amber-50 text-xs sm:text-sm font-medium px-2 py-1 rounded-full text-amber-700">
                                  +{dish.thanhPhan.split(",").length - 3}
                                </span>
                              )}
                          </div>
                          {/* Price and meta */}
                          <div className="flex justify-between items-center mt-auto">
                            <div className="flex flex-col">
                              <span className="text-base sm:text-lg font-semibold text-amber-700">
                                {formatPrice(dish.gia)}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {dish.thoiGianMon
                                  ? `${dish.thoiGianMon} phút`
                                  : ""}
                                {dish.tenDanhMuc && ` • ${dish.tenDanhMuc}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;
