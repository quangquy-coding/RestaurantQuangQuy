namespace RestaurantQuangQuy.DTO.DatMonAnDTO
{
	public class DonDatMonDto
	{
		public string MaKhachHang { get; set; } = null!;
		public List<ChiTietDatMonDto> ChiTietMon { get; set; } = new();
		public string? GhiChu { get; set; }
	}

	public class ChiTietDatMonDto
	{
		public string MaMon { get; set; } = null!;
		public int SoLuong { get; set; }
	}
}
