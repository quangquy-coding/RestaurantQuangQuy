using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.Services;

namespace RestaurantQuangQuy.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class PaymentController : ControllerBase
	{
		private readonly IVNPayService _vnPayService;
		private readonly ILogger<PaymentController> _logger;
		private readonly RestaurantManagementContext _dbContext;
		private readonly IEmailService _emailService;

		public PaymentController(IVNPayService vnPayService, ILogger<PaymentController> logger, RestaurantManagementContext dbContext, IEmailService emailService)
		{
			_vnPayService = vnPayService;
			_logger = logger;
			_dbContext = dbContext;
			_emailService = emailService;
		}

		[HttpPost("create-payment")]
		public async Task<IActionResult> CreatePayment([FromBody] VNPayCreatePaymentRequest request)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(ModelState);
				}

				// Validate amount theo yêu cầu VNPay
				if (request.SoTienCoc < 5000)
				{
					return BadRequest(new
					{
						success = false,
						message = "Số tiền cọc phải từ 5,000 VNĐ trở lên để thanh toán qua VNPay"
					});
				}

				if (request.SoTienCoc >= 1000000000)
				{
					return BadRequest(new
					{
						success = false,
						message = "Số tiền cọc phải dưới 1 tỷ VNĐ"
					});
				}

				var result = await _vnPayService.CreatePaymentUrlAsync(request, HttpContext);

				if (result.Success)
				{
					return Ok(result);
				}

				return BadRequest(result);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error creating payment");
				return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo thanh toán" });
			}
		}

		[HttpGet("payment-return")]
		public async Task<IActionResult> PaymentReturn()
		{
			try
			{
				_logger.LogInformation("Processing payment return with query: {Query}", Request.QueryString);

				var result = await _vnPayService.ProcessPaymentReturnAsync(Request.Query);

				_logger.LogInformation($"Payment result for order {result.OrderId}: {result.Success} - {result.Message}");

				if (result.Success)
				{
					await ProcessSuccessfulPayment(result);
				}
				else
				{
					await ProcessFailedPayment(result);
				}

				return Ok(result);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error processing payment return: {Message}", ex.Message);
				return StatusCode(500, new
				{
					success = false,
					message = "Có lỗi xảy ra khi xử lý kết quả thanh toán",
					error = ex.Message
				});
			}
		}

		private async Task ProcessSuccessfulPayment(VNPayPaymentResult result)
		{
			try
			{
				_logger.LogInformation($"Processing successful payment for order: {result.OrderId}");

				// Tìm đơn đặt món
				var datMon = await _dbContext.Dondatmons.FindAsync(result.OrderId);
				if (datMon == null)
				{
					_logger.LogWarning($"Order {result.OrderId} not found in database");
					return;
				}

				// Lấy thông tin khách hàng
				var khachHang = await _dbContext.Khachhangs
					.FirstOrDefaultAsync(kh => kh.MaKhachHang == datMon.MaKhachHang);

				string toEmail = khachHang?.Email ?? "default@email.com";
				string customerName = khachHang?.TenKhachHang ?? "Quý khách";

				// Tính toán số tiền
				decimal tongTien = datMon.TongTien ?? 0;
				decimal tienGiam = 0;
				string maKhuyenMai = null;

				// Kiểm tra khuyến mãi (nếu có)
				var khuyenMaiList = await _dbContext.Khuyenmais
					.Where(km => km.TrangThai == "Hoạt động")
					.ToListAsync();

				foreach (var km in khuyenMaiList)
				{
					var today = DateOnly.FromDateTime(DateTime.Now);
					if (km.NgayBatDau <= today && km.NgayKetThuc >= today && tongTien >= km.MucTienToiThieu)
					{
						decimal giamGia = tongTien * (km.TyLeGiamGia ?? 0) / 100;
						if (giamGia > tienGiam)
						{
							tienGiam = giamGia;
							maKhuyenMai = km.MaKhuyenMai;
						}
					}
				}

				decimal tongTienSauGiam = tongTien - tienGiam;
				decimal soTienCoc = result.Amount;
				decimal soTienConLai = tongTienSauGiam - soTienCoc;

				// Tạo hóa đơn
				string maHoaDon = "HDMM" + Guid.NewGuid().ToString().Substring(0, 6);
				var hoadon = new Hoadonthanhtoan
				{
					MaHoaDon = maHoaDon,
					MaDatMon = result.OrderId,
					MaBanAn = datMon.MaBanAn,
					MaKhachHang = datMon.MaKhachHang,
					ThoiGianDat = DateTime.Now,
					ThoiGianThanhToan = result.PaymentDate,
					MaKhuyenMai = maKhuyenMai,
					TongTien = tongTien,
					TienGiam = tienGiam,
					SoTienCoc = soTienCoc,
					SoTienConLai = soTienConLai,
					PhuongThucThanhToan = "VNPay",
					TrangThaiThanhToan = "deposit",
					MaNhanVien = "NV001",
					GhiChu = datMon.GhiChu
				};

				_dbContext.Hoadonthanhtoans.Add(hoadon);
				await _dbContext.SaveChangesAsync();

				_logger.LogInformation($"Created invoice {maHoaDon} for order {result.OrderId}");

				// Gửi email xác nhận
				try
				{
					string subject = "💰 Xác nhận đặt cọc thành công - Nhà Hàng Quang Quý";
					string body = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>
                        <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;'>
                            <div style='background-color: #388e3c; color: white; padding: 16px; text-align: center;'>
                                <h2 style='margin: 0;'>Đặt cọc thành công</h2>
                            </div>
                            <div style='padding: 24px;'>
                                <p>Xin chào <strong>{customerName}</strong>,</p>
                                <p>Chúng tôi xin xác nhận rằng bạn đã đặt cọc thành công tại <strong>Nhà Hàng Quang Quý</strong>.</p>
                                <table style='width: 100%; margin-top: 16px; border-collapse: collapse;'>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>🧾 Mã hóa đơn:</td>
                                        <td style='padding: 8px;'>{maHoaDon}</td>
                                    </tr>
                                    <tr style='background-color: #f9f9f9;'>
                                        <td style='padding: 8px; font-weight: bold;'>💳 Phương thức:</td>
                                        <td style='padding: 8px;'>VNPay</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>💸 Tổng hóa đơn:</td>
                                        <td style='padding: 8px;'>{tongTienSauGiam:N0} VNĐ</td>
                                    </tr>
                                    {(tienGiam > 0 ? $@"
                                    <tr style='background-color: #f9f9f9;'>
                                        <td style='padding: 8px; font-weight: bold;'>🎁 Tiền giảm:</td>
                                        <td style='padding: 8px;'>{tienGiam:N0} VNĐ</td>
                                    </tr>" : "")}
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>💰 Tiền cọc đã thanh toán:</td>
                                        <td style='padding: 8px; color: #388e3c; font-weight: bold;'>{soTienCoc:N0} VNĐ</td>
                                    </tr>
                                    <tr style='background-color: #fff3cd;'>
                                        <td style='padding: 8px; font-weight: bold;'>💵 Thanh toán tại nhà hàng:</td>
                                        <td style='padding: 8px; color: #856404; font-weight: bold;'>{soTienConLai:N0} VNĐ</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>📅 Ngày đặt cọc:</td>
                                        <td style='padding: 8px;'>{result.PaymentDate:HH:mm dd/MM/yyyy}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>📝 Mã giao dịch:</td>
                                        <td style='padding: 8px;'>{result.TransactionId ?? "Không có"}</td>
                                    </tr>
                                </table>
                                <div style='background-color: #e8f5e8; padding: 16px; border-radius: 8px; margin-top: 20px;'>
                                    <p style='margin: 0; color: #2d5a2d; font-weight: bold;'>📍 Lưu ý quan trọng:</p>
                                    <p style='margin: 8px 0 0 0; color: #2d5a2d;'>Bạn có thể thanh toán số tiền còn lại bằng tiền mặt khi đến nhà hàng. Vui lòng mang theo mã hóa đơn để xác nhận.</p>
                                </div>
                                <p style='margin-top: 24px;'>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
                                <p style='margin-top: 16px;'>Trân trọng,<br/><strong>Nhà Hàng Quang Quý</strong></p>
                            </div>
                            <div style='background-color: #eeeeee; padding: 12px; text-align: center; font-size: 12px; color: #555;'>
                                © {DateTime.Now.Year} Nhà Hàng Quang Quý. Mọi quyền được bảo lưu.
                            </div>
                        </div>
                    </div>";

					await _emailService.SendEmailAsync(toEmail, subject, body);
					_logger.LogInformation($"Email sent successfully to {toEmail}");
				}
				catch (Exception emailEx)
				{
					_logger.LogError(emailEx, "Failed to send confirmation email");
				}

				// Cập nhật result với mã hóa đơn mới
				result.OrderId = maHoaDon;
				_logger.LogInformation($"Processed successful deposit payment for order {maHoaDon}, amount: {result.Amount}");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Failed to process successful payment for order {result.OrderId}");
				throw;
			}
		}

		private async Task ProcessFailedPayment(VNPayPaymentResult result)
		{
			try
			{
				_logger.LogInformation($"Processing failed payment for order: {result.OrderId}");

				// Tìm đơn đặt món để rollback
				var datMon = await _dbContext.Dondatmons.FindAsync(result.OrderId);
				if (datMon != null)
				{
					var khachHang = await _dbContext.Khachhangs
						.FirstOrDefaultAsync(kh => kh.MaKhachHang == datMon.MaKhachHang);

					// Gửi email thông báo thất bại
					try
					{
						var emailSubject = "Thông báo đặt cọc thất bại";
						var emailBody = $@"
                            <div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>
                                <div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;'>
                                    <div style='background-color: #d32f2f; color: white; padding: 16px; text-align: center;'>
                                        <h2 style='margin: 0;'>Đặt cọc thất bại</h2>
                                    </div>
                                    <div style='padding: 24px;'>
                                        <p>Kính gửi <strong>{khachHang?.TenKhachHang ?? "Quý khách"}</strong>,</p>
                                        <p>Đặt cọc cho đơn hàng <strong>{result.OrderId}</strong> đã thất bại.</p>
                                        <p><strong>Lý do:</strong> {result.Message}</p>
                                        <p>Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                                        <p style='margin-top: 16px;'>Trân trọng,<br/><strong>Nhà Hàng Quang Quý</strong></p>
                                    </div>
                                </div>
                            </div>";

						await _emailService.SendEmailAsync(khachHang?.Email ?? "default@email.com", emailSubject, emailBody);
					}
					catch (Exception emailEx)
					{
						_logger.LogError(emailEx, "Failed to send failure notification email");
					}
				}

				_logger.LogWarning($"Processing failed deposit payment for order {result.OrderId}: {result.Message}");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error processing failed payment for order {result.OrderId}");
				throw;
			}
		}
	}
}
