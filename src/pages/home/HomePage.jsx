import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Clock, MapPin, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

import Quy from "../../assets/quy.jpg";
import Nhahang1 from "../../assets/nhahang2025.jpg";
import Nhahang2 from "../../assets/nhahang2.jpg"; // Placeholder, replace with actual image
import Nhahang3 from "../../assets/nhahang3.jpg"; // Placeholder, replace with actual image

const HomePage = () => {
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [errorFeatured, setErrorFeatured] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [errorTestimonials, setErrorTestimonials] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Images for carousel
  const carouselImages = [Nhahang1, Nhahang2, Nhahang3];

  // Auto-slide for carousel
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, carouselImages.length]);

  // Fetch featured dishes
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      setErrorFeatured(null);
      try {
        const res = await fetch(
          "http://localhost:5080/api/MonAnManager/NoiBat"
        );
        if (!res.ok) throw new Error("Lỗi khi lấy món ăn nổi bật");
        const data = await res.json();
        setFeaturedDishes(data);
      } catch (err) {
        setErrorFeatured("Không thể tải món ăn nổi bật.");
        setFeaturedDishes([]);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoadingTestimonials(true);
      setErrorTestimonials(null);
      try {
        const res = await fetch("http://localhost:5080/api/DanhGiaManager");
        if (!res.ok) throw new Error("Lỗi khi lấy đánh giá");
        const data = await res.json();
        const mappedTestimonials = data.map((dg) => ({
          id: dg.maDanhGia,
          name: dg.tenKhachHang || "Khách hàng ẩn danh",
          rating: dg.xepHang || 0,
          comment: dg.noiDungPhanHoi || "Không có nội dung",
          date: dg.ngayDanhGia
            ? new Date(dg.ngayDanhGia).toLocaleDateString("vi-VN")
            : "Không rõ ngày",
        }));
        setTestimonials(mappedTestimonials);
      } catch (err) {
        setErrorTestimonials("Không thể tải đánh giá từ khách hàng.");
        setTestimonials([]);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  // Add to cart function
  const addToCart = (dish) => {
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingIndex = cart.findIndex((item) => item.id === dish.id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...dish, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    toast.success(`Đã thêm món ${dish.name} vào giỏ hàng!`, {
      duration: 2000,
      position: "top-right",
      style: {
        backgroundColor: "#4CAF50",
        color: "#fff",
        fontSize: "16px",
      },
    });
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Custom Carousel */}
      <section
        className="relative h-screen flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0 overflow-hidden">
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={img}
                alt={`Nhà hàng Quang Quý ${index + 1}`}
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.target.src = "/placeholder-hero.jpg";
                }}
              />
              <div className="absolute inset-0  bg-opacity-40" />
            </div>
          ))}
          {/* Dots Navigation */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 w-3 rounded-full ${
                  currentSlide === index ? "bg-white" : "bg-gray-400"
                } hover:bg-white transition-colors`}
                aria-label={`Chuyển đến hình ảnh ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-shadow-md">
              Trải nghiệm ẩm thực tuyệt vời tại Nhà hàng Quang Quý
            </h1>
            <p className="text-xl text-white mb-8 text-shadow-sm">
              Khám phá hương vị đặc trưng với các món ăn được chế biến từ nguyên
              liệu tươi ngon nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/menu"
                className="px-6 py-3 rounded-md bg-amber-500 text-white font-medium text-base shadow-md hover:bg-amber-600 hover:scale-105 transition-all duration-300"
              >
                Xem thực đơn
              </Link>
              <Link
                to="/reservation"
                className="px-6 py-3 rounded-md border-2 border-amber-400 text-amber-300 font-medium text-base hover:bg-yellow-900 hover:text-white
 transition-all duration-300"
              >
                Đặt bàn ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <img
                src={Quy}
                alt="Nhà hàng Quang Quý"
                className="rounded-lg shadow-lg w-full h-auto transform transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Về Nhà hàng Quang Quý</h2>
              <p className="text-gray-600 mb-6">
                Nhà hàng Quang Quý được thành lập vào năm 2025, với sứ mệnh mang
                đến cho khách hàng những trải nghiệm ẩm thực tuyệt vời nhất.
              </p>
              <p className="text-gray-600 mb-6">
                Với đội ngũ đầu bếp giàu kinh nghiệm, chúng tôi luôn đảm bảo mỗi
                món ăn đều được chế biến từ những nguyên liệu tươi ngon nhất.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Mở cửa hàng ngày</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Vị trí trung tâm</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Đầu bếp 5 sao</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Dịch vụ chuyên nghiệp</span>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Món ăn nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá những món ăn đặc trưng và được yêu thích nhất tại nhà
              hàng của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {loadingFeatured ? (
              <div className="col-span-3 text-center py-10">Đang tải...</div>
            ) : errorFeatured ? (
              <div className="col-span-3 text-center text-red-500 py-6">
                {errorFeatured}
              </div>
            ) : featuredDishes.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                Không có món ăn nổi bật
              </div>
            ) : (
              featuredDishes.map((dish) => (
                <Link
                  key={dish.maMon}
                  to={`/menu/${dish.maMon}`}
                  className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-full hover:shadow-xl transition-shadow duration-300"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={dish.hinhAnh || "/placeholder-dish.jpg"}
                      alt={dish.tenMon}
                      className="w-full aspect-[4/3] object-cover transform transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/placeholder-dish.jpg";
                      }}
                    />
                  </div>
                  <div className="flex flex-col flex-grow p-4">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      {dish.tenDanhMuc || "Không có danh mục"}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{dish.tenMon}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {dish.moTa || "Không có mô tả"}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-lg">
                        {(dish.gia ?? 0).toLocaleString("vi-VN")} ₫
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: dish.maMon,
                            name: dish.tenMon,
                            price: dish.gia,
                            image: dish.hinhAnh,
                            quantity: 1,
                          });
                        }}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white font-medium rounded-md text-sm hover:bg-green-700 hover:scale-105 transition-all duration-200"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="px-6 py-3 rounded-md bg-amber-500 text-white font-medium text-base shadow-md hover:bg-amber-600 hover:scale-105 transition-all duration-300"
            >
              Xem toàn bộ thực đơn
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những đánh giá chân thực từ khách hàng đã trải nghiệm dịch vụ tại
              nhà hàng của chúng tôi
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {loadingTestimonials ? (
              <div className="text-center py-10">Đang tải đánh giá...</div>
            ) : errorTestimonials ? (
              <div className="text-center text-red-500 py-6">
                {errorTestimonials}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-10">
                Chưa nhận được đánh giá nào từ khách hàng.
              </div>
            ) : (
              <div className="bg-green-100 rounded-lg shadow-lg p-8">
                <div className="flex justify-center mb-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-3 w-3 sm:h-4 sm:w-4 mx-1 rounded-full ${
                        currentTestimonial === index
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    ></button>
                  ))}
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="h-6 w-6 text-yellow-400 fill-current"
                        />
                      )
                    )}
                  </div>
                  <p className="text-gray-600 text-lg italic mb-6">
                    "{testimonials[currentTestimonial].comment}"
                  </p>
                  <div className="font-bold text-gray-800">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {testimonials[currentTestimonial].date}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Đặt bàn ngay hôm nay</h2>
          <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
            Đừng bỏ lỡ cơ hội trải nghiệm ẩm thực tuyệt vời tại Nhà hàng Quang
            Quý. Đặt bàn ngay để được phục vụ tốt nhất!
          </p>
          <Link
            to="/reservation"
            className="inline-block px-6 py-3 rounded-md bg-amber-100 border-2 border-amber-500 text-amber-700 font-medium text-base hover:bg-amber-200 hover:shadow-lg transition-all duration-300"
          >
            Đặt bàn ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
