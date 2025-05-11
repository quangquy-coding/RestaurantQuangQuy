import React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"

const AdminPromotionsPage = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPromotion, setCurrentPromotion] = useState({
    id: null,
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    isActive: true,
    usageLimit: "",
    usageCount: 0,
    applicableProducts: "all",
    description: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    // Simulate fetching promotions from API
    setTimeout(() => {
      const mockPromotions = [
        {
          id: 1,
          name: "Khuyến mãi mùa hè",
          code: "SUMMER2023",
          discountType: "percentage",
          discountValue: 15,
          minOrderValue: 200000,
          maxDiscount: 100000,
          startDate: "2023-06-01",
          endDate: "2023-08-31",
          isActive: true,
          usageLimit: 1000,
          usageCount: 450,
          applicableProducts: "all",
          description: "Giảm 15% cho tất cả đơn hàng trong mùa hè",
        },
        {
          id: 2,
          name: "Khuyến mãi món mới",
          code: "NEWDISH",
          discountType: "fixed",
          discountValue: 50000,
          minOrderValue: 150000,
          maxDiscount: 50000,
          startDate: "2023-07-15",
          endDate: "2023-09-15",
          isActive: true,
          usageLimit: 500,
          usageCount: 120,
          applicableProducts: "specific",
          description: "Giảm 50.000đ khi đặt các món mới",
        },
        {
          id: 3,
          name: "Khuyến mãi sinh nhật",
          code: "BIRTHDAY",
          discountType: "percentage",
          discountValue: 20,
          minOrderValue: 300000,
          maxDiscount: 150000,
          startDate: "2023-01-01",
          endDate: "2023-12-31",
          isActive: true,
          usageLimit: 0,
          usageCount: 78,
          applicableProducts: "all",
          description: "Giảm 20% cho đơn hàng trong tháng sinh nhật của khách hàng",
        },
        {
          id: 4,
          name: "Khuyến mãi cuối tuần",
          code: "WEEKEND",
          discountType: "percentage",
          discountValue: 10,
          minOrderValue: 100000,
          maxDiscount: 50000,
          startDate: "2023-08-01",
          endDate: "2023-10-31",
          isActive: true,
          usageLimit: 2000,
          usageCount: 320,
          applicableProducts: "all",
          description: "Giảm 10% cho đơn hàng vào cuối tuần",
        },
        {
          id: 5,
          name: "Khuyến mãi đã hết hạn",
          code: "EXPIRED",
          discountType: "fixed",
          discountValue: 30000,
          minOrderValue: 100000,
          maxDiscount: 30000,
          startDate: "2023-01-01",
          endDate: "2023-05-31",
          isActive: false,
          usageLimit: 1000,
          usageCount: 876,
          applicableProducts: "all",
          description: "Khuyến mãi đã hết hạn",
        },
      ]
      setPromotions(mockPromotions)
      setLoading(false)
    }, 1000)
  }, [])

  const handleOpenModal = (promotion = null) => {
    if (promotion) {
      setCurrentPromotion(promotion)
      setIsEditing(true)
    } else {
      setCurrentPromotion({
        id: null,
        name: "",
        code: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        isActive: true,
        usageLimit: "",
        usageCount: 0,
        applicableProducts: "all",
        description: "",
      })
      setIsEditing(false)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentPromotion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      // Update existing promotion
      setPromotions((prev) => prev.map((p) => (p.id === currentPromotion.id ? currentPromotion : p)))
      toast.success("Cập nhật khuyến mãi thành công!")
    } else {
      // Add new promotion
      const newPromotion = {
        ...currentPromotion,
        id: Date.now(),
        usageCount: 0,
      }
      setPromotions((prev) => [...prev, newPromotion])
      toast.success("Thêm khuyến mãi mới thành công!")
    }

    handleCloseModal()
  }

  const handleToggleStatus = (id) => {
    setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
    toast.success("Cập nhật trạng thái thành công!")
  }

  const handleDeletePromotion = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      setPromotions((prev) => prev.filter((p) => p.id !== id))
      toast.success("Xóa khuyến mãi thành công!")
    }
  }

  const filteredPromotions =
    filterStatus === "all"
      ? promotions
      : promotions.filter((p) => (filterStatus === "active" ? p.isActive : !p.isActive))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">Quản lý khuyến mãi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm khuyến mãi
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="ml-auto">
            <input
              type="text"
              placeholder="Tìm kiếm khuyến mãi..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khuyến mãi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPromotions.map((promotion) => (
                <motion.tr
                  key={promotion.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                    <div className="text-sm text-gray-500">{promotion.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-md">{promotion.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {promotion.discountType === "percentage" ? (
                      <div className="text-sm text-gray-900">{promotion.discountValue}%</div>
                    ) : (
                      <div className="text-sm text-gray-900">{promotion.discountValue.toLocaleString()}đ</div>
                    )}
                    <div className="text-xs text-gray-500">
                      Min: {promotion.minOrderValue.toLocaleString()}đ
                      {promotion.maxDiscount > 0 && ` | Max: ${promotion.maxDiscount.toLocaleString()}đ`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(promotion.startDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-sm text-gray-500">
                      đến {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promotion.usageCount} / {promotion.usageLimit > 0 ? promotion.usageLimit : "∞"}
                    </div>
                    {promotion.usageLimit > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((promotion.usageCount / promotion.usageLimit) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promotion.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {promotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(promotion)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleStatus(promotion.id)}
                      className={`${
                        promotion.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                      } mr-3`}
                    >
                      {promotion.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khuyến mãi
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentPromotion.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khuyến mãi
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={currentPromotion.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giảm giá
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={currentPromotion.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị giảm giá
                  </label>
                  <input
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={currentPromotion.discountValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    id="minOrderValue"
                    name="minOrderValue"
                    value={currentPromotion.minOrderValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    id="maxDiscount"
                    name="maxDiscount"
                    value={currentPromotion.maxDiscount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={currentPromotion.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={currentPromotion.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                    Giới hạn sử dụng (0 = không giới hạn)
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={currentPromotion.usageLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="applicableProducts" className="block text-sm font-medium text-gray-700 mb-1">
                    Áp dụng cho
                  </label>
                  <select
                    id="applicableProducts"
                    name="applicableProducts"
                    value={currentPromotion.applicableProducts}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả sản phẩm</option>
                    <option value="specific">Sản phẩm cụ thể</option>
                    <option value="category">Danh mục cụ thể</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={currentPromotion.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={currentPromotion.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Kích hoạt khuyến mãi
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPromotionsPage
