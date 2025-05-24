"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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

        // Fetch dishes
        const dishesData = await getAllDishes()
        setDishes(dishesData)
        setFilteredDishes(dishesData)

        // Fetch categories
        const categoriesData = await getCategories()
        setCategories([{ maDanhMuc: "Tất cả", tenDanhMuc: "Tất cả" }, ...categoriesData])

        // Fetch status options
        const statusData = await getStatusOptions()
        setStatusOptions(["Tất cả", ...statusData])
      } catch (error) {
        console.error("Error fetching initial data:", error)
        alert("Lỗi khi tải dữ liệu")
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

        // Apply search and category filter via API if needed
        if (searchTerm || selectedCategory !== "Tất cả" || selectedStatus !== "Tất cả") {
          const searchResults = await searchDishes(
            searchTerm || undefined,
            selectedCategory !== "Tất cả" ? selectedCategory : undefined,
            selectedStatus !== "Tất cả" ? selectedStatus : undefined,
          )
          filtered = searchResults
        }

        // Apply client-side filters
        // Filter by price range
        filtered = filtered.filter((dish) => dish.gia >= priceRange[0] && dish.gia <= priceRange[1])

        // Filter by prep time (if available)
        if (maxPrepTime < 60) {
          filtered = filtered.filter((dish) => {
            const prepTime = dish.thoiGianMon || 30 // Default 30 minutes if not specified
            return prepTime <= maxPrepTime
          })
        }

        // Sort dishes
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
    // Get current cart from localStorage
    const savedCart = localStorage.getItem("cart")
    const cart = savedCart ? JSON.parse(savedCart) : []

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === dish.maMon)

    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      cart[existingItemIndex].quantity += 1
    } else {
      // Add new item to cart
      cart.push({
        id: dish.maMon,
        name: dish.tenMon,
        price: dish.gia,
        image: dish.hinhAnh,
        quantity: 1,
      })
    }

    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Dispatch custom event để Header tự cập nhật
    const cartUpdatedEvent = new CustomEvent("cartUpdated", {
      detail: { cart },
    })
    window.dispatchEvent(cartUpdatedEvent)

    alert(`Đã thêm ${dish.tenMon} vào giỏ hàng!`)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with search and filters */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Danh mục món ăn</h1>

            <div className="flex items-center">
              <div className="relative mr-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full hover:bg-gray-100 mr-2 ${showFilters ? "bg-blue-50 text-blue-600" : ""}`}
              >
                <Sliders className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-4 pb-2 overflow-x-auto">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.maDanhMuc}
                  onClick={() => setSelectedCategory(category.maDanhMuc)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-row gap-6">
          {/* Advanced filters sidebar */}
          {showFilters && (
            <div className="md:w-1/4 bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Bộ lọc nâng cao</h2>
                <button onClick={resetFilters} className="text-blue-600 text-sm hover:underline">
                  Đặt lại
                </button>
              </div>

              {/* Status filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Trạng thái</h3>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Khoảng giá</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">{formatPrice(priceRange[0])}</span>
                  <span className="text-sm text-gray-500">{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Prep time */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Thời gian chuẩn bị (tối đa)</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">10 phút</span>
                  <span className="text-sm text-gray-500">{maxPrepTime} phút</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sort options */}
              <div>
                <h3 className="text-sm font-medium mb-2">Sắp xếp theo</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Đang tải món ăn...</p>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 mb-4">Không tìm thấy món ăn phù hợp</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {filteredDishes.map((dish) => (
                  <div key={dish.maMon} className="relative h-full">
                    <Link to={`/menu/${dish.maMon}`} className="block h-full">
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                        {/* Ảnh món ăn */}
                        <div className="relative w-full aspect-[4/3] bg-gray-100">
                          <img
                            src={dish.hinhAnh || "/placeholder.svg"}
                            alt={dish.tenMon}
                            className="w-full h-full object-cover rounded-t-lg"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                          {dish.tinhTrang === "Món đặc biệt" && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Đặc biệt
                            </div>
                          )}
                          {dish.tinhTrang === "Món mới" && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Mới
                            </div>
                          )}
                        </div>

                        {/* Nội dung card */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-lg">{dish.tenMon}</h3>
                            </div>

                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{dish.moTa}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {parseIngredients(dish.thanhPhan).map((ingredient, index) => (
                                <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                                  {ingredient}
                                </span>
                              ))}
                              {dish.thanhPhan && dish.thanhPhan.split(",").length > 3 && (
                                <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                                  +{dish.thanhPhan.split(",").length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Giá và thời gian */}
                          <div className="flex justify-between items-center mt-auto">
                            <div className="flex flex-col">
                              <span className="font-bold text-lg text-gray-800">
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
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors text-sm"
                      disabled={dish.tinhTrang === "Hết hàng"}
                    >
                      <ShoppingCart className="h-5 w-5" />
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
