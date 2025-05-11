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
    <footer className="bg-black text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4">Nhà hàng Quang Quý</h3>
            <p className="text-gray-400 mb-4">
              Nhà hàng Quang Quý tự hào mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời với không gian sang trọng và món ăn đặc sắc.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a
                href="https://www.facebook.com/nqq23/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/ng_quang_quy/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                 Thực đơn
                </Link>
              </li>
              <li>
                <Link
                  to="/reservation"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Đặt bàn
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog 
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start justify-center sm:justify-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm max-w-[200px]">
                  106 Phạm Nhữ Tăng, Hòa Khê, Thanh Khê, Đà Nẵng
                </span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm">+84 382 208 154</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm">
                  quangquy@gmail.com
                </span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-4">Giờ mở cửa</h3>
            <ul className="space-y-2">
              <li className="flex items-start justify-center sm:justify-start">
                <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">Thứ 2 - Thứ 6</p>
                  <p className="text-white text-sm">10:00 - 22:00</p>
                </div>
              </li>
              <li className="flex items-start justify-center sm:justify-start">
                <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">Thứ 7 - Chủ nhật</p>
                  <p className="text-white text-sm">09:00 - 23:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2025 Nhà hàng Quang Quý. Tất cả quyền được bảo lưu.
            </p>
            <ul className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Chính sách bảo mật
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
