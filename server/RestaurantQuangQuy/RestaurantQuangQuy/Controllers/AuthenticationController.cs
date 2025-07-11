﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RestaurantQuangQuy.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using RestaurantQuangQuy.DTO;
using RestaurantQuangQuy.DTO.Auth;

namespace RestaurantQuangQuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly RestaurantManagementContext _context;

        public AuthController(IConfiguration config, RestaurantManagementContext context)
        {
            _config = config;
            _context = context;
        }

		// Đăng ký tài khoản
		[HttpPost("register")]
		public IActionResult Register([FromBody] RegisterDTO user)
		{
			if (user == null || string.IsNullOrEmpty(user.TenTaiKhoan) || string.IsNullOrEmpty(user.MatKhau))
			{
				return BadRequest(new { message = "Invalid user data." });
			}

			// Kiểm tra xem người dùng đã tồn tại chưa
			var existingUser = _context.Taikhoans.FirstOrDefault(u => u.TenTaiKhoan == user.TenTaiKhoan);
			if (existingUser != null)
			{
				return Conflict(new { message = "User already exists." });
			}

			// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
			var hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.MatKhau);

			//tạo mã tài khoản tự động

			// Map từ DTO sang Entity
			var newUser = new Taikhoan
			{
				MaTaiKhoan = user.MaTaiKhoan,
				TenTaiKhoan = user.TenTaiKhoan,
				MatKhau = hashedPassword,
				Email = user.Email,
				SoDienThoai = user.SoDienThoai,
				DiaChi = user.DiaChi,
				NgayDangKy = DateOnly.FromDateTime(DateTime.UtcNow),
				NgaySinh = user.NgaySinh,
				MaQuyen = null
			};

			try
			{
				_context.Taikhoans.Add(newUser);
				_context.SaveChanges();
				return Ok(new { message = "User registered successfully.", userId = newUser.MaTaiKhoan });
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Lỗi khi đăng ký tài khoản: {ex.Message}");
				return StatusCode(500, "Internal server error. Please try again later.");
			}
		}

		// Đăng nhập
		[HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Tìm người dùng trong cơ sở dữ liệu
            var user = _context.Taikhoans.FirstOrDefault(u => u.TenTaiKhoan == request.Username);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // Kiểm tra mật khẩu
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhau))
            {
                return Unauthorized("Invalid password.");
            }

            // Tạo JWT token
            var token = GenerateJwtToken(user);
            return Ok(new { token,user });
        }

        private string GenerateJwtToken(Taikhoan user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Thêm claims cho JWT token
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.TenTaiKhoan),
                new Claim(ClaimTypes.NameIdentifier, user.MaTaiKhoan.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Model cho yêu cầu đăng nhập
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
