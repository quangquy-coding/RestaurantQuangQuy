import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import React from "react";
import logo from "../../assets/logo.png"; // Adjust the path as necessary

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Info */}
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-4">
              <img
                src={logo}
                alt="Restaurant Logo"
                className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Nhà hàng Quang Quý</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Tự hào mang đến trải nghiệm ẩm thực tuyệt vời với không gian sang
              trọng và món ăn đặc sắc.
            </p>
            <div className="flex justify-center sm:justify-start mt-4 space-x-5">
              <a
                href="https://www.facebook.com/nqq23/"
                className="text-gray-400 hover:text-blue-400 transition hover:scale-110"
              >
                <Facebook size={22} />
              </a>
              <a
                href="https://www.instagram.com/ng_quang_quy/"
                className="text-gray-400 hover:text-pink-400 transition hover:scale-110"
              >
                <Instagram size={22} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-sky-400 transition hover:scale-110"
              >
                <Twitter size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Trang chủ" },
                { to: "/reservation", label: "Đặt bàn" },
                { to: "/menu", label: "Thực đơn" },
                { to: "/promotions", label: "Khuyến mãi" },
                { to: "/about", label: "Giới thiệu" },
                { to: "/contact", label: "Liên hệ" },
                { to: "/blog", label: "Blog" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-blue-400 transition-all duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="text-blue-400 animate-pulse" size={20} />
                <span>106 Phạm Nhữ Tăng, Hòa Khê, Thanh Khê, Đà Nẵng</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-blue-400 animate-pulse" size={20} />
                <a
                  href="tel:+84382208154"
                  className="hover:text-blue-400 transition"
                >
                  +84 382 208 154
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-blue-400 animate-pulse" size={20} />
                <a
                  href="mailto:quangquy822003@gmail.com"
                  className="hover:text-blue-400 transition"
                >
                  quangquy822003@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Giờ mở cửa</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <Clock className="text-blue-400 animate-pulse mt-1" size={20} />
                <div>
                  <p>Thứ 2 - Thứ 6</p>
                  <p className="text-white font-medium">10:00 - 22:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="text-blue-400 animate-pulse mt-1" size={20} />
                <div>
                  <p>Thứ 7</p>
                  <p className="text-white font-medium">09:00 - 23:00</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="text-blue-400 animate-pulse mt-1" size={20} />
                <div>
                  <p>Chủ nhật</p>
                  <p className="text-white font-medium">09:00 - 22:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-sm text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2025 Nhà hàng Quang Quý. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-blue-400 transition relative group"
            >
              Điều khoản sử dụng
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="hover:text-blue-400 transition relative group"
            >
              Chính sách bảo mật
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
