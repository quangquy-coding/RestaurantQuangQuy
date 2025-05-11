import React from "react"
import Ngoc from '../../assets/ngoc.jpg'
import Phong from '../../assets/phong.jpg'
import Owner from '../../assets/owner.jpg'
import Logo from '../../assets/logo.png'
import Quy from '../../assets/quy.jpg'
import Tan from '../../assets/tan.jpeg'

const AboutPage = () => {
  return (
    <div className="py-16  bg-red-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Về chúng tôi</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nhà hàng Quang Quý - Nơi mang đến trải nghiệm ẩm thực tuyệt vời với không gian sang trọng và món ăn đặc sắc
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
            <img
              src={Quy}
              alt="Nhà hàng Quang Quý"
              className="w-full h-auto object-cover"
            />

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4">Câu chuyện của chúng tôi</h2>
              <p className="text-gray-600 mb-6">
                Nhà hàng Quang Quý được thành lập vào năm 2025 bởi đầu bếp Nguyễn Quang Quý với mong muốn mang đến cho thực khách
                những trải nghiệm ẩm thực đẳng cấp và độc đáo. Sau hơn 6 tháng hoạt động, chúng tôi đã trở thành một
                trong những nhà hàng được yêu thích nhất tại thành phố.
              </p>
              <p className="text-gray-600 mb-6">
                Với triết lý "Chất lượng là trên hết", chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu. Mỗi
                món ăn tại nhà hàng đều được chế biến từ những nguyên liệu tươi ngon nhất, được lựa chọn kỹ lưỡng từ các
                nhà cung cấp uy tín.
              </p>
              <p className="text-gray-600">
                Không gian nhà hàng được thiết kế sang trọng, ấm cúng với sức chứa lên đến 200 khách, phù hợp cho cả
                những bữa ăn gia đình, gặp gỡ bạn bè hay các sự kiện doanh nghiệp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4">Tầm nhìn</h2>
              <p className="text-gray-600">
                Trở thành nhà hàng hàng đầu trong việc mang đến trải nghiệm ẩm thực đẳng cấp, kết hợp giữa ẩm thực
                truyền thống và hiện đại, tạo nên những hương vị độc đáo không thể trộn lẫn.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4">Sứ mệnh</h2>
              <p className="text-gray-600">
                Mang đến cho khách hàng những trải nghiệm ẩm thực tuyệt vời nhất thông qua chất lượng món ăn, dịch vụ
                chuyên nghiệp và không gian sang trọng, ấm cúng.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">Đội ngũ của chúng tôi</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
                <img
                  src={Owner}
                  alt="Quản lý Nguyễn Quang Quý"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold">Quang Quý</h3>
                <p className="text-gray-600">Quản lý nhà hàng</p>
              </div>
              <div className="text-center">
                <img
                  src={Phong}
                  alt="Đầu bếp Nguyễn Đăng Phong"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold">Đăng Phong</h3>
                <p className="text-gray-600">Bếp trưởng</p>
              </div>

             

              <div className="text-center">
                <img
                  src={Ngoc}
                  alt="Đầu bếp Nguyễn Trí Ngọc"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold">Trí Ngọc</h3>
                <p className="text-gray-600">Bếp phó</p>
              </div>
              <div className="text-center">
                <img
                  src={Tan}
                  alt="Đầu bếp Quang Tân"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold">Quang Tân</h3>
                <p className="text-gray-600">Chủ tịch</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Giá trị cốt lõi</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Chất lượng</h3>
                <p className="text-gray-600">
                  Chúng tôi cam kết mang đến những món ăn chất lượng cao nhất, được chế biến từ nguyên liệu tươi ngon.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Sáng tạo</h3>
                <p className="text-gray-600">
                  Không ngừng đổi mới và sáng tạo trong thực đơn, mang đến những trải nghiệm ẩm thực mới mẻ cho khách hàng.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Dịch vụ</h3>
                <p className="text-gray-600">
                  Dịch vụ chuyên nghiệp, tận tâm, luôn đặt sự hài lòng của khách hàng lên hàng đầu.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Môi trường</h3>
                <p className="text-gray-600">
                  Cam kết sử dụng nguyên liệu bền vững, thân thiện với môi trường và hỗ trợ các nhà cung cấp địa phương.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AboutPage
