import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Calendar,
  Download,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";

// Base API URL
const API_BASE_URL = "http://localhost:5080/api/ReportManager";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [timeRange, setTimeRange] = useState("14days");
  const [revenueData, setRevenueData] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [promotionData, setPromotionData] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [hourlyDate, setHourlyDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sortConfig, setSortConfig] = useState({
    key: "quantity",
    direction: "desc",
  });
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Aggregate data (daily, weekly, monthly)
  const aggregateData = (data, aggregation = "daily") => {
    if (aggregation === "daily") return data;

    const aggregated = {};
    data.forEach((item) => {
      const date = new Date(item.date);
      let key;

      if (aggregation === "weekly") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - (date.getDay() || 7) + 1);
        key = startOfWeek.toISOString().split("T")[0];
      } else if (aggregation === "monthly") {
        key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-01`;
      }

      if (!aggregated[key]) {
        aggregated[key] = { date: key, revenue: 0, orders: 0, averageOrder: 0 };
      }
      aggregated[key].revenue += item.revenue;
      aggregated[key].orders += item.orders;
      aggregated[key].averageOrder =
        aggregated[key].orders > 0
          ? aggregated[key].revenue / aggregated[key].orders
          : 0;
    });

    return Object.values(aggregated).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // Validate custom date range (min 10 days)
  const validateCustomRange = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) return false;
    const start = new Date(customDateRange.startDate);
    const end = new Date(customDateRange.endDate);
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    return daysDiff >= 9;
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        let startDate,
          endDate,
          aggregation = "daily";
        const today = new Date();
        switch (timeRange) {
          case "10days":
            startDate = new Date(today.getTime());
            startDate.setDate(today.getDate() - 10);
            startDate = startDate.toISOString().split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
            break;
          case "14days":
            startDate = new Date(today.getTime());
            startDate.setDate(today.getDate() - 14);
            startDate = startDate.toISOString().split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
            break;
          case "30days":
            startDate = new Date(today.getTime());
            startDate.setDate(today.getDate() - 30);
            startDate = startDate.toISOString().split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
            break;
          case "90days":
            startDate = new Date(today.getTime());
            startDate.setDate(today.getDate() - 90);
            startDate = startDate.toISOString().split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
            aggregation = "weekly";
            break;
          case "6months":
            startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1)
              .toISOString()
              .split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
            aggregation = "monthly";
            break;
          case "1year":
            startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1)
              .toISOString()
              .split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
            aggregation = "monthly";
            break;
          case "all":
            startDate = "2000-01-01";
            endDate = new Date().toISOString().split("T")[0];
            aggregation = "monthly";
            break;
          case "custom":
            startDate = customDateRange.startDate;
            endDate = customDateRange.endDate;
            const daysDiff =
              (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
            aggregation =
              daysDiff > 180 ? "monthly" : daysDiff > 60 ? "weekly" : "daily";
            break;
          default:
            startDate = new Date(today.getTime());
            startDate.setDate(today.getDate() - 14);
            startDate = startDate.toISOString().split("T")[0];
            endDate = new Date().toISOString().split("T")[0];
        }

        // Fetch Revenue Data
        let response;
        if (timeRange === "1year" || timeRange === "all") {
          const year =
            timeRange === "1year" ? new Date(endDate).getFullYear() : null;
          response = await axios.get(`${API_BASE_URL}/DoanhThuTheoThang`, {
            params: { nam: year },
          });
          setRevenueData(
            response.data.chiTietTheoThang.map((item) => ({
              date: `${response.data.nam}-${item.thang
                .toString()
                .padStart(2, "0")}-01`,
              revenue: item.tongDoanhThu,
              orders: item.soHoaDon,
              averageOrder: item.doanhThuTrungBinh,
            }))
          );
        } else {
          response = await axios.get(`${API_BASE_URL}/DoanhThuTheoNgay`, {
            params: { tuNgay: startDate, denNgay: endDate },
          });
          const dailyData = response.data.chiTietTheoNgay.map((item) => ({
            date: new Date(item.ngay).toISOString().split("T")[0],
            revenue: item.tongDoanhThu,
            orders: item.soHoaDon,
            averageOrder: item.doanhThuTrungBinh,
          }));
          setRevenueData(aggregateData(dailyData, aggregation));
        }

        // Fetch Top Dishes
        const topDishesResponse = await axios.get(
          `${API_BASE_URL}/MonAnBanChay`,
          {
            params: { tuNgay: startDate, denNgay: endDate, top: 10 },
          }
        );
        setTopDishes(
          topDishesResponse.data.monAnBanChay.map((dish) => ({
            id: dish.maMon,
            name: dish.tenMon,
            quantity: dish.soLuongBan,
            revenue: dish.doanhThu,
            category: dish.soLanDat || "Unknown",
          }))
        );

        // Fetch Category Data
        const categoryResponse = await axios.get(
          `${API_BASE_URL}/DoanhThuTheoDanhMuc`,
          {
            params: { tuNgay: startDate, denNgay: endDate },
          }
        );
        setCategoryData(
          categoryResponse.data.chiTietDanhMuc.map((item) => ({
            name: item.danhMuc,
            revenue: item.tongDoanhThu,
            percentage: item.percentage,
          }))
        );

        // Fetch Payment Method Data
        const paymentResponse = await axios.get(
          `${API_BASE_URL}/DoanhThuTheoPhuongThucThanhToan`,
          {
            params: { tuNgay: startDate, denNgay: endDate },
          }
        );
        setPaymentMethodData(
          paymentResponse.data.chiTietPhuongThuc.map((item) => ({
            name: item.phuongThuc,
            value: item.tongDoanhThu,
            percentage: item.percentage,
          }))
        );

        // Fetch Loyal Customers
        const loyalCustomersResponse = await axios.get(
          `${API_BASE_URL}/KhachHangThanThiet`,
          { params: { top: 10 } }
        );
        setLoyalCustomers(
          loyalCustomersResponse.data.khachHangThanThiet.map((customer) => ({
            id: customer.maKhachHang,
            name: customer.tenKhachHang,
            email: customer.email,
            purchaseCount: customer.soLanMua,
            totalSpent: customer.tongTienMua,
            averageSpent: customer.tienTrungBinh,
            lastPurchase: customer.lanMuaCuoi,
          }))
        );

        // Fetch Promotion Data
        const promotionResponse = await axios.get(
          `${API_BASE_URL}/ThongKeKhuyenMai`,
          {
            params: { tuNgay: startDate, denNgay: endDate },
          }
        );
        setPromotionData(
          promotionResponse.data.chiTietKhuyenMai.map((promo) => ({
            id: promo.maKhuyenMai,
            name: promo.tenKhuyenMai,
            usageCount: promo.soLanSuDung,
            discountAmount: promo.tongTienGiam,
            revenue: promo.tongDoanhThu,
          }))
        );

        // Fetch Overview Data
        const overviewResponse = await axios.get(`${API_BASE_URL}/TongQuan`);
        setOverviewData(overviewResponse.data);

        // Fetch Hourly Data
        const hourlyResponse = await axios.get(
          `${API_BASE_URL}/DoanhThuTheoGio`,
          { params: { ngay: hourlyDate } }
        );
        setHourlyData(
          Array.from({ length: 24 }, (_, i) => ({
            gio: i,
            doanhThu:
              hourlyResponse.data.doanhThuTheoGio.find((x) => x.gio === i)
                ?.doanhThu || 0,
            soHoaDon:
              hourlyResponse.data.doanhThuTheoGio.find((x) => x.gio === i)
                ?.soHoaDon || 0,
          }))
        );
      } catch (err) {
        setError("Lỗi khi tải dữ liệu: Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    if (
      timeRange !== "custom" ||
      (timeRange === "custom" && validateCustomRange())
    ) {
      fetchData();
    }
  }, [timeRange, customDateRange, hourlyDate]);

  // Sorting logic
  const handleSort = (key, data, setData) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      if (direction === "asc") {
        return a[key] < b[key] ? -1 : 1;
      } else {
        return b[key] < a[key] ? -1 : 1;
      }
    });
    setData(sortedData);
  };

  // Export to Excel
  const exportToExcel = (data, filename, columns) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) =>
        columns.reduce(
          (acc, col) => ({ ...acc, [col.label]: item[col.key] }),
          {}
        )
      )
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Export to PDF (placeholder)
  const exportToPDF = () => {
    alert("PDF export not implemented in this example.");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options =
      timeRange === "1year" ||
      timeRange === "all" ||
      (timeRange === "custom" && revenueData.length > 60)
        ? { month: "2-digit", year: "numeric" }
        : { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Intl.DateTimeFormat("vi-VN", options).format(date);
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const calculateTotalRevenue = () => {
    return revenueData.reduce((total, item) => total + item.revenue, 0);
  };

  const calculateTotalOrders = () => {
    return revenueData.reduce((total, item) => total + item.orders, 0);
  };

  const calculateAverageOrderValue = () => {
    const totalRevenue = calculateTotalRevenue();
    const totalOrders = calculateTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  const getTimeRangeDisplay = () => {
    switch (timeRange) {
      case "10days":
        return "10 ngày qua";
      case "14days":
        return "14 ngày qua";
      case "30days":
        return "30 ngày qua";
      case "90days":
        return "90 ngày qua";
      case "6months":
        return "6 tháng qua";
      case "1year":
        return "1 năm qua";
      case "all":
        return "Tất cả thời gian";
      case "custom":
        return customDateRange.startDate && customDateRange.endDate
          ? `${formatDate(customDateRange.startDate)} - ${formatDate(
              customDateRange.endDate
            )}`
          : "Tùy chỉnh";
      default:
        return "14 ngày qua";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (activeTab === "revenue") {
                exportToExcel(revenueData, "Revenue_Report", [
                  { label: "Ngày", key: "date" },
                  { label: "Doanh thu", key: "revenue" },
                  { label: "Đơn hàng", key: "orders" },
                  { label: "Trung bình đơn", key: "averageOrder" },
                ]);
              } else if (activeTab === "dishes") {
                exportToExcel(topDishes, "Top_Dishes_Report", [
                  { label: "Món", key: "name" },
                  { label: "Danh mục", key: "category" },
                  { label: "Số lượng", key: "quantity" },
                  { label: "Doanh thu", key: "revenue" },
                ]);
              } else if (activeTab === "customers") {
                exportToExcel(loyalCustomers, "Loyal_Customers_Report", [
                  { label: "Tên", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Số lần mua", key: "purchaseCount" },
                  { label: "Tổng chi", key: "totalSpent" },
                  { label: "Trung bình", key: "averageSpent" },
                  { label: "Mua cuối", key: "lastPurchase" },
                ]);
              } else if (activeTab === "promotions") {
                exportToExcel(promotionData, "Promotions_Report", [
                  { label: "Khuyến mãi", key: "name" },
                  { label: "Số lần dùng", key: "usageCount" },
                  { label: "Tiền giảm", key: "discountAmount" },
                  { label: "Doanh thu", key: "revenue" },
                ]);
              }
            }}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "revenue", label: "Doanh thu" },
            { id: "dishes", label: "Món ăn" },
            { id: "customers", label: "Khách hàng" },
            { id: "promotions", label: "Khuyến mãi" },
            { id: "hourly", label: "Theo giờ" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-4 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Filter (for relevant tabs) */}
      {["revenue", "dishes", "customers", "promotions"].includes(activeTab) && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-48">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10days">10 ngày qua (10 ngày)</option>
                <option value="14days">14 ngày qua (14 ngày)</option>
                <option value="30days">30 ngày qua (30 ngày)</option>
                <option value="90days">90 ngày qua (90 ngày)</option>
                <option value="6months">6 tháng qua (~180 ngày)</option>
                <option value="1year">1 năm qua (~365 ngày)</option>
                <option value="all">Tất cả thời gian</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {timeRange === "custom" && (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) =>
                        setCustomDateRange({
                          ...customDateRange,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) =>
                        setCustomDateRange({
                          ...customDateRange,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  <button
                    onClick={() => validateCustomRange() && fetchData()}
                    disabled={!validateCustomRange()}
                    className={`px-4 py-2 rounded-lg ${
                      validateCustomRange()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Áp dụng
                  </button>
                </div>
                {!validateCustomRange() && timeRange === "custom" && (
                  <p className="text-sm text-red-500">
                    Vui lòng chọn khoảng thời gian ít nhất 10 ngày.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Tổng quan</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : overviewData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Doanh thu hôm nay
                </h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(overviewData.doanhThuHomNay)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Doanh thu tháng này
                </h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(overviewData.doanhThuThangNay)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Tỷ lệ tăng trưởng
                </h3>
                <p className="text-2xl font-bold">
                  {overviewData.tyLeTangTruong}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Đơn hàng hôm nay
                </h3>
                <p className="text-2xl font-bold">
                  {overviewData.donHangHomNay}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Tổng khách hàng
                </h3>
                <p className="text-2xl font-bold">
                  {overviewData.tongKhachHang}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Tổng món ăn
                </h3>
                <p className="text-2xl font-bold">{overviewData.tongMonAn}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Đánh giá trung bình
                </h3>
                <p className="text-2xl font-bold">
                  {overviewData.danhGiaTrungBinh}/5
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Biểu đồ doanh thu</h2>
              <span className="text-sm text-gray-600">
                Hiển thị: {getTimeRangeDisplay()}
              </span>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="h-80 w-full overflow-x-auto">
                <div style={{ minWidth: revenueData.length * 50 + 100 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={revenueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        interval={Math.max(
                          0,
                          Math.floor(revenueData.length / 10)
                        )}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => `${value.toLocaleString()} VNĐ`}
                        labelFormatter={formatDate}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Tổng doanh thu</h2>
              <p className="text-3xl font-bold">
                {formatCurrency(calculateTotalRevenue())}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Tổng đơn hàng</h2>
              <p className="text-3xl font-bold">{calculateTotalOrders()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Giá trị đơn hàng trung bình
              </h2>
              <p className="text-3xl font-bold">
                {formatCurrency(calculateAverageOrderValue())}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">
                Top 10 món ăn có doanh thu cao nhất
              </h2>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {category.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">
                Doanh thu theo phương thức thanh toán
              </h2>
              <div className="space-y-4">
                {paymentMethodData.map((payment, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {payment.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(payment.value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${payment.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {payment.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dishes Tab */}
      {activeTab === "dishes" && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Món ăn bán chạy</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên món
                    </th>

                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort("quantity", topDishes, setTopDishes)
                      }
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lần đặt
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort("revenue", topDishes, setTopDishes)
                      }
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
                        <div className="text-sm font-medium text-gray-900">
                          {dish.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dish.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {dish.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(dish.revenue)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Khách hàng thân thiết</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "purchaseCount",
                          loyalCustomers,
                          setLoyalCustomers
                        )
                      }
                    >
                      <div className="flex items-center">
                        Số lần mua
                        {sortConfig.key === "purchaseCount" && (
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "totalSpent",
                          loyalCustomers,
                          setLoyalCustomers
                        )
                      }
                    >
                      <div className="flex items-center">
                        Tổng chi
                        {sortConfig.key === "totalSpent" && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lần mua cuối
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loyalCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.purchaseCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(customer.totalSpent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(customer.lastPurchase)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === "promotions" && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Thống kê khuyến mãi</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên khuyến mãi
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "usageCount",
                          promotionData,
                          setPromotionData
                        )
                      }
                    >
                      <div className="flex items-center">
                        Số lần sử dụng
                        {sortConfig.key === "usageCount" && (
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "discountAmount",
                          promotionData,
                          setPromotionData
                        )
                      }
                    >
                      <div className="flex items-center">
                        Tổng tiền giảm
                        {sortConfig.key === "discountAmount" && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promotionData.map((promo) => (
                    <tr key={promo.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {promo.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {promo.usageCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(promo.discountAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(promo.revenue)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hourly Tab */}
      {activeTab === "hourly" && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Doanh thu theo giờ</h2>
            <div className="relative w-48">
              <input
                type="date"
                value={hourlyDate}
                onChange={(e) => setHourlyDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={hourlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gio" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} VNĐ`}
                  />
                  <Bar dataKey="doanhThu" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
