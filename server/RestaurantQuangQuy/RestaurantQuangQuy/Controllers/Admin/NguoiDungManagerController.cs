using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NguoiDungManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public NguoiDungManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/NguoiDungManager
		[HttpGet]
		public async Task<ActionResult<IEnumerable<NguoiDungDTO>>> GetAllNguoiDung()
		{
			var nguoiDungs = await _context.Taikhoans
				.Include(tk => tk.MaQuyenNavigation)
				.Include(tk => tk.Khachhang)
				.Include(tk => tk.Nhanvien)
				.Select(tk => new NguoiDungDTO
				{
					MaTaiKhoan = tk.MaTaiKhoan,
					TenTaiKhoan = tk.TenTaiKhoan,
					Email = tk.Email,
					MatKhau = tk.MatKhau,
					SoDienThoai = tk.SoDienThoai,
					DiaChi = tk.DiaChi,
					NgayDangKy = tk.NgayDangKy,
					NgaySinh = tk.NgaySinh,
					MaQuyen = tk.MaQuyen,
					TenQuyen = tk.MaQuyenNavigation != null ? tk.MaQuyenNavigation.TenQuyen : null,
					HinhAnh = tk.HinhAnh != null ? tk.HinhAnh : null,

					// Thông tin khách hàng (nếu có)
					MaKhachHang = tk.Khachhang != null ? tk.Khachhang.MaKhachHang : null,
					TenKhachHang = tk.Khachhang != null ? tk.Khachhang.TenKhachHang : null,

					// Thông tin nhân viên (nếu có)
					MaNhanVien = tk.Nhanvien != null ? tk.Nhanvien.MaNhanVien : null,
					HoTenNhanVien = tk.Nhanvien != null ? tk.Nhanvien.HoTen : null,
					ChucVu = tk.Nhanvien != null ? tk.Nhanvien.ChucVu : null,
					Luong = tk.Nhanvien != null ? tk.Nhanvien.Luong : null,
					NgayTuyenDung = tk.Nhanvien != null ? tk.Nhanvien.NgayTuyenDung : null,
					SoCccd = tk.Nhanvien != null ? tk.Nhanvien.SoCccd : null,


				})
				.ToListAsync();

			return Ok(nguoiDungs);
		}
		[HttpPost]
		public async Task<ActionResult<NguoiDungDTO>> CreateNguoiDung(NguoiDungDTO dto)
		{
			if (string.IsNullOrEmpty(dto.MaQuyen))
				return BadRequest("Vai trò (MaQuyen) là bắt buộc.");

			// Kiểm tra email tồn tại
			var emailExists = await _context.Taikhoans.AnyAsync(t => t.Email == dto.Email);
			if (emailExists)
				return BadRequest("Email đã được sử dụng, vui lòng chọn Email khác.");

			// Sinh mã tài khoản mới
			string maTaiKhoan = await GenerateNextMaTaiKhoanAsync();

			var taiKhoan = new Taikhoan
			{
				MaTaiKhoan = maTaiKhoan,
				TenTaiKhoan = dto.TenTaiKhoan,
				MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau),
				Email = dto.Email,
				SoDienThoai = dto.SoDienThoai,
				DiaChi = dto.DiaChi,
				NgayDangKy = dto.NgayDangKy ?? DateOnly.FromDateTime(DateTime.Now),
				NgaySinh = dto.NgaySinh,
				MaQuyen = dto.MaQuyen,
				HinhAnh = dto.HinhAnh
			};
			await _context.Taikhoans.AddAsync(taiKhoan);
			await _context.SaveChangesAsync();

			// Tạo khách hàng hoặc nhân viên nếu cần
			if (dto.MaQuyen == "Q006") // Khách hàng
			{
				string maKhachHang = await GenerateNextMaKhachHangAsync();
				var kh = new Khachhang
				{
					MaKhachHang = maKhachHang,
					MaTaiKhoan = maTaiKhoan,
					TenKhachHang = dto.TenKhachHang ?? dto.TenTaiKhoan
				};
				await _context.Khachhangs.AddAsync(kh);
			}
			else if (dto.MaQuyen == "Q003" || dto.MaQuyen == "Q001")
			{
				if (dto.MaQuyen != "Q001") // Không phải admin thì tạo nhân viên
				{
					string maNhanVien = await GenerateNextMaNhanVienAsync();
					var nv = new Nhanvien
					{
						MaNhanVien = maNhanVien,
						MaTaiKhoan = maTaiKhoan,
						HoTen = dto.HoTenNhanVien ?? dto.TenTaiKhoan,
						ChucVu = dto.ChucVu ?? "Nhân viên",
						Luong = dto.Luong ?? 0,
						NgayTuyenDung = dto.NgayTuyenDung ?? DateOnly.FromDateTime(DateTime.Now),
						SoCccd = dto.SoCccd
					};
					await _context.Nhanviens.AddAsync(nv);
				}
			}

			await _context.SaveChangesAsync();

			dto.MaTaiKhoan = maTaiKhoan;
			dto.TenQuyen = GetTenQuyenFromMaQuyen(dto.MaQuyen);

			return CreatedAtAction(nameof(CreateNguoiDung), new { id = taiKhoan.MaTaiKhoan }, dto);
		}

		private async Task<string> GenerateNextMaTaiKhoanAsync()
		{
			int suffix = 1;
			while (true)
			{
				string newMa = $"TK{suffix:D3}";
				bool exists = await _context.Taikhoans.AnyAsync(t => t.MaTaiKhoan == newMa);
				if (!exists)
					return newMa;
				suffix++;
			}
		}


		private async Task<string> GenerateNextMaKhachHangAsync()
		{
			int suffix = 1;
			while (true)
			{
				string newMa = $"KH{suffix:D3}";
				bool exists = await _context.Khachhangs.AnyAsync(k => k.MaKhachHang == newMa);
				if (!exists)
					return newMa;
				suffix++;
			}
		}


		private async Task<string> GenerateNextMaNhanVienAsync()
		{
			int suffix = 1;
			while (true)
			{
				string newMa = $"NV{suffix:D3}";
				bool exists = await _context.Nhanviens.AnyAsync(n => n.MaNhanVien == newMa);
				if (!exists)
					return newMa;
				suffix++;
			}
		}


		private string GetTenQuyenFromMaQuyen(string? maQuyen)
		{
			return maQuyen switch
			{
				"Q001" => "Admin",
				"Q003" => "Nhân viên",
				"Q006" => "Khách hàng",
				_ => "Chưa xác định"
			};
		}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateNguoiDung(string id, NguoiDungDTO dto)
		{
			if (id != dto.MaTaiKhoan)
				return BadRequest("Mã tài khoản không khớp.");

			var taiKhoan = await _context.Taikhoans
				.Include(t => t.Khachhang)
				.Include(t => t.Nhanvien)
				.FirstOrDefaultAsync(t => t.MaTaiKhoan == id);

			if (taiKhoan == null)
				return NotFound("Không tìm thấy tài khoản.");

			// Cập nhật thông tin tài khoản chung
			taiKhoan.TenTaiKhoan = dto.TenTaiKhoan;
			taiKhoan.Email = dto.Email;
			taiKhoan.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau);
			taiKhoan.SoDienThoai = dto.SoDienThoai;
			taiKhoan.DiaChi = dto.DiaChi;
			taiKhoan.NgaySinh = dto.NgaySinh;
			taiKhoan.HinhAnh = dto.HinhAnh;

			// Cập nhật theo vai trò
			switch (dto.MaQuyen)
			{
				case "Q006": // Khách hàng
					if (taiKhoan.Khachhang != null)
					{
						taiKhoan.Khachhang.TenKhachHang = dto.TenKhachHang ?? dto.TenTaiKhoan;
					}
					break;

				case "Q003": // Nhân viên
					if (taiKhoan.Nhanvien != null)
					{
						taiKhoan.Nhanvien.HoTen = dto.HoTenNhanVien ?? dto.TenTaiKhoan;
						taiKhoan.Nhanvien.ChucVu = dto.ChucVu ?? "Nhân viên";
						taiKhoan.Nhanvien.Luong = dto.Luong ?? 0;
						taiKhoan.Nhanvien.NgayTuyenDung = dto.NgayTuyenDung ?? taiKhoan.Nhanvien.NgayTuyenDung;
						taiKhoan.Nhanvien.SoCccd = dto.SoCccd;
					}
					break;

				case "Q001": // Admin
							 // Không cần cập nhật Khachhang hoặc Nhanvien
					break;

				default:
					return BadRequest("Vai trò không hợp lệ.");
			}

			await _context.SaveChangesAsync();

			return NoContent(); // Cập nhật thành công
		}

		// delete 
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteNguoiDung(string id)
		{
			var taiKhoan = await _context.Taikhoans
				.Include(t => t.Khachhang)
				.Include(t => t.Nhanvien)
				.FirstOrDefaultAsync(t => t.MaTaiKhoan == id);
			if (taiKhoan == null)
				return NotFound("Không tìm thấy tài khoản.");
			// Xóa thông tin khách hàng hoặc nhân viên nếu có
			if (taiKhoan.Khachhang != null)
			{
				_context.Khachhangs.Remove(taiKhoan.Khachhang);
			}
			else if (taiKhoan.Nhanvien != null)
			{
				_context.Nhanviens.Remove(taiKhoan.Nhanvien);
			}
			// Xóa tài khoản
			_context.Taikhoans.Remove(taiKhoan);
			await _context.SaveChangesAsync();
			return NoContent(); // Xóa thành công
		}
		// xem chi tiết người dùng
		[HttpGet("{id}")]
		public async Task<ActionResult<NguoiDungDTO>> GetNguoiDung(string id)
		{
			var taiKhoan = await _context.Taikhoans
				.Include(t => t.MaQuyenNavigation)
				.Include(t => t.Khachhang)
				.Include(t => t.Nhanvien)
				.FirstOrDefaultAsync(t => t.MaTaiKhoan == id);
			if (taiKhoan == null)
				return NotFound("Không tìm thấy tài khoản.");
			var nguoiDungDTO = new NguoiDungDTO
			{
				MaTaiKhoan = taiKhoan.MaTaiKhoan,
				TenTaiKhoan = taiKhoan.TenTaiKhoan,
				Email = taiKhoan.Email,
				MatKhau = taiKhoan.MatKhau,
				SoDienThoai = taiKhoan.SoDienThoai,
				DiaChi = taiKhoan.DiaChi,
				NgayDangKy = taiKhoan.NgayDangKy,
				NgaySinh = taiKhoan.NgaySinh,
				MaQuyen = taiKhoan.MaQuyen,
				TenQuyen = taiKhoan.MaQuyenNavigation != null ? taiKhoan.MaQuyenNavigation.TenQuyen : null,
				HinhAnh = taiKhoan.HinhAnh != null ? taiKhoan.HinhAnh : null,
				// Thông tin khách hàng (nếu có)
				MaKhachHang = taiKhoan.Khachhang != null ? taiKhoan.Khachhang.MaKhachHang : null,
				TenKhachHang = taiKhoan.Khachhang != null ? taiKhoan.Khachhang.TenKhachHang : null,
				// Thông tin nhân viên (nếu có)
				MaNhanVien = taiKhoan.Nhanvien != null ? taiKhoan.Nhanvien.MaNhanVien : null,
				HoTenNhanVien = taiKhoan.Nhanvien != null ? taiKhoan.Nhanvien.HoTen : null,
				ChucVu = taiKhoan.Nhanvien != null ? taiKhoan.Nhanvien.ChucVu : null,
				Luong = taiKhoan.Nhanvien != null ? taiKhoan.Nhanvien.Luong : null,
				NgayTuyenDung = taiKhoan.Nhanvien != null?
				taiKhoan.Nhanvien.NgayTuyenDung : null,
				SoCccd = taiKhoan.Nhanvien != null
					? taiKhoan.Nhanvien.SoCccd : null,
			};
			return Ok(nguoiDungDTO);
		}
		
		//tìm kiếm theo tên tài khoản,tên,email,số điện thoại
		[HttpGet("search")]
		public async Task<ActionResult<IEnumerable<NguoiDungDTO>>> SearchNguoiDung(string? searchTerm)
		{
			if (string.IsNullOrEmpty(searchTerm))
				return BadRequest("Từ khóa tìm kiếm không được để trống.");
			var nguoiDungs = await _context.Taikhoans
				.Include(tk => tk.MaQuyenNavigation)
				.Include(tk => tk.Khachhang)
				.Include(tk => tk.Nhanvien)
				.Where(tk => tk.TenTaiKhoan.Contains(searchTerm) || tk.Email.Contains(searchTerm) || tk.SoDienThoai.Contains(searchTerm))
				.Select(tk => new NguoiDungDTO
				{
					MaTaiKhoan = tk.MaTaiKhoan,
					TenTaiKhoan = tk.TenTaiKhoan,
					Email = tk.Email,
					MatKhau = tk.MatKhau,
					SoDienThoai = tk.SoDienThoai,
					DiaChi = tk.DiaChi,
					NgayDangKy = tk.NgayDangKy,
					NgaySinh = tk.NgaySinh,
					MaQuyen = tk.MaQuyen,
					TenQuyen = tk.MaQuyenNavigation != null ? tk.MaQuyenNavigation.TenQuyen : null,
					HinhAnh = tk.HinhAnh != null ? tk.HinhAnh : null,
					// Thông tin khách hàng (nếu có)
					MaKhachHang = tk.Khachhang != null ? tk.Khachhang.MaKhachHang : null,
					TenKhachHang = tk.Khachhang != null ? tk.Khachhang.TenKhachHang : null,
					// Thông tin nhân viên (nếu có)
					MaNhanVien = tk.Nhanvien != null ? tk.Nhanvien.MaNhanVien : null,
					HoTenNhanVien = tk.Nhanvien != null ? tk.Nhanvien.HoTen : null,
					ChucVu = tk.Nhanvien != null ? tk.Nhanvien.ChucVu : null,
					Luong = tk.Nhanvien != null ? tk.Nhanvien.Luong : null,
					NgayTuyenDung = tk.Nhanvien != null ? tk.Nhanvien.NgayTuyenDung : null,
					SoCccd = tk.Nhanvien != null
					? tk.Nhanvien.SoCccd : null,
				})
				.ToListAsync();
			if (nguoiDungs == null || nguoiDungs.Count == 0)
				return NotFound("Không tìm thấy tài khoản nào phù hợp với từ khóa tìm kiếm.");
			return Ok(nguoiDungs);
		}

		//Lọc theo vai trò
		[HttpGet("filter")]
		public async Task<ActionResult<IEnumerable<NguoiDungDTO>>> FilterNguoiDung(string? maQuyen)
		{
			if (string.IsNullOrEmpty(maQuyen))
				return BadRequest("Vai trò không được để trống.");
			var nguoiDungs = await _context.Taikhoans
				.Include(tk => tk.MaQuyenNavigation)
				.Include(tk => tk.Khachhang)
				.Include(tk => tk.Nhanvien)
				.Where(tk => tk.MaQuyen == maQuyen)
				.Select(tk => new NguoiDungDTO
				{
					MaTaiKhoan = tk.MaTaiKhoan,
					TenTaiKhoan = tk.TenTaiKhoan,
					Email = tk.Email,
					MatKhau = tk.MatKhau,
					SoDienThoai = tk.SoDienThoai,
					DiaChi = tk.DiaChi,
					NgayDangKy = tk.NgayDangKy,
					NgaySinh = tk.NgaySinh,
					MaQuyen = tk.MaQuyen,
					TenQuyen = tk.MaQuyenNavigation != null ? tk.MaQuyenNavigation.TenQuyen : null,
					HinhAnh = tk.HinhAnh != null ? tk.HinhAnh : null,
					// Thông tin khách hàng (nếu có)
					MaKhachHang = tk.Khachhang != null ? tk.Khachhang.MaKhachHang : null,
					TenKhachHang = tk.Khachhang != null ? tk.Khachhang.TenKhachHang : null,
					// Thông tin nhân viên (nếu có)
					MaNhanVien = tk.Nhanvien != null ? tk.Nhanvien.MaNhanVien : null,
					HoTenNhanVien = tk.Nhanvien != null ? tk.Nhanvien.HoTen : null,
					ChucVu = tk.Nhanvien != null ? tk.Nhanvien.ChucVu : null,
					Luong = tk.Nhanvien != null ? tk.Nhanvien.Luong : null,
					NgayTuyenDung = tk.Nhanvien != null ? tk.Nhanvien.NgayTuyenDung : null,
					SoCccd = tk.Nhanvien != null
						? tk.Nhanvien.SoCccd : null,
				})
				.ToListAsync();
			if (nguoiDungs == null || nguoiDungs.Count == 0)
				return NotFound("Không tìm thấy tài khoản nào phù hợp với vai trò.");
			return Ok(nguoiDungs);
		}

		}
}
