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
		private readonly IWebHostEnvironment _environment;


		public DanhGiaManagerController(RestaurantManagementContext context, IWebHostEnvironment environment)
		{
			_context = context;
			_environment = environment;
		}

		[HttpGet]
		public async Task<IActionResult> GetAllDanhGia()
		{
			try
			{
				var danhGias = await _context.Danhgia
					.Include(dg => dg.MaKhachHangNavigation)
						.ThenInclude(kh => kh.MaTaiKhoanNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.OrderByDescending(dg => dg.NgayDanhGia)
					.ToListAsync();

				var result = danhGias.Select(dg => new
				{
					dg.MaDanhGia,
					dg.MaKhachHang,
					TenKhachHang = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.TenKhachHang : null,
					Email = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.Email : null,
					Avatar = dg.MaKhachHangNavigation != null && dg.MaKhachHangNavigation.MaTaiKhoanNavigation != null
						? dg.MaKhachHangNavigation.MaTaiKhoanNavigation.HinhAnh : null,
					dg.MaHoaDon,
					dg.NoiDungPhanHoi,
					dg.NgayDanhGia,
					dg.XepHang,
					dg.PhanHoiDanhGia,
					dg.HinhAnhDanhGia,
					TongTienHoaDon = dg.MaHoaDonNavigation != null ? dg.MaHoaDonNavigation.TongTien : null
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
						.ThenInclude(kh => kh.MaTaiKhoanNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.FirstOrDefaultAsync(dg => dg.MaDanhGia == id);

				if (danhGia == null)
					return NotFound("Đánh giá không tồn tại.");

				var result = new
				{
					danhGia.MaDanhGia,
					danhGia.MaKhachHang,
					TenKhachHang = danhGia.MaKhachHangNavigation != null ? danhGia.MaKhachHangNavigation.TenKhachHang : null,
					Email = danhGia.MaKhachHangNavigation != null ? danhGia.MaKhachHangNavigation.Email : null,
					Avatar = danhGia.MaKhachHangNavigation != null && danhGia.MaKhachHangNavigation.MaTaiKhoanNavigation != null
						? danhGia.MaKhachHangNavigation.MaTaiKhoanNavigation.HinhAnh : null,
					danhGia.MaHoaDon,
					danhGia.NoiDungPhanHoi,
					danhGia.NgayDanhGia,
					danhGia.XepHang,
					danhGia.PhanHoiDanhGia,
					danhGia.HinhAnhDanhGia,
					TongTienHoaDon = danhGia.MaHoaDonNavigation != null ? danhGia.MaHoaDonNavigation.TongTien : null
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

				string newMaDanhGia = lastDanhGia == null
					? "DG001"
					: $"DG{(int.Parse(lastDanhGia.MaDanhGia.Substring(2)) + 1):D3}";

				var danhGia = new Danhgium
				{
					MaDanhGia = newMaDanhGia,
					MaKhachHang = dto.MaKhachHang,
					MaHoaDon = dto.MaHoaDon,
					NoiDungPhanHoi = dto.NoiDungPhanHoi,
					NgayDanhGia = DateOnly.FromDateTime(DateTime.Now),
					XepHang = dto.XepHang,
					HinhAnhDanhGia = dto.HinhAnhDanhGia
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
				danhGia.PhanHoiDanhGia = dto.PhanHoiDanhGia;
				danhGia.HinhAnhDanhGia = dto.HinhAnhDanhGia;

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
						.ThenInclude(kh => kh.MaTaiKhoanNavigation)
					.OrderByDescending(dg => dg.NgayDanhGia)
					.Take(5)
					.ToListAsync();

				var danhGiaMoiNhatResult = danhGiaMoiNhat.Select(dg => new
				{
					dg.MaDanhGia,
					TenKhachHang = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.TenKhachHang : null,
					Avatar = dg.MaKhachHangNavigation != null && dg.MaKhachHangNavigation.MaTaiKhoanNavigation != null
						? dg.MaKhachHangNavigation.MaTaiKhoanNavigation.HinhAnh : null,
					dg.XepHang,
					dg.NoiDungPhanHoi,
					dg.NgayDanhGia,
					dg.PhanHoiDanhGia,
					dg.HinhAnhDanhGia
				});

				return Ok(new
				{
					TongDanhGia = tongDanhGia,
					DiemTrungBinh = Math.Round(diemTrungBinh, 1),
					ThongKeTheoSao = thongKeTheoSao,
					DanhGiaMoiNhat = danhGiaMoiNhatResult
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
						.ThenInclude(kh => kh.MaTaiKhoanNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.Where(dg => dg.XepHang == xepHang)
					.OrderByDescending(dg => dg.NgayDanhGia)
					.ToListAsync();

				var result = danhGias.Select(dg => new
				{
					dg.MaDanhGia,
					dg.MaKhachHang,
					TenKhachHang = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.TenKhachHang : null,
					Email = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.Email : null,
					Avatar = dg.MaKhachHangNavigation != null && dg.MaKhachHangNavigation.MaTaiKhoanNavigation != null
						? dg.MaKhachHangNavigation.MaTaiKhoanNavigation.HinhAnh : null,
					dg.MaHoaDon,
					dg.NoiDungPhanHoi,
					dg.NgayDanhGia,
					dg.XepHang,
					dg.PhanHoiDanhGia,
					dg.HinhAnhDanhGia
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpGet("KhachHangs")]
		public async Task<IActionResult> GetAllKhachHangs()
		{
			try
			{
				var khachHangs = await _context.Khachhangs
					.Include(kh => kh.MaTaiKhoanNavigation)
					.ToListAsync();

				var result = khachHangs.Select(kh => new
				{
					kh.MaKhachHang,
					kh.TenKhachHang,
					Avatar = kh.MaTaiKhoanNavigation != null ? kh.MaTaiKhoanNavigation.HinhAnh : null
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpGet("search")]
		public async Task<IActionResult> SearchDanhGia(string query)
		{
			try
			{
				var danhGias = await _context.Danhgia
					.Include(dg => dg.MaKhachHangNavigation)
						.ThenInclude(kh => kh.MaTaiKhoanNavigation)
					.Include(dg => dg.MaHoaDonNavigation)
					.Where(dg =>
						(dg.MaKhachHangNavigation != null && dg.MaKhachHangNavigation.TenKhachHang.Contains(query)) ||
						(dg.NoiDungPhanHoi != null && dg.NoiDungPhanHoi.Contains(query)))
					.OrderByDescending(dg => dg.NgayDanhGia)
					.ToListAsync();

				var result = danhGias.Select(dg => new
				{
					dg.MaDanhGia,
					dg.MaKhachHang,
					TenKhachHang = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.TenKhachHang : null,
					Email = dg.MaKhachHangNavigation != null ? dg.MaKhachHangNavigation.Email : null,
					Avatar = dg.MaKhachHangNavigation != null && dg.MaKhachHangNavigation.MaTaiKhoanNavigation != null
						? dg.MaKhachHangNavigation.MaTaiKhoanNavigation.HinhAnh : null,
					dg.MaHoaDon,
					dg.NoiDungPhanHoi,
					dg.NgayDanhGia,
					dg.XepHang,
					dg.PhanHoiDanhGia,
					dg.HinhAnhDanhGia,
					TongTienHoaDon = dg.MaHoaDonNavigation != null ? dg.MaHoaDonNavigation.TongTien : null
				});

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}

		}
		[HttpPost("UploadImage")]
		public async Task<IActionResult> UploadImage(IFormFile file)
		{
			if (file == null || file.Length == 0)
				return BadRequest("No file uploaded.");

			try
			{
				var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
				if (!Directory.Exists(uploadsFolder))
					Directory.CreateDirectory(uploadsFolder);

				var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
				var filePath = Path.Combine(uploadsFolder, fileName);

				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await file.CopyToAsync(stream);
				}

				var fileUrl = $"{Request.Scheme}://{Request.Host}/Uploads/{fileName}";
				return Ok(new { url = fileUrl });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Error uploading file: {ex.Message}");
			}
		}
	}

	public class DanhGiaDto
	{
		public string MaKhachHang { get; set; } = null!;
		public string MaHoaDon { get; set; } = null!;
		public string? NoiDungPhanHoi { get; set; }
		public int? XepHang { get; set; }
		public string? PhanHoiDanhGia { get; set; }
		public string? HinhAnhDanhGia { get; set; }
	}
}