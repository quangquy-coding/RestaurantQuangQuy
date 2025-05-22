using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using RestaurantQuangQuy.DTO.Auth;
using RestaurantQuangQuy.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
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
	[HttpPost("google-login")]
	public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO dto)
	{
		if (string.IsNullOrWhiteSpace(dto.IdToken))
			return BadRequest(new { message = "IdToken không hợp lệ." });

		GoogleJsonWebSignature.Payload payload;

		try
		{
			payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken);
		}
		catch
		{
			return Unauthorized(new { message = "Xác thực Google thất bại." });
		}

		// Kiểm tra email có tồn tại không
		var user = await _context.Taikhoans
			.Include(u => u.MaQuyenNavigation)
			.FirstOrDefaultAsync(u => u.Email == payload.Email);

		if (user == null)
		{
			// Tạo tài khoản mới nếu chưa có
			user = new Taikhoan
			{
				MaTaiKhoan = "TK" + Guid.NewGuid().ToString("N").Substring(0, 8),
				TenTaiKhoan = payload.Email,
				Email = payload.Email,
				HinhAnh = payload.Picture,
				MaQuyen = "KH", // Mặc định là khách hàng
			};
			_context.Taikhoans.Add(user);
			await _context.SaveChangesAsync();
		}

		var token = GenerateJwtToken(user);

		return Ok(new
		{
			message = "Đăng nhập Google thành công",
			user = new
			{
				MaTaiKhoan = user.MaTaiKhoan,
				TenTaiKhoan = user.TenTaiKhoan,
				Email = user.Email,
				Quyen = user.MaQuyenNavigation?.TenQuyen,
				HinhAnh = user.HinhAnh,
				Token = token
			}
		});
	}

	//[HttpGet("google-login-url")]
	//public IActionResult GetGoogleLoginUrl()
	//{
	//	var clientId = _configuration["GoogleOAuth:ClientId"];
	//	var redirectUri = _configuration["GoogleOAuth:RedirectUri"];
	//	var scope = "openid%20email%20profile";

	//	var url = $"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={clientId}&redirect_uri={redirectUri}&scope={scope}&access_type=offline&prompt=consent";

	//	return Ok(new { url });
	//}

	//[HttpGet("google-callback")]
	//public async Task<IActionResult> GoogleCallback([FromQuery] string code)
	//{
	//	if (string.IsNullOrWhiteSpace(code))
	//		return BadRequest(new { message = "Mã xác thực không hợp lệ." });

	//	var clientId = _configuration["GoogleOAuth:ClientId"];
	//	var clientSecret = _configuration["GoogleOAuth:ClientSecret"];
	//	var redirectUri = _configuration["GoogleOAuth:RedirectUri"];

	//	// 1. Gửi code để lấy access token
	//	using var httpClient = new HttpClient();
	//	var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token");
	//	tokenRequest.Content = new FormUrlEncodedContent(new Dictionary<string, string>
	//{
	//	{"code", code },
	//	{"client_id", clientId },
	//	{"client_secret", clientSecret },
	//	{"redirect_uri", redirectUri },
	//	{"grant_type", "authorization_code" }
	//});

	//	var tokenResponse = await httpClient.SendAsync(tokenRequest);
	//	var tokenBody = await tokenResponse.Content.ReadAsStringAsync();
	//	var tokenData = JObject.Parse(tokenBody);
	//	var accessToken = tokenData.Value<string>("access_token");

	//	if (string.IsNullOrEmpty(accessToken))
	//		return BadRequest(new { message = "Không thể lấy access token từ Google." });

	//	// 2. Dùng access token để lấy thông tin người dùng
	//	httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
	//	var userInfoResponse = await httpClient.GetStringAsync("https://www.googleapis.com/oauth2/v2/userinfo");
	//	var userInfo = JObject.Parse(userInfoResponse);

	//	var email = userInfo.Value<string>("email");
	//	var name = userInfo.Value<string>("name");
	//	var picture = userInfo.Value<string>("picture");

	//	// 3. Kiểm tra người dùng trong DB
	//	var user = await _context.Taikhoans.FirstOrDefaultAsync(u => u.Email == email);
	//	if (user == null)
	//	{
	//		// Tạo tài khoản mới nếu chưa có
	//		user = new Taikhoan
	//		{
	//			MaTaiKhoan = "TK" + Guid.NewGuid().ToString("N").Substring(0, 10),
	//			TenTaiKhoan = email.Split('@')[0],
	//			Email = email,
	//			HinhAnh = picture,
	//			MaQuyen = "KH", // Mặc định là khách hàng
	//			MatKhau = "",   // Không có mật khẩu
	//		};

	//		_context.Taikhoans.Add(user);
	//		await _context.SaveChangesAsync();
	//	}

	//	var token = GenerateJwtToken(user);

	//	var result = new
	//	{
	//		MaTaiKhoan = user.MaTaiKhoan,
	//		TenTaiKhoan = user.TenTaiKhoan,
	//		Email = user.Email,
	//		HinhAnh = user.HinhAnh,
	//		Quyen = user.MaQuyenNavigation?.TenQuyen,
	//		Token = token
	//	};

	//	return Ok(new { message = "Đăng nhập Google thành công", user = result });
	//}
}
