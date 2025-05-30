using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.BanAnDTO;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class BanAnManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		public BanAnManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// Lấy danh sách tất cả bàn
		[HttpGet]
		public IActionResult GetAllTables()
		{
			try
			{
				var tables = _context.Banans
					.Select(b => new BanAnDTO
					{
						MaBan = b.MaBan,
						TenBan = b.TenBan,
						ViTri = b.ViTri,
						SoGhe = b.SoChoNgoi,
						GhiChu = b.GhiChu ?? ""
					})
					.OrderBy(b => b.TenBan)
					.ToList();

				return Ok(tables);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách bàn", error = ex.Message });
			}
		}

		// Lấy bàn trống theo thời gian
		[HttpGet("available")]
		public IActionResult GetAvailableTables([FromQuery] DateTime? dateTime = null)
		{
			try
			{
				var targetDateTime = dateTime ?? DateTime.Now;

				// Lấy các bàn đang được sử dụng trong khoảng thời gian +/- 2 giờ
				var startTime = targetDateTime.AddHours(-2);
				var endTime = targetDateTime.AddHours(2);

				var occupiedTableIds = _context.Hoadonthanhtoans
					.Where(h => h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
							   (h.TrangThaiThanhToan == "Chờ xác nhận" ||
								h.TrangThaiThanhToan == "Đang chuẩn bị" ||
								h.TrangThaiThanhToan == "Đang phục vụ") &&
							   !string.IsNullOrEmpty(h.MaBanAn))
					.Select(h => h.MaBanAn)
					.ToList();

				var availableTables = _context.Banans
					.Where(b => !occupiedTableIds.Contains(b.MaBan))
					.Select(b => new
					{
						MaBan = b.MaBan,
						TenBan = b.TenBan,
						ViTri = b.ViTri,
						SoChoNgoi = b.SoChoNgoi,
						GhiChu = b.GhiChu ?? ""
					})
					.OrderBy(b => b.TenBan)
					.ToList();

				return Ok(availableTables);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách bàn trống", error = ex.Message });
			}
		}

		// Lấy thông tin bàn theo ID
		[HttpGet("{maBan}")]
		public IActionResult GetTableById(string maBan)
		{
			try
			{
				var table = _context.Banans
					.Where(b => b.MaBan == maBan)
					.Select(b => new BanAnDTO
					{
						MaBan = b.MaBan,
						TenBan = b.TenBan,
						ViTri = b.ViTri,
						SoGhe = b.SoChoNgoi,
						GhiChu = b.GhiChu ?? ""
					})
					.FirstOrDefault();

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

		private string GenerateMaBan()
		{
			int count = _context.Banans.Count() + 1;
			return $"BA{count:D3}"; // VD: BA001, BA002
		}

		[HttpPost]
		public IActionResult CreateBanAn([FromBody] BanAnDTO bananDTO)
		{
			if (bananDTO == null)
			{
				return BadRequest("Dữ liệu không hợp lệ.");
			}

			// Kiểm tra giá trị không được rỗng
			if (string.IsNullOrWhiteSpace(bananDTO.TenBan))
			{
				return BadRequest("Tên bàn không được để trống.");
			}

			if (bananDTO.SoGhe <= 0)
			{
				return BadRequest("Số ghế phải lớn hơn 0.");
			}

			// Danh sách hợp lệ cho ViTri
			var validViTriValues = new List<string> { "Tầng 1", "Tầng 2", "Tầng 3", "Ngoài trời" };
			if (!validViTriValues.Contains(bananDTO.ViTri))
			{
				return BadRequest("Giá trị 'ViTri' không hợp lệ. Chỉ chấp nhận: Tầng 1, Tầng 2, Tầng 3, Ngoài trời.");
			}

			try
			{
				// Sinh mã bàn tự động
				string newMaBan = GenerateMaBan();

				var banan = new Models.Banan
				{
					MaBan = newMaBan,
					TenBan = bananDTO.TenBan,
					ViTri = bananDTO.ViTri,
					SoChoNgoi = bananDTO.SoGhe,
					GhiChu = bananDTO.GhiChu
				};

				_context.Banans.Add(banan);
				_context.SaveChanges();

				// Trả về thông tin bàn vừa thêm
				var result = new
				{
					MaBan = banan.MaBan,
					TenBan = banan.TenBan,
					ViTri = banan.ViTri,
					SoGhe = banan.SoChoNgoi,
					GhiChu = banan.GhiChu
				};

				return CreatedAtAction(nameof(GetTableById), new { maBan = banan.MaBan }, result);
			}
			catch (Exception ex)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		[HttpPut("{id}")]
		public IActionResult UpdateBanAn(string id, [FromBody] BanAnDTO bananDTO)
		{
			if (bananDTO == null)
			{
				return BadRequest("Dữ liệu không hợp lệ.");
			}

			// Kiểm tra nếu Bàn ăn có tồn tại không
			var existingBanAn = _context.Banans.FirstOrDefault(b => b.MaBan == id);
			if (existingBanAn == null)
			{
				return NotFound("Bàn ăn không tồn tại.");
			}

			// Kiểm tra giá trị không được rỗng
			if (string.IsNullOrWhiteSpace(bananDTO.TenBan))
			{
				return BadRequest("Tên bàn không được để trống.");
			}

			if (bananDTO.SoGhe <= 0)
			{
				return BadRequest("Số ghế phải lớn hơn 0.");
			}

			// Danh sách hợp lệ cho ViTri
			var validViTriValues = new List<string> { "Tầng 1", "Tầng 2", "Tầng 3", "Ngoài trời" };
			if (!validViTriValues.Contains(bananDTO.ViTri))
			{
				return BadRequest("Giá trị 'ViTri' không hợp lệ. Chỉ chấp nhận: Tầng 1, Tầng 2, Tầng 3, Ngoài trời.");
			}

			try
			{
				// Cập nhật thông tin bàn ăn
				existingBanAn.TenBan = bananDTO.TenBan;
				existingBanAn.ViTri = bananDTO.ViTri;
				existingBanAn.SoChoNgoi = bananDTO.SoGhe;
				existingBanAn.GhiChu = bananDTO.GhiChu;

				_context.Banans.Update(existingBanAn);
				_context.SaveChanges();

				// Trả về dữ liệu bàn ăn đã cập nhật
				var result = new
				{
					MaBan = existingBanAn.MaBan,
					TenBan = existingBanAn.TenBan,
					ViTri = existingBanAn.ViTri,
					SoGhe = existingBanAn.SoChoNgoi,
					GhiChu = existingBanAn.GhiChu
				};

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
			}
		}

		// xóa bàn ăn
		[HttpDelete("{id}")]
		public IActionResult DeleteBanAn(string id)
		{
			try
			{
				var banan = _context.Banans.Find(id);
				if (banan == null)
				{
					return NotFound($"Table with id '{id}' not found.");
				}
				_context.Banans.Remove(banan);
				_context.SaveChanges();
				return NoContent();
			}
			catch (Exception ex)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
			}
		}

		[HttpGet("search")]
		public IActionResult SearchBanAn(
			[FromQuery] string? tenBan,
			[FromQuery] string? viTri)
		{
			// Danh sách hợp lệ
			var validViTri = new List<string> { "Tầng 1", "Tầng 2", "Tầng 3", "Ngoài trời" };

			// Truy vấn cơ bản
			var query = _context.Banans.AsQueryable();

			// Lọc theo tên bàn nếu có
			if (!string.IsNullOrWhiteSpace(tenBan))
			{
				string lowerTenBan = tenBan.ToLower();
				query = query.Where(b => b.TenBan.ToLower().Contains(lowerTenBan));
			}

			// Lọc theo vị trí nếu có và hợp lệ
			if (!string.IsNullOrWhiteSpace(viTri))
			{
				if (!validViTri.Contains(viTri))
				{
					return BadRequest("Vị trí không hợp lệ. Chỉ chấp nhận: Tầng 1, Tầng 2, Tầng 3, Ngoài trời.");
				}

				query = query.Where(b => b.ViTri == viTri);
			}

			// Thực thi truy vấn
			var result = query
				.Select(b => new
				{
					MaBan = b.MaBan,
					TenBan = b.TenBan,
					ViTri = b.ViTri,
					SoGhe = b.SoChoNgoi,
					GhiChu = b.GhiChu
				})
				.ToList();

			if (result.Count == 0)
			{
				return NotFound("Không tìm thấy bàn ăn phù hợp.");
			}

			return Ok(result);
		}
	}
}
