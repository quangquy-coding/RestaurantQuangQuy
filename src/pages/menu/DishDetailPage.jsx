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
        const dishData = await getDishDetail(id);
        setDish(dishData);
        if (dishData.maDanhMuc) {
          const allDishes = await getAllDishes();
          const related = allDishes
            .filter(
              (d) =>
                d.maDanhMuc === dishData.maDanhMuc && d.maMon !== dishData.maMon
            )
            .slice(0, 4);
          setRelatedDishes(related);
        }
      } catch (error) {
        console.error("Error fetching dish detail:", error);
        toast.error("Lỗi khi tải thông tin món ăn", {
          duration: 3000,
          position: "top-right",
          style: {
            backgroundColor: "#f44336",
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
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === dish.maMon
    );
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: dish.maMon,
        name: dish.tenMon,
        price: dish.gia,
        image: dish.hinhAnh,
        quantity: quantity,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));
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
        <div className="animate-spin animate-pulse rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy món ăn</h2>
        <Link to="/menu" className="text-amber-600 hover:underline">
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  const ingredients = parseIngredients(dish.thanhPhan);
  const nutrition = parseNutrition(dish.dinhDuong);
  const allergens = parseAllergens(dish.diUng);
  const images = dish.hinhAnh
    ? [dish.hinhAnh, dish.hinhAnh, dish.hinhAnh]
    : ["/placeholder-dish.jpg"];

  return (
    <div className="min-h-screen bg-gray-100 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link
          to="/menu"
          className="inline-flex items-center text-amber-600 hover:-translate-x-1 hover:underline hover:underline-offset-4 transition-all duration-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại thực đơn
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-slide-up hover:scale-102 transition-transform duration-300">
          <div className="md:flex">
            {/* Image gallery */}
            <div className="md:w-1/2 p-4 sm:p-6">
              <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[selectedImage] || "/placeholder-dish.jpg"}
                  alt={dish.tenMon}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    e.target.src = "/placeholder-dish.jpg";
                  }}
                />
                {dish.tinhTrang === "Món đặc biệt" && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    Đặc biệt
                  </div>
                )}
                {dish.tinhTrang === "Món mới" && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    Mới
                  </div>
                )}
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index
                        ? "border-amber-500"
                        : "border-transparent hover:scale-105 hover:brightness-110"
                    } transition-all duration-200`}
                  >
                    <img
                      src={img || "/placeholder-dish.jpg"}
                      alt={`${dish.tenMon} ${index + 1}`}
                      className="text-white w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = "/placeholder-dish.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dish details */}
            <div className="md:w-1/2 p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {dish.tenMon}
                </h1>
                <div className="flex items-center group">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 group-hover:animate-pulse" />
                  <span className="ml-1 font-medium">4.5</span>
                  <span className="text-gray-500 ml-1 text-sm">
                    (50 đánh giá)
                  </span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-500 mb-4">
                {dish.tenDanhMuc} •{" "}
                {dish.thoiGianMon
                  ? `${dish.thoiGianMon} phút chuẩn bị`
                  : "Thời gian chuẩn bị: 15 phút"}
              </div>

              <p className="text-xl sm:text-2xl font-bold text-amber-700 mb-6">
                {dish.gia.toLocaleString("vi-VN")} ₫
              </p>

              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-semibold mb-2">
                  Mô tả
                </h2>
                <p className="text-gray-700 text-sm sm:text-base">
                  {dish.moTa || "Không có mô tả"}
                </p>
              </div>

              {ingredients.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-2">
                    Thành phần
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-amber-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-amber-700"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dish.dinhDuong && (
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-2">
                    Thông tin dinh dưỡng
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs text-gray-500">Calories</div>
                      <div className="font-medium text-sm">
                        {nutrition.calories}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs text-gray-500">Protein</div>
                      <div className="font-medium text-sm">
                        {nutrition.protein}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs text-gray-500">Carbs</div>
                      <div className="font-medium text-sm">
                        {nutrition.carbs}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                      <div className="text-xs text-gray-500">Fat</div>
                      <div className="font-medium text-sm">{nutrition.fat}</div>
                    </div>
                  </div>
                </div>
              )}

              {allergens.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-2">
                    Chứa dị ứng
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="bg-red-50 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart section */}
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-gray-300 flex items-center justify-center hover:scale-110 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <span className="mx-4 font-medium text-base sm:text-lg w-6 sm:w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-gray-300 flex items-center justify-center hover:scale-110 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    disabled={dish.tinhTrang === "Hết hàng"}
                    className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                      dish.tinhTrang === "Hết hàng"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-amber-500 text-white hover:bg-amber-600 active:animate-bounce"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
          <div className="mt-12 animate-slide-up">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              Món ăn liên quan
            </h2>
            <div className="grid grid-cols-4 gap-4 sm:gap-6">
              {relatedDishes.map((relatedDish, index) => (
                <Link
                  to={`/menu/${relatedDish.maMon}`}
                  key={relatedDish.maMon}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-102 hover:shadow-xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 sm:h-56 md:h-64">
                    <img
                      src={relatedDish.hinhAnh || "/placeholder-dish.jpg"}
                      alt={relatedDish.tenMon}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-dish.jpg";
                      }}
                    />
                    {relatedDish.tinhTrang === "Món đặc biệt" && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        Đặc biệt
                      </div>
                    )}
                    {relatedDish.tinhTrang === "Món mới" && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        Mới
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-1">
                      {relatedDish.tenMon}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">
                      {relatedDish.moTa || "Không có mô tả"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm sm:text-base text-amber-700">
                        {relatedDish.gia.toLocaleString("vi-VN")} ₫
                      </span>
                      <div className="flex items-center group">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 group-hover:animate-pulse" />
                        <span className="ml-1 text-xs sm:text-sm">4.5</span>
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
