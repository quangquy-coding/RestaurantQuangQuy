"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast";
import { Search, Sliders, ShoppingCart } from "lucide-react"
import { getAllDishes, searchDishes, getCategories, getStatusOptions } from "../../api/menuApi"

const AdvancedSearchPage = () => {
  const [dishes, setDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [maxPrepTime, setMaxPrepTime] = useState(60)
  const [sortBy, setSortBy] = useState("name") // name, price-asc, price-desc

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const dishesData = await getAllDishes()
        setDishes(dishesData)
        setFilteredDishes(dishesData)
        const categoriesData = await getCategories()
        setCategories([{ maDanhMuc: "Tất cả", tenDanhMuc: "Tất cả" }, ...categoriesData])
        const statusData = await getStatusOptions()
        setStatusOptions(["Tất cả", ...statusData])
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Lỗi khi tải dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Filter and search dishes
  useEffect(() => {
    const filterDishes = async () => {
      try {
        let filtered = dishes
        if (searchTerm || selectedCategory !== "Tất cả" || selectedStatus !== "Tất cả") {
          const searchResults = await searchDishes(
            searchTerm || undefined,
            selectedCategory !== "Tất cả" ? selectedCategory : undefined,
            selectedStatus !== "Tất cả" ? selectedStatus : undefined,
          )
          filtered = searchResults
        }
        filtered = filtered.filter((dish) => dish.gia >= priceRange[0] && dish.gia <= priceRange[1])
        if (maxPrepTime < 60) {
          filtered = filtered.filter((dish) => {
            const prepTime = dish.thoiGianMon || 30
            return prepTime <= maxPrepTime
          })
        }
        switch (sortBy) {
          case "price-asc":
            filtered.sort((a, b) => a.gia - b.gia)
            break
          case "price-desc":
            filtered.sort((a, b) => b.gia - a.gia)
            break
          case "name":
          default:
            filtered.sort((a, b) => a.tenMon.localeCompare(b.tenMon))
            break
        }
        setFilteredDishes(filtered)
      } catch (error) {
        console.error("Error filtering dishes:", error)
      }
    }
    filterDishes()
  }, [searchTerm, selectedCategory, selectedStatus, dishes, priceRange, maxPrepTime, sortBy])

  const addToCart = (dish) => {
    const savedCart = localStorage.getItem("cart")
    const cart = savedCart ? JSON.parse(savedCart) : []
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === dish.maMon)
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1
    } else {
      cart.push({
        id: dish.maMon,
        name: dish.tenMon,
        price: dish.gia,
        image: dish.hinhAnh,
        quantity: 1,
      })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    const cartUpdatedEvent = new CustomEvent("cartUpdated", { detail: { cart } })
    window.dispatchEvent(cartUpdatedEvent)
     toast.success("Đã thêm món " + dish.tenMon + " vào giỏ hàng!", {
      duration: 2000,
      position: "top-right",
      style: {
        backgroundColor: "#4CAF50",
        color: "#fff",
        fontSize: "16px",
      },
    });
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Tất cả")
    setSelectedStatus("Tất cả")
    setPriceRange([0, 200000])
    setMaxPrepTime(60)
    setSortBy("name")
  }

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " ₫"
  }

  const parseIngredients = (ingredientsString) => {
    if (!ingredientsString) return []
    return ingredientsString
      .split(",")
      .map((item) => item.trim())
      .slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with search and filters */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-xl font-bold">Thực đơn</h1>
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-full hover:bg-gray-100 ${showFilters ? "bg-blue-50 text-blue-600" : ""}`}
              >
                <Sliders className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Category filters */}
          <div className="mt-3 pb-2 overflow-x-auto">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.maDanhMuc}
                  onClick={() => setSelectedCategory(category.maDanhMuc)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                    selectedCategory === category.maDanhMuc
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {category.tenDanhMuc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto px-4 py-4 w-full">
        <div className="flex flex-row gap-4 h-full">
          {/* Advanced filters sidebar */}
          {showFilters && (
            <div className="md:w-1/4 bg-white p-3 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-sm">Bộ lọc nâng cao</h2>
                <button onClick={resetFilters} className="text-blue-600 text-xs hover:underline">
                  Đặt lại
                </button>
              </div>
              {/* Status filter */}
              <div className="mb-4">
                <h3 className="text-xs font-medium mb-1">Trạng thái</h3>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              {/* Price range filter */}
              <div className="mb-4">
                <h3 className="text-xs font-medium mb-1">Khoảng giá</h3>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{formatPrice(priceRange[0])}</span>
                  <span className="text-xs text-gray-500">{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                  className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              {/* Prep time */}
              <div className="mb-4">
                <h3 className="text-xs font-medium mb-1">Thời gian chuẩn bị (tối đa)</h3>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">10 phút</span>
                  <span className="text-xs text-gray-500">{maxPrepTime} phút</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(Number.parseInt(e.target.value))}
                  className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              {/* Sort options */}
              <div>
                <h3 className="text-xs font-medium mb-1">Sắp xếp theo</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Tên món ăn</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>
          )}
          {/* Dishes grid */}
          <div className={`${showFilters ? "md:w-3/4" : "w-full"}`}>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-500 text-sm">Đang tải món ăn...</p>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-500 mb-3 text-sm">Không tìm thấy món ăn phù hợp</p>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredDishes.map((dish) => (
                  <div key={dish.maMon} className="relative h-full">
                    <Link to={`/menu/${dish.maMon}`} className="block h-full">
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        {/* Ảnh món ăn */}
                       <div className="relative w-full h-75 md:h-65 bg-gray-100 overflow-hidden rounded-t-lg">
  <img
    src={dish.hinhAnh || "/placeholder.svg"}
    alt={dish.tenMon}
    className="w-full h-full object-cover"
    loading="lazy"
    onError={(e) => {
      e.target.src = "/placeholder.svg"
    }}
  />
  {/* Trạng thái món ăn */}
  {dish.tinhTrang === "Còn hàng" && (
<div className="absolute top-1 left-1 bg-green-800 text-white text-[10px] px-2 py-0.5 rounded-full">
  Còn hàng
</div>
                )}

  {dish.tinhTrang === "Món đặc biệt" && (
    <div className="absolute top-1 left-1 bg-purple-800 text-white text-[10px] px-2 py-0.5 rounded-full">
      Đặc biệt
    </div>
  )}

  {dish.tinhTrang === "Món mới" && (
    <div className="absolute top-1 left-1 bg-yellow-800 text-white text-[10px] px-2 py-0.5 rounded-full">
      Mới
    </div>
  )}
  {dish.tinhTrang === "Hết hàng" && (
    <div className="absolute top-1 left-1 bg-red-800 text-white text-[10px] px-2 py-0.5 rounded-full">
      Hết hàng
    </div>
  )}


</div>


                        {/* Nội dung card */}
                        <div className="p-3 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="font-bold text-sm mb-1 line-clamp-1">{dish.tenMon}</h3>
                            <p className="text-gray-600 text-xs mb-2 line-clamp-2">{dish.moTa}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {parseIngredients(dish.thanhPhan).map((ingredient, index) => (
                                <span key={index} className="bg-gray-100 text-xs px-1.5 py-0.5 rounded-full">
                                  {ingredient}
                                </span>
                              ))}
                              {dish.thanhPhan && dish.thanhPhan.split(",").length > 3 && (
                                <span className="bg-gray-100 text-xs px-1.5 py-0.5 rounded-full">
                                  +{dish.thanhPhan.split(",").length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Giá và thời gian */}
                          <div className="flex justify-between items-center mt-auto">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-gray-800">
                                {dish.gia.toLocaleString("vi-VN")} ₫
                              </span>
                              <div className="text-xs text-gray-500">
                                {dish.thoiGianMon ? `${dish.thoiGianMon} phút` : ""}
                                {dish.tenDanhMuc && ` • ${dish.tenDanhMuc}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {/* Nút giỏ hàng */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(dish)
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors text-sm"
                      disabled={dish.tinhTrang === "Hết hàng"}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearchPage