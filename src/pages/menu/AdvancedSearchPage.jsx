import React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Sliders, ShoppingCart, } from "lucide-react"
import { FaEye } from 'react-icons/fa';
import Phobotai from '../../assets/phobotai.png'
import Tomthit from '../../assets/tomthit.jpg'
import Buncha from '../../assets/buncha.jpg'
import Comrang from '../../assets/comrang.jpg'
import Chekhucbach from '../../assets/chekhucbach.jpg'
import Tradaocamsa from '../../assets/tradaocamsa.webp'

import Banhxeo1 from "../../assets/banhxeo1.jpeg";
import Caphesua from "../../assets/caphesua.jpg"
import Goingosen from '../../assets/goingosen.avif'
import Canhchuacaloc from '../../assets/canhchuacaloc.jpg'
import Comgahainam from '../../assets/comgahainam.webp'
import Chethai from  '../../assets/chethai.jpg'



// Mock data for menu items (same as in MenuPage)
const mockMenuItems = [
  {
    id: 1,
    name: "Phở bò tái",
    category: "Món chính",
    price: 85000,
    description: "Phở bò truyền thống với thịt bò tái",
    image: Phobotai,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Không chay"],
    ingredients: ["Bánh phở", "Thịt bò", "Hành", "Gừng", "Gia vị"],
    spicyLevel: 1, // 1-5
    prepTime: 15, // minutes
    calories: 520,
  },
  {
    id: 2,
    name: "Gỏi cuốn tôm thịt",
    category: "Món khai vị",
    price: 65000,
    description: "Gỏi cuốn tươi với tôm và thịt heo",
    image: Tomthit,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Không chay", "Không gluten"],
    ingredients: ["Bánh tráng", "Tôm", "Thịt heo", "Rau sống", "Bún"],
    spicyLevel: 0,
    prepTime: 10,
    calories: 320,
  },
  {
    id: 3,
    name: "Cơm rang hải sản",
    category: "Món chính",
    price: 95000,
    description: "Cơm rang với các loại hải sản tươi ngon",
    image: Comrang,
    isAvailable: true,
    isSpecial: true,
    dietaryInfo: ["Không chay"],
    ingredients: ["Cơm", "Tôm", "Mực", "Cua", "Rau củ", "Gia vị"],
    spicyLevel: 2,
    prepTime: 20,
    calories: 580,
  },
  {
    id: 4,
    name: "Chè khúc bạch",
    category: "Món tráng miệng",
    price: 45000,
    description: "Chè khúc bạch mát lạnh",
    image: Chekhucbach,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Chay", "Không gluten"],
    ingredients: ["Sữa", "Gelatin", "Đường", "Trái cây"],
    spicyLevel: 0,
    prepTime: 5,
    calories: 250,
  },
  {
    id: 5,
    name: "Trà đào cam sả",
    category: "Đồ uống",
    price: 35000,
    description: "Trà đào thơm mát với cam và sả",
    image: Tradaocamsa,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Chay", "Không gluten", "Không đường"],
    ingredients: ["Trà", "Đào", "Cam", "Sả", "Đường"],
    spicyLevel: 0,
    prepTime: 5,
    calories: 120,
  },
  {
    id: 6,
    name: "Bún chả Hà Nội",
    category: "Món chính",
    price: 75000,
    description: "Bún chả truyền thống kiểu Hà Nội",
    image: Buncha,
    isAvailable: true,
    isSpecial: true,
    dietaryInfo: ["Không chay"],
    ingredients: ["Bún", "Thịt lợn", "Rau sống", "Nước mắm", "Gia vị"],
    spicyLevel: 2,
    prepTime: 15,
    calories: 490,
  },
  {
    id: 7,
    name: "Bánh xèo",
    category: "Món chính",
    price: 80000,
    description: "Bánh xèo giòn với nhân tôm, thịt, giá đỗ",
    image: Banhxeo1,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Không chay"],
    ingredients: ["Bột gạo", "Tôm", "Thịt", "Giá đỗ", "Rau sống", "Nước mắm"],
    spicyLevel: 1,
    prepTime: 15,
    calories: 450,
  },
  {
    id: 8,
    name: "Cà phê sữa đá",
    category: "Đồ uống",
    price: 30000,
    description: "Cà phê đen đậm đà với sữa đặc",
    image: Caphesua,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Chay", "Không gluten"],
    ingredients: ["Cà phê", "Sữa đặc", "Đá"],
    spicyLevel: 0,
    prepTime: 5,
    calories: 180,
  },
  {
    id: 9,
    name: "Gỏi ngó sen tôm thịt",
    category: "Món khai vị",
    price: 70000,
    description: "Gỏi ngó sen giòn ngọt với tôm thịt",
    image: Goingosen,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Không chay"],
    ingredients: ["Ngó sen", "Tôm", "Thịt heo", "Rau răm", "Nước mắm chua ngọt"],
    spicyLevel: 3,
    prepTime: 15,
    calories: 280,
  },
  {
    id: 10,
    name: "Canh chua cá lóc",
    category: "Món chính",
    price: 90000,
    description: "Canh chua cá lóc đậm đà với các loại rau củ",
    image: Canhchuacaloc,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Không chay", "Không gluten"],
    ingredients: ["Cá lóc", "Dứa", "Đậu bắp", "Me", "Rau ngổ", "Gia vị"],
    spicyLevel: 2,
    prepTime: 25,
    calories: 320,
  },
  {
    id: 11,
    name: "Cơm gà Hải Nam",
    category: "Món chính",
    price: 85000,
    description: "Cơm gà Hải Nam với gà mềm, thơm và cơm nấu với nước luộc gà",
    image: Comgahainam,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Không chay"],
    ingredients: ["Gà", "Gạo", "Gừng", "Hành", "Gia vị", "Nước chấm"],
    spicyLevel: 1,
    prepTime: 30,
    calories: 550,
  },
  {
    id: 12,
    name: "Chè thái",
    category: "Món tráng miệng",
    price: 40000,
    description: "Chè thái với nhiều loại thạch, trái cây và sữa dừa",
    image: Chethai,
    isAvailable: true,
    isSpecial: false,
    dietaryInfo: ["Chay", "Không gluten"],
    ingredients: ["Thạch", "Trái cây", "Sữa dừa", "Đường"],
    spicyLevel: 0,
    prepTime: 10,
    calories: 300,
  },
]

// Mock data for categories
const categories = ["Tất cả", "Món chính", "Món khai vị", "Món tráng miệng", "Đồ uống"]

// Mock data for dietary options
const dietaryOptions = ["Chay", "Không chay", "Không gluten", "Không đường"]

const AdvancedSearchPage = () => {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [cartCount, setCartCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedDietary, setSelectedDietary] = useState([])
  const [spicyLevel, setSpicyLevel] = useState(0)
  const [maxPrepTime, setMaxPrepTime] = useState(30)
  const [maxCalories, setMaxCalories] = useState(600)
  const [sortBy, setSortBy] = useState("popularity") // popularity, price-asc, price-desc, name

  useEffect(() => {
    // In a real app, you would fetch menu items from an API
    setMenuItems(mockMenuItems)
    setFilteredItems(mockMenuItems)

    // Get cart count from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      const count = parsedCart.reduce((acc, item) => acc + item.quantity, 0)
      setCartCount(count)
    }
  }, [])

  useEffect(() => {
    // Filter menu items based on all criteria
    let filtered = menuItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by category
    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Filter by price range
    filtered = filtered.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1])

    // Filter by dietary options
    if (selectedDietary.length > 0) {
      filtered = filtered.filter((item) => selectedDietary.every((diet) => item.dietaryInfo.includes(diet)))
    }

    // Filter by spicy level
    if (spicyLevel > 0) {
      filtered = filtered.filter((item) => item.spicyLevel <= spicyLevel)
    }

    // Filter by prep time
    filtered = filtered.filter((item) => item.prepTime <= maxPrepTime)

    // Filter by calories
    filtered = filtered.filter((item) => item.calories <= maxCalories)

    // Sort items
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "popularity":
      default:
        // Assuming id is somewhat related to popularity for mock data
        filtered.sort((a, b) => (a.isSpecial === b.isSpecial ? 0 : a.isSpecial ? -1 : 1))
        break
    }

    setFilteredItems(filtered)
  }, [
    searchTerm,
    selectedCategory,
    menuItems,
    priceRange,
    selectedDietary,
    spicyLevel,
    maxPrepTime,
    maxCalories,
    sortBy,
  ])

  const addToCart = (item) => {
    // Get current cart from localStorage
    const savedCart = localStorage.getItem("cart")
    const cart = savedCart ? JSON.parse(savedCart) : []
  
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id)
  
    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      cart[existingItemIndex].quantity += 1
    } else {
      // Add new item to cart
      cart.push({
        ...item,
        quantity: 1,
      })
    }
  
    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
  
    // 🔔 Phát custom event để Header tự cập nhật
    const cartUpdatedEvent = new CustomEvent("cartUpdated", {
      detail: { cart }
    })
    window.dispatchEvent(cartUpdatedEvent)
  }
  

  const toggleDietaryOption = (option) => {
    if (selectedDietary.includes(option)) {
      setSelectedDietary(selectedDietary.filter((item) => item !== option))
    } else {
      setSelectedDietary([...selectedDietary, option])
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Tất cả")
    setPriceRange([0, 100000])
    setSelectedDietary([])
    setSpicyLevel(0)
    setMaxPrepTime(30)
    setMaxCalories(600)
    setSortBy("popularity")
  }

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " ₫"
  }

  return (
    <div className="min-h-screen bg-gray-50  bg-red-50">
      {/* Header with search and filters */}
      <div className="bg-white shadow-sm sticky top-0 z-10 ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold ">Danh mục</h1>
  
            <div className="flex items-center">
              <div className="relative mr-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, nguyên liệu..."
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
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  
      <div className="max-w-7xl mx-auto px-4 py-6 ">
        <div className="flex flex-row gap-6 ">
          {/* Advanced filters sidebar */}
          {showFilters && (
            <div className="md:w-1/4 bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Bộ lọc nâng cao</h2>
                <button onClick={resetFilters} className="text-blue-600 text-sm hover:underline">
                  Đặt lại
                </button>
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
                  max="100000"
                  step="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
  
              {/* Dietary options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Chế độ ăn</h3>
                <div className="space-y-2">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`diet-${option}`}
                        checked={selectedDietary.includes(option)}
                        onChange={() => toggleDietaryOption(option)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`diet-${option}`} className="ml-2 text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
  
              {/* Spicy level */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Độ cay (tối đa)</h3>
                <div className="flex items-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSpicyLevel(level)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        spicyLevel >= level ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
  
              {/* Prep time */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Thời gian chuẩn bị (tối đa)</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">5 phút</span>
                  <span className="text-sm text-gray-500">{maxPrepTime} phút</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
  
              {/* Calories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Calories (tối đa)</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">100 cal</span>
                  <span className="text-sm text-gray-500">{maxCalories} cal</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="50"
                  value={maxCalories}
                  onChange={(e) => setMaxCalories(Number.parseInt(e.target.value))}
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
                  <option value="popularity">Phổ biến nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="name">Tên món ăn</option>
                </select>
              </div>
            </div>
          )}
  
          {/* Menu items grid */}
          <div className={`${showFilters ? "md:w-3/4" : "w-full"}`}>
  {filteredItems.length === 0 ? (
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
  {filteredItems.map((item) => (
    <div key={item.id} className="relative h-full">
      <Link to={`/menu/${item.id}`} className="block h-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
          {/* Ảnh món ăn */}
          <div className="relative w-full aspect-[4/3] bg-gray-100">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover rounded-t-lg"
              loading="lazy"
            />
            {item.isSpecial && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Đặc biệt
              </div>
            )}
          </div>

          {/* Nội dung card */}
          <div className="p-4 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                {item.spicyLevel > 0 && (
                  <div className="flex">
                    {[...Array(item.spicyLevel)].map((_, i) => (
                      <span key={i} className="text-red-500">🌶️</span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.ingredients.slice(0, 3).map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-xs px-2 py-1 rounded-full"
                  >
                    {ingredient}
                  </span>
                ))}
                {item.ingredients.length > 3 && (
                  <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                    +{item.ingredients.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Giá và thời gian */}
            <div className="flex justify-between items-center mt-auto">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-800 ml-2">
                  {item.price.toLocaleString("vi-VN")} ₫
                </span>
                <div className="text-xs text-gray-500">
                  {item.prepTime} phút • {item.calories} cal
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Nút giỏ hàng */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(item);
        }}
        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors text-sm"
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
