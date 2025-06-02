using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class DanhGiaManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public DanhGiaManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// Existing actions (GetAllDanhGia, GetDanhGiaById, ThemDanhGia, SuaDanhGia, XoaDanhGia, ThongKeDanhGia, LocTheoXepHang) remain unchanged
		[HttpGet]
		public async Task<IActionResult> GetAllDanhGia()
		{
			try
			{
				var danhGias = await _context.Danhgia
					.Include(dg => dg.MaKhachHangNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.OrderByDescending(dg => dg.NgayDanhGia)
					.ToListAsync();

				var result = danhGias.Select(dg => new
				{
					dg.MaDanhGia,
					dg.MaKhachHang,
					TenKhachHang = dg.MaKhachHangNavigation?.TenKhachHang,
					dg.MaHoaDon,
					dg.NoiDungPhanHoi,
					dg.NgayDanhGia,
					dg.XepHang,
					TongTienHoaDon = dg.MaHoaDonNavigation?.TongTien
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetDanhGiaById(string id)
		{
			try
			{
				var danhGia = await _context.Danhgia
					.Include(dg => dg.MaKhachHangNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.FirstOrDefaultAsync(dg => dg.MaDanhGia == id);

				if (danhGia == null)
					return NotFound("Đánh giá không tồn tại.");

				var result = new
				{
					danhGia.MaDanhGia,
					danhGia.MaKhachHang,
					TenKhachHang = danhGia.MaKhachHangNavigation?.TenKhachHang,
					Email = danhGia.MaKhachHangNavigation?.Email,
					danhGia.MaHoaDon,
					danhGia.NoiDungPhanHoi,
					danhGia.NgayDanhGia,
					danhGia.XepHang,
					TongTienHoaDon = danhGia.MaHoaDonNavigation?.TongTien
				};

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> ThemDanhGia([FromBody] DanhGiaDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var khachHang = await _context.Khachhangs.FindAsync(dto.MaKhachHang);
				if (khachHang == null)
					return NotFound("Khách hàng không tồn tại.");

				var hoaDon = await _context.Hoadonthanhtoans.FindAsync(dto.MaHoaDon);
				if (hoaDon == null)
					return NotFound("Hóa đơn không tồn tại.");

				var danhGiaCu = await _context.Danhgia
					.FirstOrDefaultAsync(dg => dg.MaHoaDon == dto.MaHoaDon);
				if (danhGiaCu != null)
					return BadRequest("Hóa đơn này đã được đánh giá.");

				var lastDanhGia = await _context.Danhgia
					.OrderByDescending(dg => dg.MaDanhGia)
					.FirstOrDefaultAsync();

				string newMaDanhGia;
				if (lastDanhGia == null)
				{
					newMaDanhGia = "DG001";
				}
				else
				{
					string lastCode = lastDanhGia.MaDanhGia.Substring(2);
					int nextNumber = int.Parse(lastCode) + 1;
					newMaDanhGia = "DG" + nextNumber.ToString("D3");
				}

				var danhGia = new Danhgium
				{
					MaDanhGia = newMaDanhGia,
					MaKhachHang = dto.MaKhachHang,
					MaHoaDon = dto.MaHoaDon,
					NoiDungPhanHoi = dto.NoiDungPhanHoi,
					NgayDanhGia = DateOnly.FromDateTime(DateTime.Now),
					XepHang = dto.XepHang
				};

				_context.Danhgia.Add(danhGia);
				await _context.SaveChangesAsync();

				return Ok(new { Message = "Thêm đánh giá thành công.", MaDanhGia = newMaDanhGia });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> SuaDanhGia(string id, [FromBody] DanhGiaDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var danhGia = await _context.Danhgia.FindAsync(id);
				if (danhGia == null)
					return NotFound("Đánh giá không tồn tại.");

				danhGia.NoiDungPhanHoi = dto.NoiDungPhanHoi;
				danhGia.XepHang = dto.XepHang;

				await _context.SaveChangesAsync();
				return Ok(new { Message = "Cập nhật đánh giá thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> XoaDanhGia(string id)
		{
			try
			{
				var danhGia = await _context.Danhgia.FindAsync(id);
				if (danhGia == null)
					return NotFound("Đánh giá không tồn tại.");

				_context.Danhgia.Remove(danhGia);
				await _context.SaveChangesAsync();

				return Ok(new { Message = "Xóa đánh giá thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpGet("ThongKe")]
		public async Task<IActionResult> ThongKeDanhGia()
		{
			try
			{
				var tongDanhGia = await _context.Danhgia.CountAsync();
				var diemTrungBinh = await _context.Danhgia.AverageAsync(dg => (double?)dg.XepHang) ?? 0;

				var thongKeTheoSao = await _context.Danhgia
					.GroupBy(dg => dg.XepHang)
					.Select(g => new
					{
						SoSao = g.Key,
						SoLuong = g.Count(),
						TyLe = Math.Round((double)g.Count() / tongDanhGia * 100, 1)
					})
					.OrderBy(x => x.SoSao)
					.ToListAsync();

				var danhGiaMoiNhat = await _context.Danhgia
					.Include(dg => dg.MaKhachHangNavigation)
					.OrderByDescending(dg => dg.NgayDanhGia)
					.Take(5)
					.Select(dg => new
					{
						dg.MaDanhGia,
						TenKhachHang = dg.MaKhachHangNavigation!.TenKhachHang,
						dg.XepHang,
						dg.NoiDungPhanHoi,
						dg.NgayDanhGia
					})
					.ToListAsync();

				return Ok(new
				{
					TongDanhGia = tongDanhGia,
					DiemTrungBinh = Math.Round(diemTrungBinh, 1),
					ThongKeTheoSao = thongKeTheoSao,
					DanhGiaMoiNhat = danhGiaMoiNhat
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpGet("LocTheoXepHang/{xepHang}")]
		public async Task<IActionResult> LocTheoXepHang(int xepHang)
		{
			try
			{
				var danhGias = await _context.Danhgia
					.Include(dg => dg.MaKhachHangNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.Where(dg => dg.XepHang == xepHang)
					.OrderByDescending(dg => dg.NgayDanhGia)
					.ToListAsync();

				var result = danhGias.Select(dg => new
				{
					dg.MaDanhGia,
					dg.MaKhachHang,
					TenKhachHang = dg.MaKhachHangNavigation?.TenKhachHang,
					dg.MaHoaDon,
					dg.NoiDungPhanHoi,
					dg.NgayDanhGia,
					dg.XepHang
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// New endpoint to fetch customers
		[HttpGet("KhachHangs")]
		public async Task<IActionResult> GetAllKhachHangs()
		{
			try
			{
				var khachHangs = await _context.Khachhangs
					.Select(kh => new { kh.MaKhachHang, kh.TenKhachHang })
					.ToListAsync();
				return Ok(khachHangs);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
	}

	public class DanhGiaDto
	{
		public string MaKhachHang { get; set; } = null!;
		public string MaHoaDon { get; set; } = null!;
		public string? NoiDungPhanHoi { get; set; }
		public int? XepHang { get; set; }
	}
}