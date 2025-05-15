using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantQuangQuy.DTO.BanAnDTO;
using RestaurantQuangQuy.Migrations;
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
		//  lấy danh sách bàn ăn mapping ở DTO
		
		[HttpGet]
		public IActionResult GetAllBanAn()
		{
			try
			{
				var banans = _context.Banans
					.Select(b => new BanAnDTO
					{
						MaBan = b.MaBan,
						TenBan = b.TenBan,
						ViTri = b.ViTri,
						SoGhe = b.SoChoNgoi,
						TrangThai = b.TrangThai,
						GhiChu = b.GhiChu ?? ""
					}).ToList();

				if (!banans.Any())
				{
					return NotFound("No tables found.");
				}

				return Ok(banans); // ✅ Trả về DTO
			}
			catch (Exception ex)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
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

			// Danh sách hợp lệ cho TrangThai
			var validTrangThaiValues = new List<string> { "Trống", "Đã đặt", "Đang phục vu "};
			if (!validTrangThaiValues.Contains(bananDTO.TrangThai))
			{
				return BadRequest("Giá trị 'TrangThai' không hợp lệ. Chỉ chấp nhận: Trống, Đã đặt, Đang sử dụng.");
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
					TrangThai = bananDTO.TrangThai,
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
					TrangThai = banan.TrangThai,
					GhiChu = banan.GhiChu
				};

				return CreatedAtAction(nameof(GetBanAnByIdOrName), new { id = banan.MaBan }, result);
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

			// Danh sách hợp lệ cho TrangThai
			var validTrangThaiValues = new List<string> { "Trống", "Đã đặt", "Đang sử dụng" };
			if (!validTrangThaiValues.Contains(bananDTO.TrangThai))
			{
				return BadRequest("Giá trị 'TrangThai' không hợp lệ. Chỉ chấp nhận: Trống, Đã đặt, Đang sử dụng.");
			}

			try
			{
				// Cập nhật thông tin bàn ăn
				existingBanAn.TenBan = bananDTO.TenBan;
				existingBanAn.ViTri = bananDTO.ViTri;
				existingBanAn.SoChoNgoi = bananDTO.SoGhe;
				existingBanAn.TrangThai = bananDTO.TrangThai;
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
					TrangThai = existingBanAn.TrangThai,
					GhiChu = existingBanAn.GhiChu
				};

				return Ok(result);  // Trả về kết quả sau khi cập nhật
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
		// tìm bàn ăn theo id hoặc tên
		[HttpGet("{id}")]
		public IActionResult GetBanAnByIdOrName(string id)
		{
			try
			{
				var banan = _context.Banans.FirstOrDefault(c => c.MaBan == id || c.TenBan == id);
				if (banan == null)
				{
					return NotFound($"Table with id or name '{id}' not found.");
				}
				return Ok(banan);
			}
			catch (Exception ex)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
			}
		}

		[HttpGet("search")]
		public IActionResult SearchBanAn(
	[FromQuery] string? tenBan,
	[FromQuery] string? viTri,
	[FromQuery] string? trangThai)
		{
			// Danh sách hợp lệ
			var validViTri = new List<string> { "Tầng 1", "Tầng 2", "Tầng 3", "Ngoài trời" };
			var validTrangThai = new List<string> { "Trống", "Đã đặt", "Đang sử dụng" };

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

			// Lọc theo trạng thái nếu có và hợp lệ
			if (!string.IsNullOrWhiteSpace(trangThai))
			{
				if (!validTrangThai.Contains(trangThai))
				{
					return BadRequest("Trạng thái không hợp lệ. Chỉ chấp nhận: Trống, Đã đặt, Đang sử dụng.");
				}

				query = query.Where(b => b.TrangThai == trangThai);
			}

			// Thực thi truy vấn
			var result = query
				.Select(b => new
				{
					MaBan = b.MaBan,
					TenBan = b.TenBan,
					ViTri = b.ViTri,
					TrangThai = b.TrangThai,
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
