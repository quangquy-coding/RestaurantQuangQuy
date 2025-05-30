using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class NhanVienManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public NhanVienManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/NhanVienManager
		[HttpGet]
		public async Task<IActionResult> GetAllNhanVien()
		{
			try
			{
				var nhanViens = await _context.Nhanviens
					.Include(nv => nv.MaTaiKhoanNavigation)
					.OrderBy(nv => nv.HoTen)
					.ToListAsync();

				var result = nhanViens.Select(nv => new
				{
					nv.MaNhanVien,
					nv.HoTen,
					nv.ChucVu,
					nv.Luong,
					nv.NgayTuyenDung,
					nv.SoCccd,
					nv.MaTaiKhoan,
					TenDangNhap = nv.MaTaiKhoanNavigation?.TenTaiKhoan,
					Email = nv.MaTaiKhoanNavigation?.Email,
					SoHoaDonXuLy = nv.Hoadonthanhtoans.Count
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/NhanVienManager/{id}
		[HttpGet("{id}")]
		public async Task<IActionResult> GetNhanVienById(string id)
		{
			try
			{
				var nhanVien = await _context.Nhanviens
					.Include(nv => nv.MaTaiKhoanNavigation)
					.Include(nv => nv.Hoadonthanhtoans)
					.FirstOrDefaultAsync(nv => nv.MaNhanVien == id);

				if (nhanVien == null)
					return NotFound("Nhân viên không tồn tại.");

				var result = new
				{
					nhanVien.MaNhanVien,
					nhanVien.HoTen,
					nhanVien.ChucVu,
					nhanVien.Luong,
					nhanVien.NgayTuyenDung,
					nhanVien.SoCccd,
					nhanVien.MaTaiKhoan,
					TenDangNhap = nhanVien.MaTaiKhoanNavigation?.TenTaiKhoan,
					Email = nhanVien.MaTaiKhoanNavigation?.Email,
					SoHoaDonXuLy = nhanVien.Hoadonthanhtoans.Count,
					TongTienHoaDon = nhanVien.Hoadonthanhtoans.Sum(hd => hd.TongTien)
				};

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// POST: api/NhanVienManager
		[HttpPost]
		public async Task<IActionResult> ThemNhanVien([FromBody] NhanVienDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				// Kiểm tra CCCD đã tồn tại chưa
				var cccdExists = await _context.Nhanviens
					.AnyAsync(nv => nv.SoCccd == dto.SoCccd);
				if (cccdExists)
					return BadRequest("Số CCCD đã tồn tại.");

				// Tạo mã nhân viên mới
				var lastNhanVien = await _context.Nhanviens
					.OrderByDescending(nv => nv.MaNhanVien)
					.FirstOrDefaultAsync();

				string newMaNhanVien;
				if (lastNhanVien == null)
				{
					newMaNhanVien = "NV001";
				}
				else
				{
					string lastCode = lastNhanVien.MaNhanVien.Substring(2);
					int nextNumber = int.Parse(lastCode) + 1;
					newMaNhanVien = "NV" + nextNumber.ToString("D3");
				}

				var nhanVien = new Nhanvien
				{
					MaNhanVien = newMaNhanVien,
					HoTen = dto.HoTen,
					ChucVu = dto.ChucVu,
					Luong = dto.Luong,
					NgayTuyenDung = dto.NgayTuyenDung ?? DateOnly.FromDateTime(DateTime.Now),
					SoCccd = dto.SoCccd,
					MaTaiKhoan = dto.MaTaiKhoan
				};

				_context.Nhanviens.Add(nhanVien);
				await _context.SaveChangesAsync();

				return Ok(new { Message = "Thêm nhân viên thành công.", MaNhanVien = newMaNhanVien });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// PUT: api/NhanVienManager/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> SuaNhanVien(string id, [FromBody] NhanVienDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var nhanVien = await _context.Nhanviens.FindAsync(id);
				if (nhanVien == null)
					return NotFound("Nhân viên không tồn tại.");

				// Kiểm tra CCCD đã tồn tại chưa (trừ nhân viên hiện tại)
				var cccdExists = await _context.Nhanviens
					.AnyAsync(nv => nv.SoCccd == dto.SoCccd && nv.MaNhanVien != id);
				if (cccdExists)
					return BadRequest("Số CCCD đã tồn tại.");

				nhanVien.HoTen = dto.HoTen;
				nhanVien.ChucVu = dto.ChucVu;
				nhanVien.Luong = dto.Luong;
				nhanVien.NgayTuyenDung = dto.NgayTuyenDung ?? nhanVien.NgayTuyenDung;
				nhanVien.SoCccd = dto.SoCccd;
				nhanVien.MaTaiKhoan = dto.MaTaiKhoan;

				await _context.SaveChangesAsync();
				return Ok(new { Message = "Cập nhật nhân viên thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// DELETE: api/NhanVienManager/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> XoaNhanVien(string id)
		{
			try
			{
				var nhanVien = await _context.Nhanviens
					.Include(nv => nv.Hoadonthanhtoans)
					.FirstOrDefaultAsync(nv => nv.MaNhanVien == id);

				if (nhanVien == null)
					return NotFound("Nhân viên không tồn tại.");

				if (nhanVien.Hoadonthanhtoans.Any())
					return BadRequest("Không thể xóa nhân viên đã xử lý hóa đơn.");

				_context.Nhanviens.Remove(nhanVien);
				await _context.SaveChangesAsync();

				return Ok(new { Message = "Xóa nhân viên thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/NhanVienManager/ChucVu
		[HttpGet("ChucVu")]
		public IActionResult GetChucVu()
		{
			var chucVuList = new List<string>
			{
				"Quản lý",
				"Thu ngân",
				"Phục vụ",
				"Đầu bếp",
				"Phụ bếp",
				"Bảo vệ",
				"Lễ tân"
			};

			return Ok(chucVuList);
		}

		// GET: api/NhanVienManager/ThongKe
		[HttpGet("ThongKe")]
		public async Task<IActionResult> ThongKeNhanVien()
		{
			try
			{
				var tongNhanVien = await _context.Nhanviens.CountAsync();
				var luongTrungBinh = await _context.Nhanviens.AverageAsync(nv => (double?)nv.Luong) ?? 0;

				var thongKeTheoChucVu = await _context.Nhanviens
					.GroupBy(nv => nv.ChucVu)
					.Select(g => new
					{
						ChucVu = g.Key,
						SoLuong = g.Count(),
						LuongTrungBinh = g.Average(nv => (double?)nv.Luong) ?? 0
					})
					.ToListAsync();

				var nhanVienMoiNhat = await _context.Nhanviens
					.OrderByDescending(nv => nv.NgayTuyenDung)
					.Take(5)
					.Select(nv => new
					{
						nv.MaNhanVien,
						nv.HoTen,
						nv.ChucVu,
						nv.NgayTuyenDung
					})
					.ToListAsync();

				return Ok(new
				{
					TongNhanVien = tongNhanVien,
					LuongTrungBinh = Math.Round(luongTrungBinh, 0),
					ThongKeTheoChucVu = thongKeTheoChucVu,
					NhanVienMoiNhat = nhanVienMoiNhat
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/NhanVienManager/TimKiem
		[HttpGet("TimKiem")]
		public async Task<IActionResult> TimKiemNhanVien([FromQuery] string? hoTen, [FromQuery] string? chucVu)
		{
			try
			{
				var query = _context.Nhanviens.AsQueryable();

				if (!string.IsNullOrEmpty(hoTen))
				{
					query = query.Where(nv => nv.HoTen.Contains(hoTen));
				}

				if (!string.IsNullOrEmpty(chucVu))
				{
					query = query.Where(nv => nv.ChucVu == chucVu);
				}

				var nhanViens = await query
					.Include(nv => nv.MaTaiKhoanNavigation)
					.OrderBy(nv => nv.HoTen)
					.ToListAsync();

				var result = nhanViens.Select(nv => new
				{
					nv.MaNhanVien,
					nv.HoTen,
					nv.ChucVu,
					nv.Luong,
					nv.NgayTuyenDung,
					nv.SoCccd,
					TenDangNhap = nv.MaTaiKhoanNavigation?.TenTaiKhoan
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
	}

	public class NhanVienDto
	{
		public string HoTen { get; set; } = null!;
		public string ChucVu { get; set; } = null!;
		public decimal? Luong { get; set; }
		public DateOnly? NgayTuyenDung { get; set; }
		public string? SoCccd { get; set; }
		public string? MaTaiKhoan { get; set; }
	}
}
