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
		private readonly RestaurantManagementContext _dbContext; // Assumed database context
		private readonly IEmailService _emailService;   // Assumed email service

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
				var result = await _vnPayService.ProcessPaymentReturnAsync(Request.Query);

				// Log kết quả thanh toán
				_logger.LogInformation($"Payment result for order {result.OrderId}: {result.Success} - {result.Message}");

				// Xử lý kết quả thanh toán ở đây (cập nhật database, gửi email, etc.)
				if (result.Success)
				{
					// Thanh toán thành công - cập nhật trạng thái đơn hàng

					await ProcessSuccessfulPayment(result);
				}
				else
				{
					// Thanh toán thất bại - xử lý lỗi
					await ProcessFailedPayment(result);
				}

				return Ok(result);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error processing payment return");
				return StatusCode(500, new { message = "Có lỗi xảy ra khi xử lý kết quả thanh toán" });
			}
		}

		[HttpPost("ipn")]
		public async Task<IActionResult> IPN([FromBody] VNPayIpnRequest request)
		{
			try
			{
				var result = await _vnPayService.ProcessIpnAsync(request);

				_logger.LogInformation($"IPN received for order {result.OrderId}: {result.Success} - {result.Message}");

				if (result.Success)
				{
					// IPN hợp lệ và thanh toán thành công
					await ProcessSuccessfulPayment(result);
					return Ok(new { RspCode = "00", Message = "Confirm Success" });
				}
				else
				{
					// IPN không hợp lệ hoặc thanh toán thất bại
					return Ok(new { RspCode = "97", Message = "Checksum failed" });
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error processing IPN");
				return Ok(new { RspCode = "99", Message = "Unknown error" });
			}
		}

		private async Task ProcessSuccessfulPayment(VNPayPaymentResult result)
		{
			try
			{
				// Find the order in the database
				var datMon = await _dbContext.Dondatmons.FindAsync(result.OrderId);
				if (datMon == null)
				{
					_logger.LogWarning($"Order {result.OrderId} not found in database");
					return;
				}

				// Get customer details
				var khachHang = await _dbContext.Khachhangs
					.FirstOrDefaultAsync(kh => kh.MaKhachHang == datMon.MaKhachHang);
				string toEmail = khachHang?.Email ?? "default@email.com";
				string customerName = khachHang?.TenKhachHang ?? "Quý khách";

				// Create new Hoadonthanhtoan
				string maHoaDon = "HDMM" + Guid.NewGuid().ToString().Substring(0, 6);
				var hoadon = new Hoadonthanhtoan
				{
					MaHoaDon = maHoaDon,
					MaDatMon = result.OrderId,
					MaBanAn = datMon.MaBanAn,
					MaKhachHang = datMon.MaKhachHang,
					ThoiGianDat = DateTime.Now,
					ThoiGianThanhToan = result.PaymentDate,
					MaKhuyenMai = "KM001",
					TongTien = result.Amount, // Convert VNPay amount to VND
					PhuongThucThanhToan = "vnpay",
					TrangThaiThanhToan = "completed",
					MaNhanVien = "NV001",
					GhiChu = datMon.GhiChu
				};

				// Add to database
				_dbContext.Hoadonthanhtoans.Add(hoadon);
				await _dbContext.SaveChangesAsync();

				// Prepare email content
				string subject = "💰 Xác nhận thanh toán thành công - Nhà Hàng Quang Quý";
				string body = $@"
				<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>
					<div style='max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;'>
						<div style='background-color: #388e3c; color: white; padding: 16px; text-align: center;'>
							<h2 style='margin: 0;'>Thanh toán thành công</h2>
						</div>
						<div style='padding: 24px;'>
							<p>Xin chào <strong>{customerName}</strong>,</p>
							<p>Chúng tôi xin xác nhận rằng bạn đã thanh toán thành công tại <strong>Nhà Hàng Quang Quý</strong>.</p>

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
									<td style='padding: 8px; font-weight: bold;'>💸 Tổng tiền:</td>
									<td style='padding: 8px;'>{(result.Amount):N0} VNĐ</td>
								</tr>
								<tr style='background-color: #f9f9f9;'>
									<td style='padding: 8px; font-weight: bold;'>📅 Ngày thanh toán:</td>
									<td style='padding: 8px;'>{result.PaymentDate:HH:mm dd/MM/yyyy}</td>
								</tr>
								<tr>
									<td style='padding: 8px; font-weight: bold;'>📝 Mã giao dịch:</td>
									<td style='padding: 8px;'>{result.TransactionId ?? "Không có"}</td>
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

				// Send confirmation email
				await _emailService.SendEmailAsync(toEmail, subject, body);

				// Update VNPayPaymentResult with new MaHoaDon
				result.OrderId = maHoaDon;

				// Log successful payment
				_logger.LogInformation($"Processed successful payment for order {maHoaDon}, amount: {result.Amount}");
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
				// Find the order in the database
				var order = await _dbContext.Hoadonthanhtoans.FindAsync(result.OrderId);
				if (order == null)
				{
					_logger.LogWarning($"Order {result.OrderId} not found in database");
					return;
				}

				// Update order status
				order.TrangThaiThanhToan = "Failed";
				order.ThoiGianThanhToan = result.PaymentDate;

				// Save changes to database
				await _dbContext.SaveChangesAsync();

				// Send failure notification email to customer
				var emailSubject = "Thông báo thanh toán thất bại";
				var emailBody = $@"
                    Kính gửi Quý khách,
                    Thanh toán cho đơn hàng {result.OrderId} đã thất bại.
                    Lý do: {result.Message}
                    Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.
                    Trân trọng,
                    Restaurant Quang Quy
                ";
				await _emailService.SendEmailAsync(order.MaKhachHangNavigation.Email, emailSubject, emailBody);

				// Log failed payment
				_logger.LogWarning($"Processing failed payment for order {result.OrderId}: {result.Message}");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error processing failed payment for order {result.OrderId}");
				throw; // Re-throw to handle in calling method if needed
			}
		}
	}
}