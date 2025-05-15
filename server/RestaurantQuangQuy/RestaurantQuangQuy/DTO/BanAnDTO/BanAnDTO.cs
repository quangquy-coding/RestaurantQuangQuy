using RestaurantQuangQuy.Models;
namespace RestaurantQuangQuy.DTO.BanAnDTO
{

	public class BanAnDTO
	{

		// lấy thông tin từ bảng BanAn
		public string MaBan { get; set; }
		public string TenBan { get; set; }

		public string ViTri  { get; set; }
		public string TrangThai { get; set; }
		public int SoGhe { get; set; }
		public string GhiChu { get; set; }

	}
}
