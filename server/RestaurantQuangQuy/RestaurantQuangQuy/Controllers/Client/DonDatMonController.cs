using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.DatMonAnDTO;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Client
{
	[Route("api/[controller]")]
	[ApiController]
	public class DonDatMonController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		public DonDatMonController(RestaurantManagementContext context)
		{
			_context = context;
		}
		[HttpPost("dat-mon")]
		public async Task<IActionResult> DatMon([FromBody] DonDatMonDto dto)
		{
			if (dto == null || dto.ChiTietMon == null || !dto.ChiTietMon.Any())
				return BadRequest("Dữ liệu đặt món không hợp lệ.");

			var maDatMon = "DDM" + DateTime.Now.Ticks;

			var donDatMon = new Dondatmon
			{
				MaDatMon = maDatMon,
				MaKhachHang = dto.MaKhachHang,
				ThoiGianDat = DateTime.Now,
				TrangThai = "Chờ xử lý",
				GhiChu = dto.GhiChu,
				SoLuong = dto.ChiTietMon.Sum(x => x.SoLuong),
			};

			decimal tongTien = 0;

			foreach (var item in dto.ChiTietMon)
			{
				var mon = await _context.Monans.FindAsync(item.MaMon);
				if (mon == null) return NotFound($"Không tìm thấy món {item.MaMon}");

				var chiTiet = new Chitietdondatmon
				{
					MaDatMon = maDatMon,
					MaMon = item.MaMon,
					SoLuong = item.SoLuong,
					Gia = mon.Gia,
					TongTien = mon.Gia * item.SoLuong
				};

				tongTien += chiTiet.TongTien ?? 0;
				donDatMon.Chitietdondatmons.Add(chiTiet);
			}

			donDatMon.TongTien = tongTien;

			_context.Dondatmons.Add(donDatMon);
			await _context.SaveChangesAsync();

			return Ok(new { message = "Đặt món thành công!", maDatMon });
		}
		[HttpGet("tat-ca-don-dat-mon")]
		public async Task<IActionResult> GetTatCaDonDatMon()
		{
			var donDatMons = await _context.Dondatmons
				.Include(d => d.Chitietdondatmons)
					.ThenInclude(ct => ct.MaMonNavigation)
				.Include(d => d.MaKhachHangNavigation)
				.OrderByDescending(d => d.ThoiGianDat)
				.ToListAsync();

			var result = donDatMons.Select(d => new
			{
				d.MaDatMon,
				d.MaKhachHang,
				TenKhachHang = d.MaKhachHangNavigation?.TenKhachHang,
				d.ThoiGianDat,
				d.TrangThai,
				d.TongTien,
				d.GhiChu,
				ChiTiet = d.Chitietdondatmons.Select(ct => new
				{
					ct.MaMon,
					TenMon = ct.MaMonNavigation?.TenMon,
					ct.SoLuong,
					ct.Gia,
					ct.TongTien
				})
			});

			return Ok(result);
		}

		[HttpGet("lich-su/{maKhachHang}")]
		public async Task<IActionResult> GetDonDatMonTheoKhachHang(string maKhachHang)
		{
			var donDatMons = await _context.Dondatmons
				.Where(d => d.MaKhachHang == maKhachHang)
				.Include(d => d.Chitietdondatmons)
					.ThenInclude(ct => ct.MaMonNavigation)
				.OrderByDescending(d => d.ThoiGianDat)
				.ToListAsync();

			var result = donDatMons.Select(d => new
			{
				d.MaDatMon,
				d.ThoiGianDat,
				d.TrangThai,
				d.TongTien,
				d.GhiChu,
				ChiTiet = d.Chitietdondatmons.Select(ct => new
				{
					ct.MaMon,
					TenMon = ct.MaMonNavigation?.TenMon,
					ct.SoLuong,
					ct.Gia,
					ct.TongTien
				})
			});

			return Ok(result);
		}
		[HttpGet("chi-tiet/{maDatMon}")]
		public async Task<IActionResult> GetChiTietDonDatMon(string maDatMon)
		{
			var donDatMon = await _context.Dondatmons
				.Where(d => d.MaDatMon == maDatMon)
				.Include(d => d.Chitietdondatmons)
					.ThenInclude(ct => ct.MaMonNavigation)
				.Include(d => d.MaKhachHangNavigation)
				.Include(d => d.MaBanAnNavigation) // ✅ thêm bàn ăn
				.FirstOrDefaultAsync();

			if (donDatMon == null)
			{
				return NotFound(new { message = "Không tìm thấy đơn đặt món" });
			}

			var result = new
			{
				donDatMon.MaDatMon,
				donDatMon.ThoiGianDat,
				donDatMon.TrangThai,
				donDatMon.TongTien,
				donDatMon.GhiChu,
				MaKhachHang = donDatMon.MaKhachHang,
				TenKhachHang = donDatMon.MaKhachHangNavigation?.TenKhachHang,
				Email = donDatMon.MaKhachHangNavigation?.Email,
				SoDienThoai = donDatMon.MaKhachHangNavigation?.SoDienThoai,
				DiaChi = donDatMon.MaKhachHangNavigation?.DiaChi,

				// ✅ bàn ăn
				MaBan = donDatMon.MaBan,
				TenBan = donDatMon.MaBanNavigation?.TenBan,
				ViTri = donDatMon.MaBanNavigation?.ViTri,

				ChiTietMon = donDatMon.Chitietdondatmons.Select(ct => new
				{
					ct.MaMon,
					TenMon = ct.MaMonNavigation?.TenMon,
					ct.SoLuong,
					ct.Gia,
					ct.TongTien,
					HinhAnh = ct.MaMonNavigation?.HinhAnh
				})
			};

			return Ok(result);
		}


	}
}
