using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	internal class MonAn : Monan
	{
		public string MaMon { get; set; }
		public string TenMon { get; set; }
		public string MoTa { get; set; }
		public decimal Gia { get; set; }
		public string HinhAnh { get; set; }
		public string ThoiGianMon { get; set; }
		public string TinhTrang { get; set; }
		public string MaDanhMuc { get; set; }
		public string ThanhPhan { get; set; }  // Ví dụ: "Cơm, Tôm, Mực, Cua, Sò điệp"
		public string DinhDuong { get; set; }  // Có thể lưu JSON dưới dạng string
		public string DiUng { get; set; }
	}
}