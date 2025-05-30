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
}
