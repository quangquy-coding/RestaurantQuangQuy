namespace RestaurantQuangQuy.DTO.Auth
{
	public class TaiKhoanDTO
	{
		public string? MaTaiKhoan { get; set; }
		public string? MaKhachHang { get; set; }
		public string TenKhachHang { get; set; } = string.Empty;
		public string TenTaiKhoan { get; set; } = string.Empty;
		public string MatKhau { get; set; } = string.Empty;
		public string Email { get; set; } = string.Empty;
		public string SoDienThoai { get; set; } = string.Empty;
		public string DiaChi { get; set; } = string.Empty;
		public DateOnly? NgaySinh { get; set; }
		public string? OtpCode { get; set; }
		public DateTime? OtpExpiry { get; set; }
	}
	public class ResetPasswordWithCodeDTO
	{
		public string Code { get; set; }
		public string MatKhau { get; set; } // Dùng trực tiếp luôn
	}
	public class ResetPasswordWithLinkDTO
	{
		public string Token { get; set; }
		public string MatKhau { get; set; }
	}
	public class ConfirmDto
	{
		public string Email { get; set; }
		public string Code { get; set; }
	}
	public class LoginDTO
	{
		public string TenTaiKhoan { get; set; } = null!;
		public string MatKhau { get; set; } = null!;
	}

	public class GoogleLoginDTO
	{
		public string IdToken { get; set; } = string.Empty;
	}




}
