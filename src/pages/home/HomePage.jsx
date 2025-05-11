import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Star, Clock, MapPin,ShoppingCart} from "lucide-react"

import Quy from "../../assets/quy.jpg"
import Phobotai from "../../assets/phobotai.png"
import Tomthit from "../../assets/tomthit.jpg"
import Buncha from "../../assets/buncha.jpg"
import Comrang from "../../assets/comrang.jpg"
import Nhahang1 from "../../assets/nhahang2025.jpg"

// Dữ liệu món ăn nổi bật
const featuredDishes = [
  {
    id: 1,
    name: "Phở bò tái",
    description: "Phở bò truyền thống với thịt bò tái",
    price: 85000,
    image: Phobotai,
    category: "Món chính",
  },
  {
    id: 2,
    name: "Gỏi cuốn tôm thịt",
    description: "Gỏi cuốn tươi với tôm và thịt heo",
    price: 65000,
    image: Tomthit,
    category: "Món khai vị",
  },
  {
    id: 3,
    name: "Cơm rang hải sản",
    description: "Cơm rang với các loại hải sản tươi ngon",
    price: 95000,
    image: Comrang,
    category: "Món chính",
  },
  {
    id: 4,
    name: "Bún chả Hà Nội",
    description: "Bún chả truyền thống kiểu Hà Nội",
    price: 75000,
    image: Buncha,
    category: "Món chính",
  },
]

// Dữ liệu đánh giá
const testimonials = [
  {
    id: 1,
    name: "Nguyễn Đăng Phong",
    rating: 5,
    comment:
      "Món ăn rất ngon, không gian thoáng mát và sang trọng. Nhân viên phục vụ nhiệt tình, chu đáo. Tôi sẽ quay lại lần sau!",
    date: "15/06/2023",
  },
  {
    id: 2,
    name: "Nguyễn Trí Ngọc",
    rating: 4,
    comment:
      "Thực đơn phong phú, giá cả hợp lý. Tuy nhiên, thời gian chờ món hơi lâu. Nhưng bù lại, chất lượng món ăn rất tốt.",
    date: "20/05/2023",
  },
  {
    id: 3,
    name: "Nguyễn Văn Vĩnh Định",
    rating: 5,
    comment:
      "Đây là nhà hàng yêu thích của gia đình tôi. Món ăn luôn ngon và đảm bảo vệ sinh. Không gian rộng rãi, thích hợp cho các buổi họp mặt.",
    date: "10/06/2023",
  },
]

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const addToCart = (dish) => {
    const savedCart = localStorage.getItem("cart")
    const cart = savedCart ? JSON.parse(savedCart) : []
    const existingIndex = cart.findIndex((item) => item.id === dish.id)

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({ ...dish, quantity: 1 })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("storage"))
  }

  return (
    <div className="bg-white-50">

      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: `url(${Nhahang1})` }}
  >
    <div className="absolute inset-0 bg-opacity-50"></div>
  </div>
  <div className="container mx-auto px-4 relative z-10" >
    <div className="max-w-2xl text-center md:text-left">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
        Trải nghiệm ẩm thực tuyệt vời tại Nhà hàng Quang Quý
      </h1>
      <p className="text-xl text-white mb-8">
        Khám phá hương vị đặc trưng với các món ăn được chế biến từ nguyên liệu tươi ngon nhất
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <Link
          to="/menu"
          className="px-6 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-base font-medium text-center"
        >
          Xem thực đơn
        </Link>
        <Link
          to="/reservation"
          className="px-6 py-3 rounded-md border border-white text-white hover:bg-green-400 hover:bg-opacity-10 text-base font-medium text-center"
        >
          Đặt bàn ngay
        </Link>
      </div>
    </div>
  </div>
</section>


      {/* About Section */}
      <section className="py-16 bg-gray-50  bg-red-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <img src={Quy} alt="Nhà hàng Quang Quý" className="rounded-lg shadow-lg w-full h-auto" />
            </div>
            <div className="w-full md:w-1/2 bg-red-50" >
              <h2 className="text-3xl font-bold mb-6">Về Nhà hàng Quang Quý</h2>
              <p className="text-gray-600 mb-6">
                Nhà hàng Quang Quý được thành lập vào năm 2025, với sứ mệnh mang đến cho khách hàng những trải nghiệm ẩm thực tuyệt vời nhất.
              </p>
              <p className="text-gray-600 mb-6">
                Với đội ngũ đầu bếp giàu kinh nghiệm, chúng tôi luôn đảm bảo mỗi món ăn đều được chế biến từ những nguyên liệu tươi ngon nhất.
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
              <Link to="/about" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
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
              Khám phá những món ăn đặc trưng và được yêu thích nhất tại nhà hàng của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
  {featuredDishes.map((dish) => (
    <div key={dish.id} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-full">
      <img src={dish.image} className="w-full aspect-[4/3] object-cover" />
      <div className="flex flex-col flex-grow p-4">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
          {dish.category}
        </div>
        <h3 className="text-lg font-bold mb-2">{dish.name}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{dish.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="font-bold text-lg">{dish.price.toLocaleString("vi-VN")} ₫</span>
          <button
            onClick={() => addToCart(dish)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <ShoppingCart className="h-4 w-4 inline-block mr-1" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>


          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="px-6 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-base font-medium"
            >
              Xem toàn bộ thực đơn
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16  bg-red-50">
        <div className="container mx-auto px-4 ">
          <div className="text-center mb-12 ">
            <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những đánh giá chân thực từ khách hàng đã trải nghiệm dịch vụ tại nhà hàng của chúng tôi
            </p>
          </div>

          <div className="max-w-4xl mx-auto 0" >
            <div className="bg-green-200 rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 w-3 sm:h-4 sm:w-4 mx-1 rounded-full ${
                      currentTestimonial === index ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  ></button>
                ))}
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-lg italic mb-6">
                  "{testimonials[currentTestimonial].comment}"
                </p>
                <div className="font-bold">{testimonials[currentTestimonial].name}</div>
                <div className="text-gray-500 text-sm">{testimonials[currentTestimonial].date}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-black  bg-red-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Đặt bàn ngay hôm nay</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Đừng bỏ lỡ cơ hội trải nghiệm ẩm thực tuyệt vời tại Nhà hàng Quang Quý. Đặt bàn ngay để được phục vụ tốt nhất!
          </p>
          <Link
            to="/reservation"
            className="inline-flex items-center justify-center px-6 py-3 border border-blue text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100"
          >
            Đặt bàn ngay
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
