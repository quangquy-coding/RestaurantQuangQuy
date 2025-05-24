namespace RestaurantQuangQuy.DTO.Reservation
{
	public class ReservationDTO
	{
		public string MaKhachHang { get; set; } = null!;
		public int SoLuongKhach { get; set; } = 0;
		public List<string>? MaBans { get; set; } // Cho phép null hoặc rỗng
		public DateTime ThoiGianDat { get; set; }
		public DateTime ThoiGianDen { get; set; }
		public string TrangThai { get; set; } = null!;
		public string? GhiChu { get; set; }
	}

}
