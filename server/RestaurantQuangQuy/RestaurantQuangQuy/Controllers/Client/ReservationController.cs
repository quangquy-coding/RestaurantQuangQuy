using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.BanAnDTO;
using RestaurantQuangQuy.DTO.DatBanDTO;
using RestaurantQuangQuy.DTO.Reservation;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Client
{
	[Route("api/[controller]")]
	[ApiController]
	public class ReservationController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public ReservationController(RestaurantManagementContext context)
		{
			_context = context;
		}

		[HttpGet("GetAll")]
		public IActionResult GetDatBan()
		{
			try
			{
				// Lấy tất cả các bản ghi Datban và include liên kết tới bảng trung gian DatBanBanAn để lấy thông tin các Banan
				var datBanList = _context.Datbans
					.Include(d => d.DatBanBanAns)
					.ThenInclude(dbba => dbba.Banans)
					.ToList();

				// Kiểm tra nếu không có dữ liệu
				if (datBanList == null || !datBanList.Any())
				{
					return NotFound("No DatBan records found.");
				}

				// Ánh xạ sang DTO
				var datBanDTOs = datBanList.Select(db => new DatBanDTO
				{
					MaBanAn = db.MaBanAn,
					MaKhachHang = db.MaKhachHang,
					SoLuongKhach = db.SoLuongKhach,
					ThoiGianDat = db.ThoiGianDat,
					ThoiGianDen = db.ThoiGianDen,
					TrangThai = db.TrangThai,
					GhiChu = db.GhiChu,

					// Lấy thông tin các bàn ăn
					Banans = db.DatBanBanAns.Select(b => new BanAnDTO
					{
						MaBan = b.Banans.MaBan,
						TenBan = b.Banans.TenBan,
						ViTri = b.Banans.ViTri,
						TrangThai = b.Banans.TrangThai,
						SoGhe = b.Banans.SoChoNgoi,
						GhiChu = b.Banans.GhiChu ?? ""
					}).ToList()
				}).ToList();

				return Ok(datBanDTOs);
			}
			catch (Exception ex)
			{
				// Ghi log lỗi nếu cần thiết
				Console.WriteLine(ex.Message);
				return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
			}
		}

		// đặt bàn không chọn bàn lấy từ ReservationDTO mã bàn ăn tạo tự động MA + D3, maKhachHang lấy từ tên khách hàng ra tên luôn,trạng thái thì đã đặt

		[HttpGet("{id}")]
		public IActionResult GetDatBan(string id)
		{
			try
			{
				var datBan = _context.Datbans
					.Where(db => db.MaBanAn == id)
					.Select(db => new
					{
						db.MaBanAn,
						db.MaKhachHang,
						db.SoLuongKhach,
						db.ThoiGianDat,
						db.ThoiGianDen,
						db.TrangThai,
						db.GhiChu,
						MaBans = db.DatBanBanAns.Select(x => x.MaBanAn).ToList() // Lấy danh sách mã bàn
					})
					.FirstOrDefault();

				if (datBan == null)
				{
					return NotFound("Không tìm thấy thông tin đặt bàn.");
				}

				return Ok(datBan);
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.Message);
				return StatusCode(500, "Lỗi server nội bộ.");
			}
		}



		[HttpPost("Create")]
		public IActionResult CreateDatBan([FromBody] DatBanCreateDTO datBanDTO)
		{
			try
			{
				if (datBanDTO == null)
					return BadRequest("Invalid DatBan data.");

				var maDatBan = "DB" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

				var existingKhachHang = _context.Khachhangs.FirstOrDefault(kh => kh.MaKhachHang == datBanDTO.MaKhachHang);
				if (existingKhachHang == null)
					return NotFound("MaKhachHang not found.");

				if (datBanDTO.ThoiGianDen <= DateTime.Now)
					return BadRequest("ThoiGianDen must be in the future.");

				if (datBanDTO.ThoiGianDen <= datBanDTO.ThoiGianDat)
					return BadRequest("ThoiGianDen must be after ThoiGianDat.");

				var datBan = new Datban
				{
					MaBanAn = maDatBan,
					MaKhachHang = datBanDTO.MaKhachHang,
					SoLuongKhach = datBanDTO.SoLuongKhach,
					ThoiGianDat = datBanDTO.ThoiGianDat,
					ThoiGianDen = datBanDTO.ThoiGianDen,
					TrangThai = datBanDTO.TrangThai,
					GhiChu = datBanDTO.GhiChu
				};

				_context.Datbans.Add(datBan);

				// Nếu MaBans null hoặc rỗng thì không làm gì
				if (datBanDTO.MaBans != null && datBanDTO.MaBans.Any())
				{
					var validMaBans = datBanDTO.MaBans.Where(mb => !string.IsNullOrWhiteSpace(mb)).ToList();

					foreach (var maBan in validMaBans)
					{
						var existingBan = _context.Banans.FirstOrDefault(b => b.MaBan == maBan);
						if (existingBan == null)
						{
							return NotFound($"MaBan '{maBan}' not found.");
						}

						var datBanBanAn = new DatBanBanAn
						{
							MaDatBan = maDatBan,
							MaBanAn = maBan
						};
						_context.DatBanBanAns.Add(datBanBanAn);
					}
				}
				// Nếu rỗng hoặc null => không gán bàn nào, đặt bàn chỉ tạo đơn thuần.



				_context.SaveChanges();
				return CreatedAtAction(nameof(GetDatBan), new { id = datBan.MaBanAn }, datBan);
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.Message);
				return StatusCode(500, "Internal server error");
			}
		}

	}


}
