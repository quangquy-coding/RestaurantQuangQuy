import React from "react"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useState, useEffect } from "react"
import { Calendar, Download, ChevronDown, ArrowUp, ArrowDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// Mock data for reports
const data = [
  { month: 'Th1', revenue: 12000000 },
  { month: 'Th2', revenue: 15000000 },
  { month: 'Th3', revenue: 9000000 },
  // ...
];
const mockRevenueData = {
  daily: [
    { date: "2023-05-01", revenue: 5250000, orders: 42, averageOrder: 125000 },
    { date: "2023-05-02", revenue: 4800000, orders: 38, averageOrder: 126315 },
    { date: "2023-05-03", revenue: 5100000, orders: 40, averageOrder: 127500 },
    { date: "2023-05-04", revenue: 5500000, orders: 44, averageOrder: 125000 },
    { date: "2023-05-05", revenue: 6200000, orders: 50, averageOrder: 124000 },
    { date: "2023-05-06", revenue: 7500000, orders: 60, averageOrder: 125000 },
    { date: "2023-05-07", revenue: 8000000, orders: 64, averageOrder: 125000 },
    { date: "2023-05-08", revenue: 5300000, orders: 42, averageOrder: 126190 },
    { date: "2023-05-09", revenue: 5100000, orders: 41, averageOrder: 124390 },
    { date: "2023-05-10", revenue: 5400000, orders: 43, averageOrder: 125581 },
    { date: "2023-05-11", revenue: 5600000, orders: 45, averageOrder: 124444 },
    { date: "2023-05-12", revenue: 6300000, orders: 51, averageOrder: 123529 },
    { date: "2023-05-13", revenue: 7600000, orders: 61, averageOrder: 124590 },
    { date: "2023-05-14", revenue: 8100000, orders: 65, averageOrder: 124615 },
  ],
  monthly: [
    { date: "2023-01", revenue: 150000000, orders: 1200, averageOrder: 125000 },
    { date: "2023-02", revenue: 140000000, orders: 1120, averageOrder: 125000 },
    { date: "2023-03", revenue: 160000000, orders: 1280, averageOrder: 125000 },
    { date: "2023-04", revenue: 155000000, orders: 1240, averageOrder: 125000 },
    { date: "2023-05", revenue: 165000000, orders: 1320, averageOrder: 125000 },
  ],
}

const mockTopDishes = [
  { id: 1, name: "Phở bò tái", category: "Món chính", quantity: 320, revenue: 27200000 },
  { id: 3, name: "Cơm rang hải sản", category: "Món chính", quantity: 280, revenue: 26600000 },
  { id: 6, name: "Bún chả Hà Nội", category: "Món chính", quantity: 250, revenue: 18750000 },
  { id: 7, name: "Bánh xèo", category: "Món chính", quantity: 220, revenue: 17600000 },
  { id: 2, name: "Gỏi cuốn tôm thịt", category: "Món khai vị", quantity: 210, revenue: 13650000 },
  { id: 8, name: "Cà phê sữa đá", category: "Đồ uống", quantity: 200, revenue: 7000000 },
  { id: 5, name: "Nước ép cam", category: "Đồ uống", quantity: 180, revenue: 8100000 },
  { id: 4, name: "Chè đậu đen", category: "Món tráng miệng", quantity: 150, revenue: 5250000 },
]

const mockCategoryData = [
  { name: "Món chính", revenue: 90150000, percentage: 45 },
  { name: "Món khai vị", revenue: 30000000, percentage: 15 },
  { name: "Món tráng miệng", revenue: 20000000, percentage: 10 },
  { name: "Đồ uống", revenue: 60000000, percentage: 30 },
]

const mockPaymentMethodData = [
  { method: "Tiền mặt", revenue: 100000000, percentage: 50 },
  { method: "Thẻ tín dụng", revenue: 60000000, percentage: 30 },
  { method: "Ví điện tử", revenue: 40000000, percentage: 20 },
]



const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("7days")
  const [revenueData, setRevenueData] = useState([])
  const [topDishes, setTopDishes] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [paymentMethodData, setPaymentMethodData] = useState([])

  const [dishes, setDishes] = useState([]);
  const [sortBy, setSortBy] = useState('sold');
  const [sortedDishes, setSortedDishes] = useState([]);
  useEffect(() => {
    // Giả sử bạn lấy dữ liệu từ API hoặc từ một nguồn nào đó
    const fetchedDishes = [
      { id: 1, name: 'Phở', sold: 150, revenue: 300000 },
      { id: 2, name: 'Bún Chả', sold: 120, revenue: 240000 },
      { id: 3, name: 'Gà Rán', sold: 200, revenue: 400000 },
    ];
    setDishes(fetchedDishes);
  }, []);
  useEffect(() => {
    let sorted = [...dishes];
    if (sortBy === 'sold') {
      sorted.sort((a, b) => b.sold - a.sold);
    } else if (sortBy === 'revenue') {
      sorted.sort((a, b) => b.revenue - a.revenue);
    }
    setSortedDishes(sorted);
  }, [sortBy, dishes]);

  
  
  const [sortConfig, setSortConfig] = useState({
    key: "quantity",
    direction: "desc",
  })
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    // In a real app, you would fetch data from an API based on the selected time range
    // For now, we'll use mock data
    let data = []
    switch (timeRange) {
      case "7days":
        data = mockRevenueData.daily.slice(-7)
        break
      case "14days":
        data = mockRevenueData.daily.slice(-14)
        break
      case "30days":
        data = mockRevenueData.daily.slice(-14) // Using 14 days as mock data for 30 days
        break
      case "thisMonth":
        data = mockRevenueData.daily.slice(-14) // Using 14 days as mock data for this month
        break
      case "lastMonth":
        data = mockRevenueData.daily.slice(-14) // Using 14 days as mock data for last month
        break
      case "custom":
        // In a real app, you would fetch data for the custom date range
        data = mockRevenueData.daily.slice(-7) // Using 7 days as mock data for custom range
        break
      default:
        data = mockRevenueData.daily.slice(-7)
    }

    setRevenueData(data)
    setTopDishes(mockTopDishes)
    setCategoryData(mockCategoryData)
    setPaymentMethodData(mockPaymentMethodData)
  }, [timeRange, customDateRange])

  const handleSort = (key) => {
    let direction = "desc"
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc"
    }
    setSortConfig({ key, direction })

    // Sort top dishes
    const sortedDishes = [...topDishes].sort((a, b) => {
      if (direction === "asc") {
        return a[key] - b[key]
      } else {
        return b[key] - a[key]
      }
    })

    setTopDishes(sortedDishes)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN") + " ₫"
  }

  const calculateTotalRevenue = () => {
    return revenueData.reduce((total, item) => total + item.revenue, 0)
  }

  const calculateTotalOrders = () => {
    return revenueData.reduce((total, item) => total + item.orders, 0)
  }

  const calculateAverageOrderValue = () => {
    const totalRevenue = calculateTotalRevenue()
    const totalOrders = calculateTotalOrders()
    return totalOrders > 0 ? totalRevenue / totalOrders : 0
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>

        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Time range filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">7 ngày qua</option>
              <option value="14days">14 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="thisMonth">Tháng này</option>
              <option value="lastMonth">Tháng trước</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          {timeRange === "custom" && (
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Áp dụng</button>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Tổng doanh thu</h2>
          <p className="text-3xl font-bold">{formatCurrency(calculateTotalRevenue())}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Tổng đơn hàng</h2>
          <p className="text-3xl font-bold">{calculateTotalOrders()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Giá trị đơn hàng trung bình</h2>
          <p className="text-3xl font-bold">{formatCurrency(calculateAverageOrderValue())}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h2>
        <div className="h-80 w-full">
          {/* In a real app, you would use a chart library like Chart.js or Recharts */}
          {/* <div className="h-full w-full flex items-end justify-between">
            {revenueData.map((item, index) => {
              const height = (item.revenue / 8100000) * 100 // Scale to percentage of max value
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
                  <div className="mt-2 text-xs text-gray-600">{formatDate(item.date)}</div>
                </div>
              )
            })}
          </div> */}

          <ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip formatter={(value) => `${value.toLocaleString()} VNĐ`} />
    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
  </LineChart>
</ResponsiveContainer>
        </div>
        
      </div>

      {/* Top dishes */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Món ăn bán chạy</h2>
        <select
          className="border px-2 py-1 rounded"
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
        >
          <option value="sold">Bán chạy</option>
          <option value="revenue">Doanh thu</option>
        </select>
        <ul>
        {sortedDishes.map((dish) => (
          <li key={dish.id} className="flex justify-between py-2 border-b">
            <span>{dish.name}</span>
            <span>
              {sortBy === 'sold' ? `${dish.sold} phần` : `${dish.revenue.toLocaleString()} VNĐ`}
            </span>
          </li>
        ))}
      </ul>
        <div className="overflow-x-auto">
        
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tên món
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Danh mục
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center">
                    Số lượng bán
                    {sortConfig.key === "quantity" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("revenue")}
                >
                  <div className="flex items-center">
                    Doanh thu
                    {sortConfig.key === "revenue" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topDishes.map((dish) => (
                <tr key={dish.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{dish.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dish.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(dish.revenue)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      

      {/* Category and payment method charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h2>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(category.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo phương thức thanh toán</h2>
          <div className="space-y-4">
            {paymentMethodData.map((payment, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{payment.method}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(payment.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${payment.percentage}%` }}></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">{payment.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
