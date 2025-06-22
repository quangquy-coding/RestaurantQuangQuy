using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using RestaurantQuangQuy.DTO.Auth;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.Services;
using System.Security.Cryptography;
using System.Text;

namespace RestaurantQuangQuy.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NguoiDungController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		private readonly IEmailService _emailService;
		private readonly IMemoryCache _memoryCache;
		public NguoiDungController(RestaurantManagementContext context, IMemoryCache memoryCache, IEmailService emailService)
		{
			_memoryCache = memoryCache;
			_context = context;
			_emailService = emailService;
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] TaiKhoanDTO dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.TenTaiKhoan) || string.IsNullOrWhiteSpace(dto.MatKhau))
				return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin." });

			// Validate email format
			if (!IsValidEmail(dto.Email))
				return BadRequest(new { message = "Email không hợp lệ." });

			// Check for duplicate username
			bool usernameExists = await _context.Taikhoans.AnyAsync(x => x.TenTaiKhoan == dto.TenTaiKhoan);
			if (usernameExists)
				return BadRequest(new { message = "Tên tài khoản đã tồn tại." });

			// Check for duplicate email in Taikhoans
			bool emailExistsInTaikhoan = await _context.Taikhoans.AnyAsync(x => x.Email == dto.Email);
			if (emailExistsInTaikhoan)
				return BadRequest(new { message = "Email đã được sử dụng" });

			// Check for duplicate email in Khachhang
			bool emailExistsInKhachhang = await _context.Khachhangs.AnyAsync(x => x.Email == dto.Email);
			if (emailExistsInKhachhang)
				return BadRequest(new { message = "Email đã được sử dụng trong bảng KHACHHANG." });

			string otpCode = new Random().Next(100000, 999999).ToString();
			Console.WriteLine($"Generated OTP: {otpCode} for email: {dto.Email}");

			var cacheData = new
			{
				dto.TenTaiKhoan,
				dto.MatKhau,
				dto.SoDienThoai,
				dto.DiaChi,
				dto.NgaySinh,
				dto.TenKhachHang,
				OtpCode = otpCode,
				ExpireAt = DateTime.Now.AddMinutes(5)
			};

			_memoryCache.Set($"otp_{otpCode}", new { Email = dto.Email, Data = cacheData }, TimeSpan.FromMinutes(10));
			Console.WriteLine($"Stored OTP in cache: otp_{otpCode}");

			string emailBody = $@"
    <div style='font-family: Arial, sans-serif; background-color: #f2f4f6; padding: 40px;'>
        <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;'>
            <div style='background-color: #d9230f; color: #ffffff; padding: 24px 32px; text-align: center;'>
                <h1 style='margin: 0; font-size: 24px;'>🍽 Nhà hàng Quang Quý</h1>
                <p style='margin: 4px 0 0; font-size: 16px;'>Xác thực đăng ký tài khoản</p>
            </div>
            <div style='padding: 32px; text-align: center;'>
                <p style='font-size: 16px; color: #333;'>Xin chào <strong>{dto.TenTaiKhoan}</strong>,</p>
                <p style='font-size: 16px; color: #333;'>Cảm ơn bạn đã đăng ký tại <strong>Nhà hàng Quang Quý</strong>!</p>
                <p style='font-size: 16px; color: #333;'>Mã xác thực tài khoản của bạn là:</p>
                <div style='margin: 20px auto; display: inline-block; background-color: #fff3f0; padding: 16px 32px; border-radius: 8px; border: 2px dashed #d9230f;'>
                    <span style='font-size: 32px; color: #d9230f; letter-spacing: 4px; font-weight: bold;'>{otpCode}</span>
                </div>
                <p style='font-size: 14px; color: #777; margin-top: 24px;'>Mã có hiệu lực trong vòng 5 phút kể từ thời điểm nhận được email này.</p>
                <p style='font-size: 14px; color: #777;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                <p style='font-size: 14px; color: #777;'>Trân trọng,<br /><strong>Đội ngũ Quang Quý Restaurant</strong></p>
            </div>
            <div style='background-color: #f9f9f9; text-align: center; padding: 16px; font-size: 12px; color: #999;'>
                © {DateTime.Now.Year} Quang Quý Restaurant. All rights reserved.
            </div>
        </div>
    </div>";

			try
			{
				await _emailService.SendEmailAsync(dto.Email, "Mã xác thực đăng ký", emailBody);
				return Ok(new { message = "Đã gửi mã xác thực. Vui lòng kiểm tra email." });
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Failed to send email: {ex.Message}");
				return StatusCode(500, new { message = "Lỗi khi gửi email. Vui lòng thử lại sau." });
			}
		}

		private bool IsValidEmail(string email)
		{
			try
			{
				var addr = new System.Net.Mail.MailAddress(email);
				return addr.Address == email;
			}
			catch
			{
				return false;
			}
		}
		[HttpPost("verify")]
		public async Task<IActionResult> VerifyOtp([FromBody] string otpCode)
		{
			Console.WriteLine($"Received OTP for verification: {otpCode}");

			if (string.IsNullOrWhiteSpace(otpCode))
				return BadRequest(new { message = "Mã xác thực không được để trống." });

			if (!_memoryCache.TryGetValue($"otp_{otpCode}", out dynamic cached))
				return BadRequest(new { message = "Mã xác thực không đúng hoặc đã hết hạn. Vui lòng yêu cầu mã mới." });

			var dto = cached.Data;
			string email = cached.Email;

			// Validate email
			if (string.IsNullOrWhiteSpace(email) || email == "string")
			{
				_memoryCache.Remove($"otp_{otpCode}");
				Console.WriteLine($"Invalid email detected: {email}");
				return BadRequest(new { message = "Email không hợp lệ." });
			}

			// Check for duplicate email in Taikhoans
			bool emailExistsInTaikhoan = await _context.Taikhoans.AnyAsync(x => x.Email == email);
			if (emailExistsInTaikhoan)
			{
				_memoryCache.Remove($"otp_{otpCode}");
				return BadRequest(new { message = "Email đã được sử dụng trong bảng TAIKHOAN." });
			}

			// Check for duplicate email in Khachhang
			bool emailExistsInKhachhang = await _context.Khachhangs.AnyAsync(x => x.Email == email);
			if (emailExistsInKhachhang)
			{
				_memoryCache.Remove($"otp_{otpCode}");
				return BadRequest(new { message = "Email đã được sử dụng trong bảng KHACHHANG." });
			}

			string maTaiKhoan = $"TK{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
			string maKhachHang = $"KH{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

			var taiKhoan = new Taikhoan
			{
				MaTaiKhoan = maTaiKhoan,
				TenTaiKhoan = dto.TenTaiKhoan,
				MatKhau = HashPassword(dto.MatKhau),
				Email = email,
				SoDienThoai = dto.SoDienThoai,
				DiaChi = dto.DiaChi,
				NgayDangKy = DateOnly.FromDateTime(DateTime.Now),
				NgaySinh = dto.NgaySinh,
				MaQuyen = "Q006"
			};

			var khachHang = new Khachhang
			{
				MaKhachHang = maKhachHang,
				TenKhachHang = string.IsNullOrEmpty(dto.TenKhachHang) ? dto.TenTaiKhoan : dto.TenKhachHang,
				SoDienThoai = dto.SoDienThoai,
				DiaChi = dto.DiaChi,
				Email = email,
				MaTaiKhoan = maTaiKhoan
			};

			using var transaction = await _context.Database.BeginTransactionAsync();
			try
			{
				await _context.Taikhoans.AddAsync(taiKhoan);
				await _context.Khachhangs.AddAsync(khachHang);
				await _context.SaveChangesAsync();
				await transaction.CommitAsync();
				_memoryCache.Remove($"otp_{otpCode}");
				return Ok(new { message = "Xác thực thành công. Tài khoản đã được tạo." });
			}
			catch (DbUpdateException ex)
			{
				await transaction.RollbackAsync();
				Console.WriteLine($"Database error: {ex.InnerException?.Message}");
				return StatusCode(500, new { message = "Lỗi khi tạo tài khoản. Vui lòng thử lại." });
			}
		}

		[HttpPost("forgot-password/send-code")]
		public async Task<IActionResult> SendResetCode([FromBody] string email)
		{
			if (string.IsNullOrWhiteSpace(email))
				return BadRequest(new { message = "Email không được để trống." });

			var user = await _context.Taikhoans.FirstOrDefaultAsync(u => u.Email == email);
			if (user == null)
				return BadRequest(new { message = "Email không tồn tại." });

			string otp = new Random().Next(100000, 999999).ToString();
			user.OtpCode = otp;
			user.OtpExpiry = DateTime.Now.AddMinutes(5);

			await _context.SaveChangesAsync();

			string emailBody = $@"
<div style='font-family: Arial, sans-serif; background-color: #f2f4f6; padding: 40px;'>
    <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;'>
        <div style='background-color: #d9230f; color: #ffffff; padding: 24px 32px; text-align: center;'>
            <h1 style='margin: 0; font-size: 24px;'>🍽 Nhà hàng Quang Quý</h1>
            <p style='margin: 4px 0 0; font-size: 16px;'>Xác nhận đặt lại mật khẩu</p>
        </div>
        <div style='padding: 32px; text-align: center;'>
            <p style='font-size: 16px; color: #333;'>Xin chào,</p>
            <p style='font-size: 16px; color: #333;'>Mã xác thực để đặt lại mật khẩu của bạn là:</p>
            <div style='margin: 20px auto; display: inline-block; background-color: #fff3f0; padding: 16px 32px; border-radius: 8px; border: 2px dashed #d9230f;'>
                <span style='font-size: 32px; color: #d9230f; letter-spacing: 4px; font-weight: bold;'>{otp}</span>
            </div>
            <p style='font-size: 14px; color: #777; margin-top: 24px;'>Mã có hiệu lực trong vòng 5 phút kể từ thời điểm nhận được email này.</p>
            <p style='font-size: 14px; color: #777;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
            <p style='font-size: 14px; color: #777;'>Trân trọng,<br /><strong>Đội ngũ Quang Quý Restaurant</strong></p>
        </div>
        <div style='background-color: #f9f9f9; text-align: center; padding: 16px; font-size: 12px; color: #999;'>
            © {DateTime.Now.Year} Quang Quý Restaurant. All rights reserved.
        </div>
    </div>
</div>";

			await _emailService.SendEmailAsync(email, "Quên mật khẩu - Mã xác nhận", emailBody);

			return Ok(new { message = "Đã gửi mã xác nhận đến email." });
		}

		[HttpPost("verify-code")]
		public async Task<IActionResult> VerifyCode([FromBody] CheckCodeDTO dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Code))
				return BadRequest(new { message = "Mã xác nhận không được để trống." });

			var user = await _context.Taikhoans
				.FirstOrDefaultAsync(u => u.OtpCode == dto.Code && u.OtpExpiry.HasValue && u.OtpExpiry > DateTime.Now);

			if (user == null)
				return BadRequest(new { message = "Mã xác nhận không hợp lệ hoặc đã hết hạn." });

			return Ok(new { message = "Mã xác nhận hợp lệ." });
		}

		[HttpPost("reset-password/code")]
		public async Task<IActionResult> ResetPasswordWithCode([FromBody] ResetPasswordWithCodeDTO dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.MatKhau))
				return BadRequest(new { message = "Mã code và mật khẩu mới không được để trống." });

			var user = await _context.Taikhoans
				.FirstOrDefaultAsync(u => u.OtpCode == dto.Code && u.OtpExpiry.HasValue && u.OtpExpiry > DateTime.Now);

			if (user == null)
				return BadRequest(new { message = "Mã xác nhận không hợp lệ hoặc đã hết hạn." });

			user.MatKhau = HashPassword(dto.MatKhau);
			user.OtpCode = null;
			user.OtpExpiry = null;

			await _context.SaveChangesAsync();

			return Ok(new { message = "Đặt lại mật khẩu thành công." });
		}

		[HttpPost("forgot-password/send-link")]
		public async Task<IActionResult> SendResetLink([FromBody] string email)
		{
			if (string.IsNullOrWhiteSpace(email))
				return BadRequest(new { message = "Email không được để trống." });

			var user = await _context.Taikhoans.FirstOrDefaultAsync(u => u.Email == email);
			if (user == null)
				return BadRequest(new { message = "Email không tồn tại." });

			string token = Guid.NewGuid().ToString("N");
			user.OtpCode = token;
			user.OtpExpiry = DateTime.Now.AddMinutes(10);

			await _context.SaveChangesAsync();

			string resetLink = $"https://nguyenquangquy.id.vn/reset-password?token={token}";
			string emailBody = $@"
<div style='font-family: Arial, sans-serif; background-color: #f2f4f6; padding: 40px;'>
    <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;'>
        <div style='background-color: #d9230f; color: #ffffff; padding: 24px 32px; text-align: center;'>
            <h1 style='margin: 0; font-size: 24px;'>🍽 Nhà hàng Quang Quý</h1>
            <p style='margin: 4px 0 0; font-size: 16px;'>Đặt lại mật khẩu</p>
        </div>
        <div style='padding: 32px; text-align: center;'>
            <p style='font-size: 16px; color: #333;'>Xin chào,</p>
            <p style='font-size: 16px; color: #333;'>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn:</p>
            <a href='{resetLink}' style='display: inline-block; margin: 20px auto; background-color: #d9230f; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Đặt lại mật khẩu</a>
            <p style='font-size: 14px; color: #777; margin-top: 24px;'>Liên kết có hiệu lực trong vòng 10 phút kể từ thời điểm nhận được email này.</p>
            <p style='font-size: 14px; color: #777;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
            <p style='font-size: 14px; color: #777;'>Trân trọng,<br /><strong>Đội ngũ Quang Quý Restaurant</strong></p>
        </div>
        <div style='background-color: #f9f9f9; text-align: center; padding: 16px; font-size: 12px; color: #999;'>
            © {DateTime.Now.Year} Quang Quý Restaurant. All rights reserved.
        </div>
    </div>
</div>";

			await _emailService.SendEmailAsync(email, "Quên mật khẩu - Đặt lại qua liên kết", emailBody);

			return Ok(new { message = "Đã gửi liên kết đặt lại mật khẩu đến email." });
		}

		[HttpPost("reset-password/link")]
		public async Task<IActionResult> ResetPasswordWithLink([FromBody] ResetPasswordWithLinkDTO dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.MatKhau))
				return BadRequest(new { message = "Token và mật khẩu mới không được để trống." });

			var user = await _context.Taikhoans
				.FirstOrDefaultAsync(u => u.OtpCode == dto.Token && u.OtpExpiry.HasValue && u.OtpExpiry > DateTime.Now);

			if (user == null)
				return BadRequest(new { message = "Token không hợp lệ hoặc đã hết hạn." });

			user.MatKhau = HashPassword(dto.MatKhau);
			user.OtpCode = null;
			user.OtpExpiry = null;
			await _context.SaveChangesAsync();

			return Ok(new { message = "Đặt lại mật khẩu thành công." });
		}

		private string HashPassword(string password)
		{
			if (string.IsNullOrWhiteSpace(password))
				throw new ArgumentException("Mật khẩu không được để trống.");

			return BCrypt.Net.BCrypt.HashPassword(password);
		}
	}

	public class CheckCodeDTO
	{
		public string Code { get; set; }
	}

	public class ResetPasswordWithCodeDTO
	{
		public string Code { get; set; }
		public string MatKhau { get; set; }
	}

	public class ResetPasswordWithLinkDTO
	{
		public string Token { get; set; }
		public string MatKhau { get; set; }
	}
}