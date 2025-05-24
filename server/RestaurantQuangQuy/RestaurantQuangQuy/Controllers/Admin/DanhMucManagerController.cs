using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.DanhMucDTO;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class DanhMucManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public DanhMucManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<ActionResult<List<DanhMucDTO>>> GetAllDanhMuc()
		{
			var danhMucs = await _context.Danhmucs
				.Include(dm => dm.Monans)
				.ToListAsync();

			var result = danhMucs.Select(dm => new DanhMucDTO
			{
				MaDanhMuc = dm.MaDanhMuc,
				TenDanhMuc = dm.TenDanhMuc,
				SoLuongMonAn = dm.Monans.Count,
				MoTa = dm.MoTa,
				HinhAnh = dm.HinhAnh,
				TrangThai = dm.TinhTrang
			}).ToList();

			return Ok(result);
		}
		// POST MADANHMUC TỰ ĐỘNG KHÔNG CẦN THÊM TÌNH TRẠNG VIẾT THÊM 1 HÀM RIÊNG TRUYỀN VÀO HOẠT ĐỘNG NGỪNG HOẠT ĐỘNG 
		[HttpPost("create")]
		public async Task<IActionResult> CreateDanhMuc([FromBody] DanhMucDTO danhMucDto)
		{
			if (string.IsNullOrEmpty(danhMucDto.TenDanhMuc) || string.IsNullOrEmpty(danhMucDto.TrangThai))
			{
				return BadRequest("Thiếu thông tin bắt buộc.");
			}

			// Chỉ cho phép các trạng thái đã xác định
			var validTrangThaiOptions = new List<string> { "Hoạt động", "Không hoạt động", "Ngừng hoạt động" };
			if (!validTrangThaiOptions.Contains(danhMucDto.TrangThai))
			{
				return BadRequest("Trạng thái không hợp lệ. Chỉ chấp nhận 'Hoạt động', 'Không hoạt động' hoặc 'Ngừng hoạt động'.");
			}

			// Tạo mã danh mục mới, đảm bảo không trùng
			var lastMa = await _context.Danhmucs
				.OrderByDescending(dm => dm.MaDanhMuc)
				.Select(dm => dm.MaDanhMuc)
				.FirstOrDefaultAsync();

			int nextNumber = 1;
			if (!string.IsNullOrEmpty(lastMa) && lastMa.StartsWith("DM") && lastMa.Length >= 5)
			{
				var numberPart = lastMa.Substring(2);
				if (int.TryParse(numberPart, out int parsedNumber))
				{
					nextNumber = parsedNumber + 1;
				}
			}

			string newMaDanhMuc = $"DM{nextNumber:D3}";

			// Kiểm tra lại nếu vẫn trùng mã do concurrent insert (hiếm nhưng an toàn)
			while (await _context.Danhmucs.AnyAsync(dm => dm.MaDanhMuc == newMaDanhMuc))
			{
				nextNumber++;
				newMaDanhMuc = $"DM{nextNumber:D3}";
			}

			// Tạo đối tượng danh mục
			var danhMuc = new Danhmuc
			{
				MaDanhMuc = newMaDanhMuc,
				TenDanhMuc = danhMucDto.TenDanhMuc,
				MoTa = danhMucDto.MoTa,
				HinhAnh = danhMucDto.HinhAnh,
				TinhTrang = danhMucDto.TrangThai
			};

			_context.Danhmucs.Add(danhMuc);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetAllDanhMuc), new { id = danhMuc.MaDanhMuc }, danhMuc);
		}


		// PUT api/DanhMucManager/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateDanhMuc(string id, [FromBody] DanhMucDTO danhMucDTO)
		{
			if (id != danhMucDTO.MaDanhMuc)
			{
				return BadRequest("ID không hợp lệ.");
			}
			var danhMuc = await _context.Danhmucs.FindAsync(id);
			if (danhMuc == null)
			{
				return NotFound("Danh mục không tồn tại.");
			}
			danhMuc.TenDanhMuc = danhMucDTO.TenDanhMuc;
			danhMuc.MoTa = danhMucDTO.MoTa;
			danhMuc.HinhAnh = danhMucDTO.HinhAnh;
			danhMuc.TinhTrang = danhMucDTO.TrangThai;
			await _context.SaveChangesAsync();
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteDanhMuc(string id)
		{
			var danhMuc = await _context.Danhmucs.FindAsync(id);
			if (danhMuc == null)
			{
				return NotFound("Danh mục không tồn tại.");
			}
			_context.Danhmucs.Remove(danhMuc);
			await _context.SaveChangesAsync();
			return NoContent();
		}
		// Tìm kiếm danh mục theo tên danh mục,mô tả
		[HttpGet("TimKiem")]
		public async Task<ActionResult<List<DanhMucDTO>>> TimKiemDanhMuc(string? tenDanhMuc, string? moTa)
		{
			var query = _context.Danhmucs.AsQueryable();
			if (!string.IsNullOrEmpty(tenDanhMuc))
			{
				query = query.Where(dm => dm.TenDanhMuc.Contains(tenDanhMuc));
			}
			if (!string.IsNullOrEmpty(moTa))
			{
				query = query.Where(dm => dm.MoTa.Contains(moTa));
			}
			var danhMucs = await query
				.Include(dm => dm.Monans)
				.ToListAsync();
			var result = danhMucs.Select(dm => new DanhMucDTO
			{
				MaDanhMuc = dm.MaDanhMuc,
				TenDanhMuc = dm.TenDanhMuc,
				SoLuongMonAn = dm.Monans.Count,
				MoTa = dm.MoTa,
				HinhAnh = dm.HinhAnh,
				TrangThai = dm.TinhTrang
			}).ToList();
			return Ok(result);
		}
		// Lọc theo tình trạng
		[HttpGet("Loc")]
		public async Task<ActionResult<List<DanhMucDTO>>> LocDanhMuc(string? trangThai)
		{
			var query = _context.Danhmucs.AsQueryable();
			if (!string.IsNullOrEmpty(trangThai))
			{
				query = query.Where(dm => dm.TinhTrang == trangThai);
			}
			var danhMucs = await query
				.Include(dm => dm.Monans)
				.ToListAsync();
			var result = danhMucs.Select(dm => new DanhMucDTO
			{
				MaDanhMuc = dm.MaDanhMuc,
				TenDanhMuc = dm.TenDanhMuc,
				SoLuongMonAn = dm.Monans.Count,
				MoTa = dm.MoTa,
				HinhAnh = dm.HinhAnh,
				TrangThai = dm.TinhTrang
			}).ToList();
			return Ok(result);
		}
		[HttpGet("TinhTrang")]
		public IActionResult GetTinhTrang()
		{
			var tinhTrangList = new List<string>
		{
			"Hoạt động",
			"Ngừng hoạt động"
		};

			return Ok(tinhTrangList);
		}
	}
}
