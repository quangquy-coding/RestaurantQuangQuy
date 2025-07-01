using System.ComponentModel.DataAnnotations;

namespace RestaurantQuangQuy.DTO.BanAnDTO
{
	public class BanAnDTO
	{
		public string MaBan { get; set; } = null!;
		public string TenBan { get; set; } = null!;
		public string ViTri { get; set; } = null!;
		public int SoGhe { get; set; }
		public string? GhiChu { get; set; }
	}
	public class CreateBanAnDTO
	{
		[Required(ErrorMessage = "Tên bàn không được để trống")]
		public string TenBan { get; set; }
		[Required(ErrorMessage = "Vị trí không được để trống")]
		public string ViTri { get; set; }
		[Range(1, int.MaxValue, ErrorMessage = "Số ghế phải lớn hơn 0")]
		public int SoGhe { get; set; }
		public string GhiChu { get; set; }
	}

	public class UpdateBanAnDTO
	{
		[Required(ErrorMessage = "Mã bàn không được để trống")]
		public string MaBan { get; set; }
		[Required(ErrorMessage = "Tên bàn không được để trống")]
		public string TenBan { get; set; }
		[Required(ErrorMessage = "Vị trí không được để trống")]
		public string ViTri { get; set; }
		[Range(1, int.MaxValue, ErrorMessage = "Số ghế phải lớn hơn 0")]
		public int SoGhe { get; set; }
		public string GhiChu { get; set; }
	}
}
