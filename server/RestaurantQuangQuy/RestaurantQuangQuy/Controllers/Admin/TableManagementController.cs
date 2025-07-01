using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class TableManagementController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public TableManagementController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// Lấy danh sách bàn trống theo thời gian
		[HttpGet("available")]
		public async Task<IActionResult> GetAvailableTables([FromQuery] DateTime? dateTime = null)
		{
			try
			{
				var checkDateTime = dateTime ?? DateTime.Now;
				var startTime = checkDateTime.AddHours(-2);
				var endTime = checkDateTime.AddHours(2);

				// Lấy danh sách bàn đang được sử dụng trong khoảng thời gian
				var occupiedTableIds = await _context.Dondatmons
					.Where(d => d.ThoiGianDat >= startTime && d.ThoiGianDat <= endTime &&
							   d.TrangThai != "Đã hủy" && d.TrangThai != "Hoàn thành")
					.Select(d => d.MaBanAn)
					.Distinct()
					.ToListAsync();

				// Lấy tất cả bàn không bị chiếm trong khoảng thời gian
				var availableTables = await _context.Banans
					.Where(b => !occupiedTableIds.Contains(b.MaBan))
					.Select(b => new
					{
						maBan = b.MaBan,
						tenBan = b.TenBan,
						viTri = b.ViTri,
						soChoNgoi = b.SoChoNgoi,
						ghiChu = b.GhiChu ?? ""
					})
					.OrderBy(b => b.tenBan)
					.ToListAsync();

				return Ok(availableTables);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách bàn trống", error = ex.Message });
			}
		}

		// Lấy tất cả bàn
		[HttpGet("all")]
		public async Task<IActionResult> GetAllTables()
		{
			try
			{
				var tables = await _context.Banans
					.Select(b => new
					{
						maBan = b.MaBan,
						tenBan = b.TenBan,
						viTri = b.ViTri,
						soChoNgoi = b.SoChoNgoi,
						ghiChu = b.GhiChu ?? ""
					})
					.OrderBy(b => b.tenBan)
					.ToListAsync();

				return Ok(tables);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách bàn", error = ex.Message });
			}
		}

		// Lấy thông tin bàn theo ID
		[HttpGet("{tableId}")]
		public async Task<IActionResult> GetTableById(string tableId)
		{
			try
			{
				var table = await _context.Banans
					.Where(b => b.MaBan == tableId)
					.Select(b => new
					{
						maBan = b.MaBan,
						tenBan = b.TenBan,
						viTri = b.ViTri,
						soChoNgoi = b.SoChoNgoi,
						ghiChu = b.GhiChu ?? ""
					})
					.FirstOrDefaultAsync();

				if (table == null)
				{
					return NotFound(new { message = "Không tìm thấy bàn" });
				}

				return Ok(table);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy thông tin bàn", error = ex.Message });
			}
		}

		// Kiểm tra bàn có trống trong khoảng thời gian không
		[HttpGet("{tableId}/availability")]
		public async Task<IActionResult> CheckTableAvailability(string tableId, [FromQuery] DateTime dateTime)
		{
			try
			{
				var startTime = dateTime.AddHours(-2);
				var endTime = dateTime.AddHours(2);

				var isOccupied = await _context.Dondatmons
					.AnyAsync(d => d.MaBanAn == tableId &&
								  d.ThoiGianDat >= startTime &&
								  d.ThoiGianDat <= endTime &&
								  d.TrangThai != "Đã hủy" &&
								  d.TrangThai != "Hoàn thành");

				return Ok(new
				{
					maBan = tableId,
					isAvailable = !isOccupied,
					checkTime = dateTime
				});
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi kiểm tra tình trạng bàn", error = ex.Message });
			}
		}

		// Lấy lịch sử sử dụng bàn
		[HttpGet("{tableId}/history")]
		public async Task<IActionResult> GetTableHistory(string tableId, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
		{
			try
			{
				var from = fromDate ?? DateTime.Now.AddDays(-30);
				var to = toDate ?? DateTime.Now;

				var history = await _context.Dondatmons
					.Where(d => d.MaBanAn == tableId && d.ThoiGianDat >= from && d.ThoiGianDat <= to)
					.Select(d => new
					{
						maDonDatMon = d.MaDatMon,
						thoiGianDat = d.ThoiGianDat,
						trangThai = d.TrangThai,
						tongTien = d.TongTien,
						ghiChu = d.GhiChu ?? ""
					})
					.OrderByDescending(d => d.thoiGianDat)
					.ToListAsync();

				return Ok(history);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy lịch sử sử dụng bàn", error = ex.Message });
			}
		}
	}
}
