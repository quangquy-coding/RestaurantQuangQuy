using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantQuangQuy.DTO.Auth;
using RestaurantQuangQuy.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
	private readonly RestaurantManagementContext _context;
	private readonly IConfiguration _configuration;

	public LoginController(RestaurantManagementContext context, IConfiguration configuration)
	{
		_context = context;
		_configuration = configuration;
	}

	// Đăng nhập với mật khẩu đã hash
	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginDTO dto)
	{
		if (string.IsNullOrWhiteSpace(dto.TenTaiKhoan) || string.IsNullOrWhiteSpace(dto.MatKhau))
			return BadRequest(new { message = "Vui lòng nhập tên tài khoản và mật khẩu." });

		var user = await _context.Taikhoans
			.Include(u => u.MaQuyenNavigation)
			.FirstOrDefaultAsync(u => u.TenTaiKhoan == dto.TenTaiKhoan);

		if (user == null)
			return Unauthorized(new { message = "Tên tài khoản hoặc mật khẩu không đúng." });

		//var hashedInputPassword = HashPassword(dto.MatKhau);
		if (!VerifyPassword (dto.MatKhau,user.MatKhau))
			return Unauthorized(new { message = "Tên tài khoản hoặc mật khẩu không đúng." });

		var token = GenerateJwtToken(user);

		var result = new
		{
			MaTaiKhoan = user.MaTaiKhoan,
			TenTaiKhoan = user.TenTaiKhoan,
			Email = user.Email,
			SoDienThoai = user.SoDienThoai,
			DiaChi = user.DiaChi,
			NgaySinh = user.NgaySinh,
			Quyen = user.MaQuyenNavigation?.TenQuyen,
			HinhAnh = user.HinhAnh,
			Token = token
		};

		return Ok(new { message = "Đăng nhập thành công", user = result });
	}

	// Hash lại tất cả mật khẩu hiện có trong DB (chạy 1 lần)
	
	private string HashPassword(string password)
	{
		if (string.IsNullOrWhiteSpace(password))
			throw new ArgumentException("Mật khẩu không được để trống.");

		return BCrypt.Net.BCrypt.HashPassword(password); // tự sinh salt và mã hóa
	}

	private bool VerifyPassword(string inputPassword, string hashedPassword)
	{
		return BCrypt.Net.BCrypt.Verify(inputPassword, hashedPassword);
	}

	private string GenerateJwtToken(Taikhoan user)
	{
		var secretKey = _configuration["JwtSettings:Key"];
		if (string.IsNullOrEmpty(secretKey))
			throw new Exception("JWT Secret key is not configured.");

		var key = Encoding.UTF8.GetBytes(secretKey);

		var claims = new[]
		{
			new Claim(ClaimTypes.NameIdentifier, user.MaTaiKhoan),
			new Claim(ClaimTypes.Name, user.TenTaiKhoan),
			new Claim(ClaimTypes.Role, user.MaQuyenNavigation?.TenQuyen ?? "")
		};

		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "60")),
			Issuer = _configuration["JwtSettings:Issuer"],
			Audience = _configuration["JwtSettings:Audience"],
			SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
		};

		var tokenHandler = new JwtSecurityTokenHandler();
		var token = tokenHandler.CreateToken(tokenDescriptor);
		return tokenHandler.WriteToken(token);
	}
}
