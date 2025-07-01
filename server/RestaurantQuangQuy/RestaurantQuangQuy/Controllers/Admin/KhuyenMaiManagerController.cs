using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class KhuyenMaiManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public KhuyenMaiManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/KhuyenMaiManager
		[HttpGet]
		public async Task<IActionResult> GetAllKhuyenMai()
		{
			try
			{
				var khuyenMais = await _context.Khuyenmais
					.OrderByDescending(km => km.NgayBatDau)
					.ToListAsync();

				var result = khuyenMais.Select(km => new
				{
					km.MaKhuyenMai,
					km.TenKhuyenMai,
					km.MucTienToiThieu,
					km.TyLeGiamGia,
					km.NgayBatDau,
					km.NgayKetThuc,
					km.TrangThai,
					SoHoaDonSuDung = km.Hoadonthanhtoans.Count
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/KhuyenMaiManager/{id}
		[HttpGet("{id}")]
		public async Task<IActionResult> GetKhuyenMaiById(string id)
		{
			try
			{
				var khuyenMai = await _context.Khuyenmais
					.Include(km => km.Hoadonthanhtoans)
					.FirstOrDefaultAsync(km => km.MaKhuyenMai == id);

				if (khuyenMai == null)
					return NotFound("Khuyến mãi không tồn tại.");

				var result = new
				{
					khuyenMai.MaKhuyenMai,
					khuyenMai.TenKhuyenMai,
					khuyenMai.MucTienToiThieu,
					khuyenMai.TyLeGiamGia,
					khuyenMai.NgayBatDau,
					khuyenMai.NgayKetThuc,
					khuyenMai.TrangThai,
					SoHoaDonSuDung = khuyenMai.Hoadonthanhtoans.Count
				};

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// POST: api/KhuyenMaiManager
		[HttpPost]
		public async Task<IActionResult> ThemKhuyenMai([FromBody] KhuyenMaiDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				// Tạo mã khuyến mãi mới
				var lastKhuyenMai = await _context.Khuyenmais
					.OrderByDescending(km => km.MaKhuyenMai)
					.FirstOrDefaultAsync();

				string newMaKhuyenMai;
				if (lastKhuyenMai == null)
				{
					newMaKhuyenMai = "KM001";
				}
				else
				{
					string lastCode = lastKhuyenMai.MaKhuyenMai.Substring(2);
					int nextNumber = int.Parse(lastCode) + 1;
					newMaKhuyenMai = "KM" + nextNumber.ToString("D3");
				}

				var khuyenMai = new Khuyenmai
				{
					MaKhuyenMai = newMaKhuyenMai,
					TenKhuyenMai = dto.TenKhuyenMai,
					MucTienToiThieu = dto.MucTienToiThieu,
					TyLeGiamGia = dto.TyLeGiamGia,
					NgayBatDau = dto.NgayBatDau,
					NgayKetThuc = dto.NgayKetThuc,
					TrangThai = dto.TrangThai ?? "Hoạt động"
				};

				_context.Khuyenmais.Add(khuyenMai);
				await _context.SaveChangesAsync();

				return Ok(new { Message = "Thêm khuyến mãi thành công.", MaKhuyenMai = newMaKhuyenMai });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// PUT: api/KhuyenMaiManager/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> SuaKhuyenMai(string id, [FromBody] KhuyenMaiDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var khuyenMai = await _context.Khuyenmais.FindAsync(id);
				if (khuyenMai == null)
					return NotFound("Khuyến mãi không tồn tại.");

				khuyenMai.TenKhuyenMai = dto.TenKhuyenMai;
				khuyenMai.MucTienToiThieu = dto.MucTienToiThieu;
				khuyenMai.TyLeGiamGia = dto.TyLeGiamGia;
				khuyenMai.NgayBatDau = dto.NgayBatDau;
				khuyenMai.NgayKetThuc = dto.NgayKetThuc;
				khuyenMai.TrangThai = dto.TrangThai ?? khuyenMai.TrangThai;

				await _context.SaveChangesAsync();
				return Ok(new { Message = "Cập nhật khuyến mãi thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// DELETE: api/KhuyenMaiManager/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> XoaKhuyenMai(string id)
		{
			try
			{
				var khuyenMai = await _context.Khuyenmais
					.Include(km => km.Hoadonthanhtoans)
					.FirstOrDefaultAsync(km => km.MaKhuyenMai == id);

				if (khuyenMai == null)
					return NotFound("Khuyến mãi không tồn tại.");

				if (khuyenMai.Hoadonthanhtoans.Any())
					return BadRequest("Không thể xóa khuyến mãi đã được sử dụng.");

				_context.Khuyenmais.Remove(khuyenMai);
				await _context.SaveChangesAsync();

				return Ok(new { Message = "Xóa khuyến mãi thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/KhuyenMaiManager/KiemTraKhuyenMai/{maKhuyenMai}
		[HttpGet("KiemTraKhuyenMai/{maKhuyenMai}")]
		public async Task<IActionResult> KiemTraKhuyenMai(string maKhuyenMai, [FromQuery] decimal tongTien)
		{
			try
			{
				var khuyenMai = await _context.Khuyenmais
					.FirstOrDefaultAsync(km => km.MaKhuyenMai == maKhuyenMai);

				if (khuyenMai == null)
					return NotFound("Mã khuyến mãi không tồn tại.");

				var today = DateOnly.FromDateTime(DateTime.Now);

				if (khuyenMai.NgayBatDau > today || khuyenMai.NgayKetThuc < today)
					return BadRequest("Mã khuyến mãi đã hết hạn hoặc chưa có hiệu lực.");

				if (khuyenMai.TrangThai != "Hoạt động")
					return BadRequest("Mã khuyến mãi không hoạt động.");

				if (tongTien < khuyenMai.MucTienToiThieu)
					return BadRequest($"Đơn hàng phải có giá trị tối thiểu {khuyenMai.MucTienToiThieu:N0} VNĐ.");

				var tienGiam = tongTien * (khuyenMai.TyLeGiamGia ?? 0) / 100;

				return Ok(new
				{
					HopLe = true,
					TenKhuyenMai = khuyenMai.TenKhuyenMai,
					TyLeGiamGia = khuyenMai.TyLeGiamGia,
					TienGiam = tienGiam,
					TongTienSauGiam = tongTien - tienGiam
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/KhuyenMaiManager/KhuyenMaiHoatDong
		[HttpGet("KhuyenMaiHoatDong")]
		public async Task<IActionResult> GetKhuyenMaiHoatDong()
		{
			try
			{
				var today = DateOnly.FromDateTime(DateTime.Now);
				var khuyenMais = await _context.Khuyenmais
					.Where(km => km.TrangThai == "Hoạt động" &&
								km.NgayBatDau <= today &&
								km.NgayKetThuc >= today)
					.Select(km => new
					{
						km.MaKhuyenMai,
						km.TenKhuyenMai,
						km.MucTienToiThieu,
						km.TyLeGiamGia,
						km.NgayKetThuc
					})
					.ToListAsync();

				return Ok(khuyenMais);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
	}

	public class KhuyenMaiDto
	{
		public string TenKhuyenMai { get; set; } = null!;
		public decimal? MucTienToiThieu { get; set; }
		public decimal? TyLeGiamGia { get; set; }
		public DateOnly NgayBatDau { get; set; }
		public DateOnly NgayKetThuc { get; set; }
		public string? TrangThai { get; set; }
	}
}
