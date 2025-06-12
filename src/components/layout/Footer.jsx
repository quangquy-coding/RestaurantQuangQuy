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

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-700 to-gray-900 text-white pt-12 pb-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="grid  gap-8 md:grid-cols-4 md:gap-12">
          {/* Restaurant Info */}
          <div className="text-left py-6 md:py-4">
            <h3 className="text-lg font-extrabold mb-4 text-gray-100 md:text-xl">
              Nhà hàng Quang Quý
            </h3>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed max-w-xs">
              Tự hào mang đến trải nghiệm ẩm thực tuyệt vời với không gian sang
              trọng và món ăn đặc sắc.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/nqq23/"
                className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a
                href="https://www.instagram.com/ng_quang_quy/"
                className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left py-6 md:py-4">
            <h3 className="text-lg font-bold mb-4 text-white md:text-xl">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
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
                    className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm relative group"
                  >
                    {link.label}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-left py-6 md:py-4">
            <h3 className="text-lg font-bold mb-4 text-white md:text-xl">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-3 mt-1 animate-pulse" />
                <span className="text-gray-300 text-sm max-w-[200px]">
                  106 Phạm Nhữ Tăng, Hòa Khê, Thanh Khê, Đà Nẵng
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-3 animate-pulse" />
                <a
                  href="tel:+84382208154"
                  className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm"
                >
                  +84 382 208 154
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-3 animate-pulse" />
                <a
                  href="mailto:quangquy822003@gmail.com"
                  className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm"
                >
                  quangquy822003@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="text-left py-6 md:py-4">
            <h3 className="text-lg font-bold mb-4 text-white md:text-xl">
              Giờ mở cửa
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-blue-400 mr-3 mt-1 animate-pulse" />
                <div>
                  <p className="text-gray-300 text-sm">Thứ 2 - Thứ 6</p>
                  <p className="text-white text-sm font-medium">
                    10:00 - 22:00
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-blue-400 mr-3 mt-1 animate-pulse" />
                <div>
                  <p className="text-gray-300 text-sm">Thứ 7</p>
                  <p className="text-white text-sm font-medium">
                    09:00 - 23:00
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-blue-400 mr-3 mt-1 animate-pulse" />
                <div>
                  <p className="text-gray-300 text-sm">Chủ nhật</p>
                  <p className="text-white text-sm font-medium">
                    09:00 - 22:00
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex justify-between md:items-center w-full gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Nhà hàng Quang Quý. Tất cả quyền được bảo lưu.
            </p>
            <ul className="flex gap-6 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-all duration-300 relative group"
                >
                  Điều khoản sử dụng
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-all duration-300 relative group"
                >
                  Chính sách bảo mật
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
