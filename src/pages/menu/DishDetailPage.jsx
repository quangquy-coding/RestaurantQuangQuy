"use client";
import React from "react";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { getDishDetail, getAllDishes } from "../../api/menuApi";

const DishDetailPage = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedDishes, setRelatedDishes] = useState([]);

  useEffect(() => {
    const fetchDishDetail = async () => {
      try {
        setLoading(true);

        // Fetch dish detail
        const dishData = await getDishDetail(id);
        setDish(dishData);

        // Fetch related dishes (same category)
        if (dishData.maDanhMuc) {
          const allDishes = await getAllDishes();
          const related = allDishes
            .filter(
              (d) =>
                d.maDanhMuc === dishData.maDanhMuc && d.maMon !== dishData.maMon
            )
            .slice(0, 4); // Limit to 4 related dishes
          setRelatedDishes(related);
        }
      } catch (error) {
        console.error("Error fetching dish detail:", error);
        toast.error("Lỗi khi tải thông tin món ăn", {
          duration: 3000,
          position: "top-right",
          style: {
            backgroundColor: "#f44336", // đỏ
            color: "#fff",
            fontSize: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDishDetail();
    }
  }, [id]);

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = () => {
    if (!dish) return;

    // Get current cart from localStorage
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === dish.maMon
    );

    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.push({
        id: dish.maMon,
        name: dish.tenMon,
        price: dish.gia,
        image: dish.hinhAnh,
        quantity: quantity,
      });
    }

    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));

    // Show success message
    toast.success(`Đã thêm ${quantity} ${dish.tenMon} vào giỏ hàng!`, {
      duration: 2000,
      position: "top-right",
      style: {
        backgroundColor: "#4CAF50",
        color: "#fff",
        fontSize: "16px",
        padding: "12px 16px",
        borderRadius: "8px",
      },
    });
  };

  const parseIngredients = (ingredientsString) => {
    if (!ingredientsString) return [];
    return ingredientsString.split(",").map((item) => item.trim());
  };

  const parseNutrition = (nutritionString) => {
    if (!nutritionString) return {};
    try {
      // Assuming nutrition is stored as JSON string or comma-separated values
      const parts = nutritionString.split(",");
      return {
        calories: parts[0] || "N/A",
        protein: parts[1] || "N/A",
        carbs: parts[2] || "N/A",
        fat: parts[3] || "N/A",
      };
    } catch {
      return { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" };
    }
  };

  const parseAllergens = (allergensString) => {
    if (!allergensString) return [];
    return allergensString.split(",").map((item) => item.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy món ăn</h2>
        <Link to="/menu" className="text-blue-600 hover:underline">
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  const ingredients = parseIngredients(dish.thanhPhan);
  const nutrition = parseNutrition(dish.dinhDuong);
  const allergens = parseAllergens(dish.diUng);

  // Create multiple images array (for demo, using same image)
  const images = dish.hinhAnh
    ? [dish.hinhAnh, dish.hinhAnh, dish.hinhAnh]
    : ["/placeholder.svg"];

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back button */}
        <Link
          to="/menu"
          className="inline-flex items-center text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại thực đơn
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image gallery */}
            <div className="md:w-1/2 p-4">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={dish.tenMon}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
                {dish.tinhTrang === "Món đặc biệt" && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Đặc biệt
                  </div>
                )}
                {dish.tinhTrang === "Món mới" && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Mới
                  </div>
                )}
              </div>

              {/* Thumbnail images */}
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${dish.tenMon} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dish details */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-2">{dish.tenMon}</h1>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">4.5</span>
                  <span className="text-gray-500 ml-1">(50 đánh giá)</span>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {dish.tenDanhMuc} •{" "}
                {dish.thoiGianMon
                  ? `${dish.thoiGianMon} phút chuẩn bị`
                  : "Thời gian chuẩn bị: 15 phút"}
              </div>

              <p className="text-2xl font-bold text-blue-600 mb-6">
                {dish.gia.toLocaleString("vi-VN")} ₫
              </p>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
                <p className="text-gray-700">{dish.moTa}</p>
              </div>

              {ingredients.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Thành phần</h2>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dish.dinhDuong && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">
                    Thông tin dinh dưỡng
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Calories</div>
                      <div className="font-medium">{nutrition.calories}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Protein</div>
                      <div className="font-medium">{nutrition.protein}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Carbs</div>
                      <div className="font-medium">{nutrition.carbs}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-500">Fat</div>
                      <div className="font-medium">{nutrition.fat}</div>
                    </div>
                  </div>
                </div>
              )}

              {allergens.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Chứa dị ứng</h2>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart section */}
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="mx-4 font-medium text-lg w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    disabled={dish.tinhTrang === "Hết hàng"}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      dish.tinhTrang === "Hết hàng"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {dish.tinhTrang === "Hết hàng"
                      ? "Hết hàng"
                      : "Thêm vào giỏ hàng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related dishes */}
        {relatedDishes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Món ăn liên quan</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedDishes.map((relatedDish) => (
                <Link
                  to={`/menu/${relatedDish.maMon}`}
                  key={relatedDish.maMon}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-56 md:h-64 lg:h-72">
                    <img
                      src={relatedDish.hinhAnh || "/placeholder.svg"}
                      alt={relatedDish.tenMon}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                    {relatedDish.tinhTrang === "Món đặc biệt" && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Đặc biệt
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">
                      {relatedDish.tenMon}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {relatedDish.moTa}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">
                        {relatedDish.gia.toLocaleString("vi-VN")} ₫
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm">4.5</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishDetailPage;
