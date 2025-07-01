using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.DTO.Auth
{
	public class RegisterDTO
	{
		public string MaTaiKhoan { get; set; } = null!;

		public string TenTaiKhoan { get; set; } = null!;

		public string MatKhau { get; set; } = null!;

		public string? Email { get; set; }

		public string? SoDienThoai { get; set; }

		public string? DiaChi { get; set; }

		public DateOnly NgayDangKy { get; set; }

		public DateOnly? NgaySinh { get; set; }

		public string? MaQuyen { get; set; }
	}
}
