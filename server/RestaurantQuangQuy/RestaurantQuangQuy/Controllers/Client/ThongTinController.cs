using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;
using System.Security.Claims;

namespace RestaurantQuangQuy.Controllers.Client
{
	[Route("api/[controller]")]
	[ApiController]
	public class ThongTinController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		public ThongTinController(RestaurantManagementContext context)
		{
			_context = context;
		}
		
		[HttpGet("me")]
		public async Task<ActionResult<NguoiDungDTO>> GetCurrentUser()
		{
			// Lấy email từ JWT token
			string email = User.FindFirst(ClaimTypes.Email)?.Value;

			if (string.IsNullOrEmpty(email))
				return Unauthorized("Không tìm thấy email trong token.");

			var taiKhoan = await _context.Taikhoans
				.Include(t => t.MaQuyenNavigation)
				.Include(t => t.Khachhang)
				.Include(t => t.Nhanvien)
				.FirstOrDefaultAsync(t => t.Email == email);

			if (taiKhoan == null)
				return NotFound("Không tìm thấy người dùng.");

			// Tạo DTO trả về
			var dto = new NguoiDungDTO
			{
				MaTaiKhoan = taiKhoan.MaTaiKhoan,
				TenTaiKhoan = taiKhoan.TenTaiKhoan,
				Email = taiKhoan.Email,
				SoDienThoai = taiKhoan.SoDienThoai,
				DiaChi = taiKhoan.DiaChi,
				NgayDangKy = taiKhoan.NgayDangKy,
				NgaySinh = taiKhoan.NgaySinh,
				MaQuyen = taiKhoan.MaQuyen,
				TenQuyen = taiKhoan.MaQuyenNavigation?.TenQuyen,
				HinhAnh = taiKhoan.HinhAnh,

				// Thông tin khách hàng
				MaKhachHang = taiKhoan.Khachhang?.MaKhachHang,
				TenKhachHang = taiKhoan.Khachhang?.TenKhachHang,

				// Thông tin nhân viên
				MaNhanVien = taiKhoan.Nhanvien?.MaNhanVien,
				HoTenNhanVien = taiKhoan.Nhanvien?.HoTen,
				ChucVu = taiKhoan.Nhanvien?.ChucVu,
				Luong = taiKhoan.Nhanvien?.Luong,
				NgayTuyenDung = taiKhoan.Nhanvien?.NgayTuyenDung,
				SoCccd = taiKhoan.Nhanvien?.SoCccd
			};

			return Ok(dto);
		}

	}
}
