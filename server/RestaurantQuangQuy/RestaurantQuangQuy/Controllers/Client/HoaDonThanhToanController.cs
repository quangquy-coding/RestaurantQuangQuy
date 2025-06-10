using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.HoaDonDTO;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.Services;

namespace RestaurantQuangQuy.Controllers.Client
{
	[Route("api/[controller]")]
	[ApiController]
	public class HoaDonThanhToanController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		private readonly IEmailService _emailService;

		public HoaDonThanhToanController(RestaurantManagementContext context, IEmailService emailService)
		{
			_context = context;
			_emailService = emailService;
		}

		[HttpGet]
		public IActionResult GetAllHoaDon()
		{
			try
			{
				var hoadon = _context.Hoadonthanhtoans
					.Select(h => new
					{
						h.MaHoaDon,
						h.MaDatMon,
						h.MaBanAn,
						h.MaKhachHang,
						h.ThoiGianDat,
						h.ThoiGianThanhToan,
						h.MaKhuyenMai,
						h.SoTienConLai,
						h.TienGiam,
						h.SoTienCoc,
						h.TongTien,
						h.PhuongThucThanhToan,
						h.TrangThaiThanhToan,
						h.MaNhanVien,
						h.GhiChu
					})
					.ToList();

				if (hoadon == null || hoadon.Count == 0)
				{
					return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
				}

				return Ok(new { message = "Lấy danh sách hóa đơn thành công", data = hoadon });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách hóa đơn", error = ex.Message });
			}
		}

		[HttpGet("{id}")]
		public IActionResult GetHoaDonById(string id)
		{
			try
			{
				var hoadon = _context.Hoadonthanhtoans
					.Where(h => h.MaHoaDon == id)
					.Select(h => new
					{
						h.MaHoaDon,
						h.MaDatMon,
						h.MaBanAn,
						h.MaKhachHang,
						h.ThoiGianDat,
						h.ThoiGianThanhToan,
						h.MaKhuyenMai,
						h.TongTien,
						h.SoTienCoc,
						h.SoTienConLai,
						h.TienGiam,
						h.PhuongThucThanhToan,
						h.TrangThaiThanhToan,
						h.MaNhanVien,
						h.GhiChu
					})
					.FirstOrDefault();

				if (hoadon == null)
				{
					return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
				}

				return Ok(new { message = "Lấy hóa đơn thành công", data = hoadon });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy hóa đơn", error = ex.Message });
			}
		}

		[HttpPost("CreateHoaDon")]
		public async Task<IActionResult> CreateHoaDonAsync([FromBody] HoaDonCreateDTO hoadondto)
		{
			try
			{
				if (hoadondto == null)
				{
					return BadRequest(new { message = "Dữ liệu hóa đơn không hợp lệ" });
				}

				decimal tongTien = (decimal)hoadondto.TongTien;
				decimal tienGiam = 0;

				if (!string.IsNullOrEmpty(hoadondto.MaKhuyenMai))
				{
					var khuyenMai = await _context.Khuyenmais
						.FirstOrDefaultAsync(km => km.MaKhuyenMai == hoadondto.MaKhuyenMai);

					if (khuyenMai != null && khuyenMai.TrangThai == "Hoạt động")
					{
						var today = DateOnly.FromDateTime(DateTime.Now);
						if (khuyenMai.NgayBatDau <= today && khuyenMai.NgayKetThuc >= today)
						{
							if (tongTien >= khuyenMai.MucTienToiThieu)
							{
								tienGiam = tongTien * (khuyenMai.TyLeGiamGia ?? 0) / 100;
							}
						}
					}
				}

				decimal tongTienSauGiam = tongTien - tienGiam;
				decimal soTienCoc = (decimal)(hoadondto.SoTienCoc > 0 ? hoadondto.SoTienCoc : tongTienSauGiam * 0.3m);
				decimal soTienConLai = tongTienSauGiam - soTienCoc;

				if (hoadondto.PhuongThucThanhToan == "VNPay")
				{
					if (soTienCoc < 5000)
					{
						return BadRequest(new { message = "Số tiền cọc phải từ 5,000 VNĐ trở lên để thanh toán qua VNPay" });
					}

					if (soTienCoc >= 1000000000)
					{
						return BadRequest(new { message = "Số tiền cọc phải dưới 1 tỷ VNĐ" });
					}
				}

				string mahoadon = "HDTT" + Guid.NewGuid().ToString().Substring(0, 6);

				var hoadon = new Hoadonthanhtoan
				{
					MaHoaDon = mahoadon,
					MaDatMon = hoadondto.MaDatMon,
					MaBanAn = hoadondto.MaBanAn,
					MaKhachHang = hoadondto.MaKhachHang,
					ThoiGianDat = DateTime.Now,
					ThoiGianThanhToan = DateTime.Now,
					MaKhuyenMai = hoadondto.MaKhuyenMai,
					TongTien = tongTien,
					TienGiam = tienGiam,
					SoTienCoc = soTienCoc,
					SoTienConLai = soTienConLai,
					PhuongThucThanhToan = hoadondto.PhuongThucThanhToan,
					TrangThaiThanhToan = hoadondto.TrangThaiThanhToan,
					MaNhanVien = hoadondto.MaNhanVien,
					GhiChu = hoadondto.GhiChu
				};

				_context.Hoadonthanhtoans.Add(hoadon);
				await _context.SaveChangesAsync();

				try
				{
					var khachHang = await _context.Khachhangs.FirstOrDefaultAsync(kh => kh.MaKhachHang == hoadondto.MaKhachHang);
					string toEmail = khachHang?.Email ?? "default@email.com";
					string subject = "💰 Xác nhận thanh toán thành công - Nhà Hàng Quang Quý";

					string body = $@"
        <div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>
            <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;'>
                <div style='background-color: #388e3c; color: white; padding: 16px; text-align: center;'>
                    <h2 style='margin: 0;'>Thanh toán thành công</h2>
                </div>
                <div style='padding: 24px;'>
                    <p>Xin chào <strong>{khachHang?.TenKhachHang ?? "Quý khách"}</strong>,</p>
                    <p>Chúng tôi xin xác nhận rằng bạn đã thanh toán thành công tại <strong>Nhà Hàng Quang Quý</strong>.</p>
                    <table style='width: 100%; margin-top: 16px; border-collapse: collapse;'>
                        <tr>
                            <td style='padding: 8px; font-weight: bold;'>🧾 Mã hóa đơn:</td>
                            <td style='padding: 8px;'>{mahoadon}</td>
                        </tr>
                        <tr style='background-color: #f9f9f9;'>
                            <td style='padding: 8px; font-weight: bold;'>💳 Phương thức:</td>
                            <td style='padding: 8px;'>{hoadondto.PhuongThucThanhToan}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; font-weight: bold;'>💸 Tổng tiền:</td>
                            <td style='padding: 8px;'>{tongTien:N0} VNĐ</td>
                        </tr>
                        {(tienGiam > 0 ? $@"
                        <tr style='background-color: #f9f9f9;'>
                            <td style='padding: 8px; font-weight: bold;'>🎁 Tiền giảm:</td>
                            <td style='padding: 8px;'>{tienGiam:N0} VNĐ</td>
                        </tr>" : "")}
                        <tr>
                            <td style='padding: 8px; font-weight: bold;'>💰 Tiền cọc:</td>
                            <td style='padding: 8px;'>{soTienCoc:N0} VNĐ</td>
                        </tr>
                        <tr style='background-color: #f9f9f9;'>
                            <td style='padding: 8px; font-weight: bold;'>💵 Tiền còn lại:</td>
                            <td style='padding: 8px;'>{soTienConLai:N0} VNĐ</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; font-weight: bold;'>📅 Ngày thanh toán:</td>
                            <td style='padding: 8px;'>{DateTime.Now:HH:mm dd/MM/yyyy}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px; font-weight: bold;'>📝 Ghi chú:</td>
                            <td style='padding: 8px;'>{(string.IsNullOrEmpty(hoadondto.GhiChu) ? "Không có" : hoadondto.GhiChu)}</td>
                        </tr>
                    </table>
                    <p style='margin-top: 24px;'>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                    <p style='margin-top: 16px;'>Trân trọng,<br/><strong>Nhà Hàng Quang Quý</strong></p>
                </div>
                <div style='background-color: #eeeeee; padding: 12px; text-align: center; font-size: 12px; color: #555;'>
                    © {DateTime.Now.Year} Nhà Hàng Quang Quý. Mọi quyền được bảo lưu.
                </div>
            </div>
        </div>";

					await _emailService.SendEmailAsync(toEmail, subject, body);
				}
				catch (Exception emailEx)
				{
					Console.WriteLine("❌ Lỗi gửi email hóa đơn: " + emailEx.Message);
				}

				return Ok(new { message = "Thêm hóa đơn thành công", mahoadon });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi thêm hóa đơn", error = ex.Message });
			}
		}

		[HttpPut("{mahoadon}")]
		public async Task<IActionResult> UpdateHoaDon(string maHoaDon, [FromBody] HoaDonCreateDTO hoadondto)
		{
			try
			{
				if (string.IsNullOrEmpty(maHoaDon))
				{
					return BadRequest(new { message = "Mã hóa đơn không hợp lệ" });
				}
				if (hoadondto == null)
				{
					return BadRequest(new { message = "Dữ liệu hóa đơn không hợp lệ" });
				}

				var hoadon = await _context.Hoadonthanhtoans.FirstOrDefaultAsync(h => h.MaHoaDon == maHoaDon);
				if (hoadon == null)
				{
					return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
				}

				decimal tongTien = (decimal)hoadondto.TongTien;
				decimal tienGiam = 0;

				if (!string.IsNullOrEmpty(hoadondto.MaKhuyenMai))
				{
					var khuyenMai = await _context.Khuyenmais
						.FirstOrDefaultAsync(km => km.MaKhuyenMai == hoadondto.MaKhuyenMai);

					if (khuyenMai != null && khuyenMai.TrangThai == "Hoạt động")
					{
						var today = DateOnly.FromDateTime(DateTime.Now);
						if (khuyenMai.NgayBatDau <= today && khuyenMai.NgayKetThuc >= today)
						{
							if (tongTien >= khuyenMai.MucTienToiThieu)
							{
								tienGiam = tongTien * (khuyenMai.TyLeGiamGia ?? 0) / 100;
							}
						}
					}
				}

				decimal tongTienSauGiam = tongTien - tienGiam;
				decimal soTienCoc = (decimal)(hoadondto.SoTienCoc > 0 ? hoadondto.SoTienCoc : tongTienSauGiam * 0.3m);
				decimal soTienConLai = tongTienSauGiam - soTienCoc;

				hoadon.MaDatMon = hoadondto.MaDatMon;
				hoadon.MaBanAn = hoadondto.MaBanAn;
				hoadon.MaKhachHang = hoadondto.MaKhachHang;
				hoadon.ThoiGianThanhToan = DateTime.Now;
				hoadon.MaKhuyenMai = hoadondto.MaKhuyenMai;
				hoadon.TongTien = tongTien;
				hoadon.TienGiam = tienGiam;
				hoadon.SoTienCoc = soTienCoc;
				hoadon.SoTienConLai = soTienConLai;
				hoadon.PhuongThucThanhToan = hoadondto.PhuongThucThanhToan;
				hoadon.TrangThaiThanhToan = hoadondto.TrangThaiThanhToan;
				hoadon.MaNhanVien = hoadondto.MaNhanVien;
				hoadon.GhiChu = hoadondto.GhiChu;

				_context.Hoadonthanhtoans.Update(hoadon);
				await _context.SaveChangesAsync();
				return Ok(new { message = "Cập nhật hóa đơn thành công", data = hoadon });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi cập nhật hóa đơn", error = ex.Message });
			}
		}

		[HttpDelete("{mahoadon}")]
		public IActionResult DeleteHoaDon(string maHoaDon)
		{
			try
			{
				if (string.IsNullOrEmpty(maHoaDon))
				{
					return BadRequest(new { message = "Mã hóa đơn không hợp lệ" });
				}

				var hoadon = _context.Hoadonthanhtoans.FirstOrDefault(h => h.MaHoaDon == maHoaDon);
				if (hoadon == null)
				{
					return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
				}

				_context.Hoadonthanhtoans.Remove(hoadon);
				_context.SaveChanges();
				return Ok(new { message = "Xóa hóa đơn thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi xóa hóa đơn", error = ex.Message });
			}
		}
	}
}
