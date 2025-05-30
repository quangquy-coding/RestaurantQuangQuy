using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class ReportManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public ReportManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/ReportManager/DoanhThuTheoNgay
		[HttpGet("DoanhThuTheoNgay")]
		public async Task<IActionResult> GetDoanhThuTheoNgay([FromQuery] DateOnly? tuNgay, [FromQuery] DateOnly? denNgay)
		{
			try
			{
				var startDate = tuNgay ?? DateOnly.FromDateTime(DateTime.Now.AddDays(-30));
				var endDate = denNgay ?? DateOnly.FromDateTime(DateTime.Now);

				var doanhThu = await _context.Hoadonthanhtoans
	.Where(hd => hd.ThoiGianThanhToan.HasValue &&
				hd.ThoiGianThanhToan.Value.Date >= startDate.ToDateTime(TimeOnly.MinValue).Date &&
				hd.ThoiGianThanhToan.Value.Date <= endDate.ToDateTime(TimeOnly.MinValue).Date)
	.GroupBy(hd => hd.ThoiGianThanhToan.Value.Date)
	.Select(g => new
	{
		Ngay = g.Key,
		TongDoanhThu = g.Sum(hd => hd.TongTien),
		SoHoaDon = g.Count(),
		DoanhThuTrungBinh = g.Average(hd => hd.TongTien)
	})
	.OrderBy(x => x.Ngay)
	.ToListAsync();


				var tongDoanhThu = doanhThu.Sum(x => x.TongDoanhThu);
				var tongHoaDon = doanhThu.Sum(x => x.SoHoaDon);

				return Ok(new
				{
					TuNgay = startDate,
					DenNgay = endDate,
					TongDoanhThu = tongDoanhThu,
					TongHoaDon = tongHoaDon,
					DoanhThuTrungBinhNgay = tongHoaDon > 0 ? tongDoanhThu / doanhThu.Count : 0,
					ChiTietTheoNgay = doanhThu
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// Fix for CS1061: 'DateOnly?' does not contain a definition for 'Year'
		// The issue arises because 'DateOnly?' is nullable, and you need to access the 'Year' property of the underlying 'DateOnly' value.
		// Use the null-coalescing operator or null-conditional operator to handle nullable values.

		[HttpGet("DoanhThuTheoThang")]
		public async Task<IActionResult> GetDoanhThuTheoThang([FromQuery] int? nam)
		{
			try
			{
				var year = nam ?? DateTime.Now.Year;

				// Fix: Removed 'HasValue' and 'Value' as 'DateOnly' is not nullable
				var doanhThu = await _context.Hoadonthanhtoans
				  .Where(hd => hd.ThoiGianThanhToan.HasValue &&
				hd.ThoiGianThanhToan.Value.Year == year)
	.GroupBy(hd => hd.ThoiGianThanhToan.Value.Month)
					.Select(g => new
					{
						Thang = g.Key,
						TongDoanhThu = g.Sum(hd => hd.TongTien),
						SoHoaDon = g.Count(),
						DoanhThuTrungBinh = g.Average(hd => hd.TongTien)
					})
					.OrderBy(x => x.Thang)
					.ToListAsync();

				var tongDoanhThuNam = doanhThu.Sum(x => x.TongDoanhThu);
				var tongHoaDonNam = doanhThu.Sum(x => x.SoHoaDon);

				return Ok(new
				{
					Nam = year,
					TongDoanhThuNam = tongDoanhThuNam,
					TongHoaDonNam = tongHoaDonNam,
					DoanhThuTrungBinhThang = doanhThu.Count > 0 ? tongDoanhThuNam / doanhThu.Count : 0,
					ChiTietTheoThang = doanhThu
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// Fix for CS1061: 'DateTime' does not contain a definition for 'HasValue'
		// Explanation: The error occurs because 'DateTime' is a non-nullable value type and does not have a 'HasValue' property.
		// Solution: Remove the 'HasValue' check and directly use the 'DateTime' value.

		[HttpGet("MonAnBanChay")]
		public async Task<IActionResult> GetMonAnBanChay([FromQuery] DateOnly? tuNgay, [FromQuery] DateOnly? denNgay, [FromQuery] int top = 10)
		{
			try
			{
				var startDate = tuNgay ?? DateOnly.FromDateTime(DateTime.Now.AddDays(-30));
				var endDate = denNgay ?? DateOnly.FromDateTime(DateTime.Now);

				var monAnBanChay = await _context.Chitietdondatmons
					.Include(ct => ct.MaMonNavigation)
					.Include(ct => ct.MaDatMonNavigation)
					.Where(ct => ct.MaDatMonNavigation!.ThoiGianDat >= startDate.ToDateTime(TimeOnly.MinValue) &&
								 ct.MaDatMonNavigation.ThoiGianDat <= endDate.ToDateTime(TimeOnly.MinValue))
					.GroupBy(ct => new { ct.MaMon, ct.MaMonNavigation!.TenMon })
					.Select(g => new
					{
						MaMon = g.Key.MaMon,
						TenMon = g.Key.TenMon,
						SoLuongBan = g.Sum(ct => ct.SoLuong),
						DoanhThu = g.Sum(ct => ct.TongTien ?? 0),
						SoLanDat = g.Count()
					})
					.OrderByDescending(x => x.SoLuongBan)
					.Take(top)
					.ToListAsync();

				return Ok(new
				{
					TuNgay = startDate,
					DenNgay = endDate,
					Top = top,
					MonAnBanChay = monAnBanChay
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/ReportManager/KhachHangThanThiet
		[HttpGet("KhachHangThanThiet")]
		public async Task<IActionResult> GetKhachHangThanThiet([FromQuery] int top = 10)
		{
			try
			{
				var khachHangThanThiet = await _context.Hoadonthanhtoans
					.Include(hd => hd.MaKhachHangNavigation)
					.GroupBy(hd => new { hd.MaKhachHang, hd.MaKhachHangNavigation!.TenKhachHang, hd.MaKhachHangNavigation.Email })
					.Select(g => new
					{
						MaKhachHang = g.Key.MaKhachHang,
						TenKhachHang = g.Key.TenKhachHang,
						Email = g.Key.Email,
						SoLanMua = g.Count(),
						TongTienMua = g.Sum(hd => hd.TongTien),
						TienTrungBinh = g.Average(hd => hd.TongTien),
						LanMuaCuoi = g.Max(hd => hd.ThoiGianThanhToan)
					})
					.OrderByDescending(x => x.TongTienMua)
					.Take(top)
					.ToListAsync();

				return Ok(new
				{
					Top = top,
					KhachHangThanThiet = khachHangThanThiet
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/ReportManager/ThongKeKhuyenMai
		[HttpGet("ThongKeKhuyenMai")]
		public async Task<IActionResult> GetThongKeKhuyenMai([FromQuery] DateOnly? tuNgay, [FromQuery] DateOnly? denNgay)
		{
			try
			{
				var startDate = tuNgay ?? DateOnly.FromDateTime(DateTime.Now.AddDays(-30));
				var endDate = denNgay ?? DateOnly.FromDateTime(DateTime.Now);

				var startDateTime = startDate.ToDateTime(TimeOnly.MinValue);
				var endDateTime = endDate.ToDateTime(TimeOnly.MaxValue); // lấy đến cuối ngày

				var thongKeKhuyenMai = await _context.Hoadonthanhtoans
					.Include(hd => hd.MaKhuyenMaiNavigation)
					.Where(hd => hd.ThoiGianThanhToan >= startDateTime &&
								hd.ThoiGianThanhToan <= endDateTime &&
								hd.MaKhuyenMai != null)
					.GroupBy(hd => new { hd.MaKhuyenMai, hd.MaKhuyenMaiNavigation!.TenKhuyenMai })
					.Select(g => new
					{
						MaKhuyenMai = g.Key.MaKhuyenMai,
						TenKhuyenMai = g.Key.TenKhuyenMai,
						SoLanSuDung = g.Count(),
						TongTienGiam = g.Sum(hd => hd.TienGiam ?? 0),
						TongDoanhThu = g.Sum(hd => hd.TongTien)
					})
					.OrderByDescending(x => x.SoLanSuDung)
					.ToListAsync();

				var tongTienGiam = thongKeKhuyenMai.Sum(x => x.TongTienGiam);
				var tongSuDung = thongKeKhuyenMai.Sum(x => x.SoLanSuDung);

				return Ok(new
				{
					TuNgay = startDate,
					DenNgay = endDate,
					TongTienGiam = tongTienGiam,
					TongLanSuDung = tongSuDung,
					ChiTietKhuyenMai = thongKeKhuyenMai
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}


		// GET: api/ReportManager/TongQuan
		[HttpGet("TongQuan")]
		public async Task<IActionResult> GetTongQuan()
		{
			try
			{
				var today = DateOnly.FromDateTime(DateTime.Now);
				var thisMonth = new DateOnly(today.Year, today.Month, 1);
				var lastMonth = thisMonth.AddMonths(-1);

				// Doanh thu hôm nay
				var doanhThuHomNay = await _context.Hoadonthanhtoans
					.Where(hd => hd.ThoiGianThanhToan.Value.Date == today.ToDateTime(TimeOnly.MinValue).Date)
					.SumAsync(hd => hd.TongTien);

				// Doanh thu tháng này
				var doanhThuThangNay = await _context.Hoadonthanhtoans
					.Where(hd => hd.ThoiGianThanhToan >= thisMonth.ToDateTime(TimeOnly.MinValue))
					.SumAsync(hd => hd.TongTien);

				// Doanh thu tháng trước
				var doanhThuThangTruoc = await _context.Hoadonthanhtoans
	.Where(hd => hd.ThoiGianThanhToan >= lastMonth.ToDateTime(TimeOnly.MinValue)
			  && hd.ThoiGianThanhToan < thisMonth.ToDateTime(TimeOnly.MinValue))
	.SumAsync(hd => hd.TongTien);
				// Số đơn hàng hôm nay
				var donHangHomNay = await _context.Hoadonthanhtoans
					.CountAsync(hd => hd.ThoiGianThanhToan.Value.Date == today.ToDateTime(TimeOnly.MinValue).Date);

				// Tổng khách hàng
				var tongKhachHang = await _context.Khachhangs.CountAsync();

				// Tổng món ăn
				var tongMonAn = await _context.Monans.CountAsync();

				// Đánh giá trung bình
				var danhGiaTrungBinh = await _context.Danhgia.AverageAsync(dg => (double?)dg.XepHang) ?? 0;

				// Tỷ lệ tăng trưởng
				var tyLeTangTruong = doanhThuThangTruoc > 0
					? Math.Round((double)(doanhThuThangNay - doanhThuThangTruoc) / (double)doanhThuThangTruoc * 100, 1)
					: 0;

				return Ok(new
				{
					DoanhThuHomNay = doanhThuHomNay,
					DoanhThuThangNay = doanhThuThangNay,
					DoanhThuThangTruoc = doanhThuThangTruoc,
					TyLeTangTruong = tyLeTangTruong,
					DonHangHomNay = donHangHomNay,
					TongKhachHang = tongKhachHang,
					TongMonAn = tongMonAn,
					DanhGiaTrungBinh = Math.Round(danhGiaTrungBinh, 1)
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// GET: api/ReportManager/DoanhThuTheoGio
		[HttpGet("DoanhThuTheoGio")]
		public async Task<IActionResult> GetDoanhThuTheoGio([FromQuery] DateOnly? ngay)
		{
			try
			{
				var targetDate = ngay ?? DateOnly.FromDateTime(DateTime.Now);

				var doanhThuTheoGio = await _context.Hoadonthanhtoans
					 .Where(hd => hd.ThoiGianThanhToan.HasValue &&
				hd.ThoiGianThanhToan.Value.Date == targetDate.ToDateTime(TimeOnly.MinValue).Date)
	.GroupBy(hd => hd.ThoiGianThanhToan.Value.Hour)
					.Select(g => new
					{
						Gio = g.Key,
						SoHoaDon = g.Count(),
						DoanhThu = g.Sum(hd => hd.TongTien)
					})
					.OrderBy(x => x.Gio)
					.ToListAsync();

				return Ok(new
				{
					Ngay = targetDate,
					DoanhThuTheoGio = doanhThuTheoGio
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
	}
}
