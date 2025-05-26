using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.MonAnDTO;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class MonAnManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public MonAnManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/MonAn
		[HttpGet]
		public async Task<List<MonAnDTO>> GetAllMonAnAsync()
		{
			var monans = await _context.Monans
				.Include(m => m.MaDanhMucNavigation)
				.ToListAsync();

			var result = monans.Select(m => new MonAnDTO
			{
				MaMon = m.MaMon,  // Thêm MaMon để hiển thị khi lấy danh sách món ăn
				TenMon = m.TenMon,
				MoTa = m.MoTa,
				Gia = m.Gia,
				HinhAnh = m.HinhAnh,
				ThoiGianMon = m.ThoiGianMon,
				ThanhPhan = m.ThanhPhan,
				DinhDuong = m.DinhDuong,
				DiUng = m.DiUng,


				TinhTrang = m.TinhTrang,
				MaDanhMuc = m.MaDanhMuc ?? "",
				TenDanhMuc = m.MaDanhMucNavigation?.TenDanhMuc ?? ""
			}).ToList();

			return result;
		}

		// GET: api/MonAnManager/DanhMuc
		[HttpGet("DanhMuc")]
		public async Task<IActionResult> GetDanhMuc()
		{
			var danhMucs = await _context.Danhmucs
				.Select(dm => new
				{
					MaDanhMuc = dm.MaDanhMuc,
					TenDanhMuc = dm.TenDanhMuc
				})
				.ToListAsync();

			return Ok(danhMucs);
		}

		// GET: api/MonAnManager/TinhTrang
		[HttpGet("TinhTrang")]
		public IActionResult GetTinhTrang()
		{
			var tinhTrangList = new List<string>
	{
		"Còn hàng",
		"Món đặc biệt",
		"Món mới",
		"Hết hàng"
	};

			return Ok(tinhTrangList);
		}


		//POST: api/MonAn
		[HttpPost]
		public async Task<IActionResult> ThemMonAn(MonAnDTO monAnDto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				// Tìm mã món ăn lớn nhất hiện tại
				var lastMonAn = await _context.Monans
					.OrderByDescending(m => m.MaMon)
					.FirstOrDefaultAsync();

				// Tạo mã món ăn mới
				string newMaMon;
				if (lastMonAn == null)
				{
					newMaMon = "MA001";
				}
				else
				{
					string lastCode = lastMonAn.MaMon.Substring(2); // Bỏ "MA"
					int nextNumber = int.Parse(lastCode) + 1;
					newMaMon = "MA" + nextNumber.ToString("D3"); // Định dạng 3 chữ số, ví dụ: 005
				}

				// Kiểm tra mã món ăn không phải null
				if (string.IsNullOrEmpty(newMaMon))
				{
					return BadRequest("Mã món ăn không hợp lệ.");
				}

				// Tạo món ăn mới từ DTO
				var monAn = new Monan
				{
					MaMon = newMaMon,  // Server tự tạo mã món ăn mới
					TenMon = monAnDto.TenMon,
					MoTa = monAnDto.MoTa,
					Gia = monAnDto.Gia,
					HinhAnh = monAnDto.HinhAnh,
					ThoiGianMon = monAnDto.ThoiGianMon,
					ThanhPhan = monAnDto.ThanhPhan,
					DinhDuong = monAnDto.DinhDuong,
					DiUng = monAnDto.DiUng,
					TinhTrang = monAnDto.TinhTrang,
					MaDanhMuc = monAnDto.MaDanhMuc
				};

				// Thêm món ăn mới vào cơ sở dữ liệu
				_context.Monans.Add(monAn);

				// Cập nhật số lượng món ăn trong danh mục
				var danhMuc = await _context.Danhmucs
					.SingleOrDefaultAsync(dm => dm.MaDanhMuc == monAnDto.MaDanhMuc);

				if (danhMuc != null)
				{
					danhMuc.SoLuongMonAn += 1;
					_context.Danhmucs.Update(danhMuc);
				}
				else
				{
					return BadRequest("Danh mục không tồn tại.");
				}

				// Lưu thay đổi vào cơ sở dữ liệu
				await _context.SaveChangesAsync();
				return Ok(new { Message = "Thêm món ăn thành công.", MaMon = newMaMon }); // Trả về mã món ăn mới
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
		// PUT: api/MonAnManager
		[HttpPut]
		public async Task<IActionResult> SuaMonAn(MonAnDTO monAnDto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);
			try
			{
				var monAn = await _context.Monans
					.Include(m => m.MaDanhMucNavigation)
					.SingleOrDefaultAsync(m => m.MaMon == monAnDto.MaMon);
				if (monAn == null)
					return NotFound("Món ăn không tồn tại.");
				// Cập nhật thông tin món ăn
				monAn.TenMon = monAnDto.TenMon;
				monAn.MoTa = monAnDto.MoTa;
				monAn.Gia = monAnDto.Gia;
				monAn.HinhAnh = monAnDto.HinhAnh;
				monAn.ThoiGianMon = monAnDto.ThoiGianMon;
				monAn.ThanhPhan = monAnDto.ThanhPhan;
				monAn.DinhDuong = monAnDto.DinhDuong;
				monAn.DiUng = monAnDto.DiUng;

				monAn.TinhTrang = monAnDto.TinhTrang;
				monAn.MaDanhMuc = monAnDto.MaDanhMuc;

				// Cập nhật số lượng món ăn trong danh mục
				var danhMucCu = await _context.Danhmucs
					.SingleOrDefaultAsync(dm => dm.MaDanhMuc == monAn.MaDanhMuc);
				if (danhMucCu != null)
				{
					danhMucCu.SoLuongMonAn -= 1; // Giảm số lượng món ăn cũ
					_context.Danhmucs.Update(danhMucCu);
				}
				var danhMucMoi = await _context.Danhmucs
					.SingleOrDefaultAsync(dm => dm.MaDanhMuc == monAnDto.MaDanhMuc);
				if (danhMucMoi != null)
				{
					danhMucMoi.SoLuongMonAn += 1; // Tăng số lượng món ăn mới
					_context.Danhmucs.Update(danhMucMoi);
				}
				else
				{
					return BadRequest("Danh mục không tồn tại.");
				}
				await _context.SaveChangesAsync();
				return Ok(new { Message = "Cập nhật món ăn thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
		// DELETE: api/MonAnManager
		[HttpDelete("{id}")]
		public async Task<IActionResult> XoaMonAn(string id)
		{
			try
			{
				var monAn = await _context.Monans
					.Include(m => m.MaDanhMucNavigation)
					.SingleOrDefaultAsync(m => m.MaMon == id);
				if (monAn == null)
					return NotFound("Món ăn không tồn tại.");
				// Cập nhật số lượng món ăn trong danh mục
				if (monAn.MaDanhMuc != null)
				{
					var danhMuc = await _context.Danhmucs
						.SingleOrDefaultAsync(dm => dm.MaDanhMuc == monAn.MaDanhMuc);
					if (danhMuc != null)
					{
						danhMuc.SoLuongMonAn -= 1;
						_context.Danhmucs.Update(danhMuc);
					}
				}
				// Xóa món ăn
				_context.Monans.Remove(monAn);
				await _context.SaveChangesAsync();
				return Ok(new { Message = "Xóa món ăn thành công." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
			}
		}
		// Tìm kiếm tất cả món ăn
		[HttpGet("TimKiem")]
		public async Task<List<MonAnDTO>> TimKiemMonAn(string? tenMon, string? maDanhMuc, string? tinhTrang)
		{
			var query = _context.Monans.AsQueryable();
			if (!string.IsNullOrEmpty(tenMon))
			{
				query = query.Where(m => m.TenMon.Contains(tenMon));
			}
			if (!string.IsNullOrEmpty(maDanhMuc))
			{
				query = query.Where(m => m.MaDanhMuc == maDanhMuc);
			}
			if (!string.IsNullOrEmpty(tinhTrang))
			{
				query = query.Where(m => m.TinhTrang == tinhTrang);
			}
			var monans = await query
				.Include(m => m.MaDanhMucNavigation)
				.ToListAsync();
			var result = monans.Select(m => new MonAnDTO
			{
				MaMon = m.MaMon,
				TenMon = m.TenMon,
				MoTa = m.MoTa,
				Gia = m.Gia,
				HinhAnh = m.HinhAnh,
				ThoiGianMon = m.ThoiGianMon,
				ThanhPhan = m.ThanhPhan,
				DinhDuong = m.DinhDuong,
				DiUng = m.DiUng,
				TinhTrang = m.TinhTrang,
				MaDanhMuc = m.MaDanhMuc ?? "",
				TenDanhMuc = m.MaDanhMucNavigation?.TenDanhMuc ?? ""
			}).ToList();
			return result;
		}
		// Lọc theo tên danh mục
		[HttpGet("LocTheoDanhMuc")]
		public async Task<List<MonAnDTO>> LocTheoDanhMuc(string maDanhMuc)
		{
			var monans = await _context.Monans
				.Include(m => m.MaDanhMucNavigation)
				.Where(m => m.MaDanhMuc == maDanhMuc)
				.ToListAsync();
			var result = monans.Select(m => new MonAnDTO
			{
				MaMon = m.MaMon,
				TenMon = m.TenMon,
				MoTa = m.MoTa,
				Gia = m.Gia,
				HinhAnh = m.HinhAnh,
				ThoiGianMon = m.ThoiGianMon,
				ThanhPhan = m.ThanhPhan,
				DinhDuong = m.DinhDuong,
				DiUng = m.DiUng,

				TinhTrang = m.TinhTrang,
				MaDanhMuc = m.MaDanhMuc ?? "",
				TenDanhMuc = m.MaDanhMucNavigation?.TenDanhMuc ?? ""
			}).ToList();
			return result;
		}
		// Xem chi tiết món ăn
		[HttpGet("ChiTiet/{id}")]
		public async Task<IActionResult> ChiTietMonAn(string id)
		{
			var monAn = await _context.Monans
				.Include(m => m.MaDanhMucNavigation)
				.SingleOrDefaultAsync(m => m.MaMon == id);
			if (monAn == null)
				return NotFound("Món ăn không tồn tại.");
			var result = new MonAnDTO
			{
				MaMon = monAn.MaMon,
				TenMon = monAn.TenMon,
				MoTa = monAn.MoTa,
				Gia = monAn.Gia,
				HinhAnh = monAn.HinhAnh,
				ThoiGianMon = monAn.ThoiGianMon,
				ThanhPhan = monAn.ThanhPhan,
				DinhDuong = monAn.DinhDuong,
				DiUng = monAn.DiUng,
				TinhTrang = monAn.TinhTrang,
				MaDanhMuc = monAn.MaDanhMuc ?? "",
				TenDanhMuc = monAn.MaDanhMucNavigation?.TenDanhMuc ?? ""
			};
			return Ok(result);
		}


		// get ra 4 món ăn nổi bật
		[HttpGet("NoiBat")]
		public async Task<List<MonAnDTO>> GetNoiBat()
		{
			var monans = await _context.Monans
				.Include(m => m.MaDanhMucNavigation)
				.Where(m => m.TinhTrang == "Món đặc biệt")
				.Take(6) // Lấy 4 món ăn nổi bật
				.ToListAsync();
			var result = monans.Select(m => new MonAnDTO
			{
				MaMon = m.MaMon,
				TenMon = m.TenMon,
				MoTa = m.MoTa,
				Gia = m.Gia,
				HinhAnh = m.HinhAnh,
				ThoiGianMon = m.ThoiGianMon,
				ThanhPhan = m.ThanhPhan,
				DinhDuong = m.DinhDuong,
				DiUng = m.DiUng,
				TinhTrang = m.TinhTrang,
				MaDanhMuc = m.MaDanhMuc ?? "",
				TenDanhMuc = m.MaDanhMucNavigation?.TenDanhMuc ?? ""
			}).ToList();
			return result;
		}

	}
}
