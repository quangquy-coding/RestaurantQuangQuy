using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;

namespace RestaurantQuangQuy.Controllers.Api
{
	[Route("api/[controller]")]
	[ApiController]
	public class PaymentProcessorController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		private readonly IConfiguration _configuration;
		private readonly IEmailService _emailService;

		public PaymentProcessorController(RestaurantManagementContext context, IConfiguration configuration, IEmailService emailService)
		{
			_context = context;
			_configuration = configuration;
			_emailService = emailService;
		}

		[HttpPost("CreateOrderAndPay")]
		public async Task<IActionResult> CreateOrderAndPay([FromBody] OrderPaymentDTO orderDto)
		{
			try
			{
				// Kiểm tra dữ liệu đầu vào
				if (orderDto == null || orderDto.TongTien <= 0 || string.IsNullOrEmpty(orderDto.PhuongThucThanhToan))
				{
					return BadRequest(new { error = "Dữ liệu đơn hàng không hợp lệ" });
				}

				// Tính toán lại các giá trị để đảm bảo tính chính xác
				decimal tongTien = orderDto.TongTien;
				decimal tienGiam = 0;

				// Kiểm tra và áp dụng khuyến mãi nếu có
				if (!string.IsNullOrEmpty(orderDto.MaKhuyenMai))
				{
					var khuyenMai = await _context.Khuyenmais
						.FirstOrDefaultAsync(km => km.MaKhuyenMai == orderDto.MaKhuyenMai);

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
				decimal soTienCoc = orderDto.SoTienCoc > 0 ? orderDto.SoTienCoc : tongTienSauGiam * 0.3m;
				decimal soTienConLai = tongTienSauGiam - soTienCoc;

				// Validate amount cho VNPay
				if (orderDto.PhuongThucThanhToan.ToLower() == "vnpay")
				{
					if (soTienCoc < 5000)
					{
						return BadRequest(new { error = "Số tiền cọc phải từ 5,000 VNĐ trở lên để thanh toán qua VNPay" });
					}

					if (soTienCoc >= 1000000000)
					{
						return BadRequest(new { error = "Số tiền cọc phải dưới 1 tỷ VNĐ" });
					}
				}

				// Tạo mã hóa đơn
				string maHoaDon = "HDTT" + Guid.NewGuid().ToString().Substring(0, 6);

				// Tạo hóa đơn
				var hoadon = new Hoadonthanhtoan
				{
					MaHoaDon = maHoaDon,
					MaDatMon = orderDto.MaDatMon,
					MaBanAn = orderDto.MaBanAn,
					MaKhachHang = orderDto.MaKhachHang,
					ThoiGianDat = DateTime.Now,
					ThoiGianThanhToan = orderDto.PhuongThucThanhToan == "vnpay" ? null : DateTime.Now,
					MaKhuyenMai = orderDto.MaKhuyenMai,
					TienGiam = tienGiam,
					TongTien = tongTien,
					SoTienCoc = soTienCoc,
					SoTienConLai = soTienConLai,
					PhuongThucThanhToan = orderDto.PhuongThucThanhToan,
					TrangThaiThanhToan = orderDto.PhuongThucThanhToan == "vnpay" ? "pending" : "completed",
					MaNhanVien = orderDto.MaNhanVien,
					GhiChu = orderDto.GhiChu
				};

				_context.Hoadonthanhtoans.Add(hoadon);
				await _context.SaveChangesAsync();

				if (orderDto.PhuongThucThanhToan == "vnpay")
				{
					var paymentUrl = GeneratePaymentUrl(hoadon);
					return Ok(new { message = "Hóa đơn đã được tạo, chuyển hướng đến VNPAY", maHoaDon, paymentUrl });
				}

				// Gửi email xác nhận cho các phương thức khác
				await SendPaymentConfirmationEmail(hoadon);

				return Ok(new { message = "Thanh toán hóa đơn thành công", maHoaDon });
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error creating order: {ex.Message}");
				return BadRequest(new { error = "Lỗi khi xử lý đơn hàng", details = ex.Message });
			}
		}

		[HttpGet("/payment/vnpay/callback")]
		public async Task<IActionResult> PaymentCallback()
		{
			try
			{
				var vnpParams = Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
				var secureHash = vnpParams.GetValueOrDefault("vnp_SecureHash");
				vnpParams.Remove("vnp_SecureHash");

				if (!ValidateSignature(vnpParams, secureHash))
				{
					return BadRequest(new { error = "Chữ ký không hợp lệ" });
				}

				var responseCode = vnpParams["vnp_ResponseCode"];
				var maHoaDon = vnpParams["vnp_TxnRef"];
				var hoadon = await _context.Hoadonthanhtoans.FirstOrDefaultAsync(h => h.MaHoaDon == maHoaDon);

				if (hoadon == null)
				{
					return NotFound(new { error = "Hóa đơn không tồn tại" });
				}

				if (responseCode == "00")
				{
					hoadon.TrangThaiThanhToan = "completed";
					hoadon.ThoiGianThanhToan = DateTime.Now;
					_context.Hoadonthanhtoans.Update(hoadon);
					await _context.SaveChangesAsync();

					// Gửi email xác nhận
					await SendPaymentConfirmationEmail(hoadon);

					return Redirect($"https://localhost:3000/payment/success?orderId={maHoaDon}");
				}
				else
				{
					hoadon.TrangThaiThanhToan = "failed";
					_context.Hoadonthanhtoans.Update(hoadon);
					await _context.SaveChangesAsync();
					return Redirect($"https://localhost:3000/payment/failed?errorCode={responseCode}");
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in PaymentCallback: {ex.Message}");
				return BadRequest(new { error = "Lỗi xử lý callback VNPAY", details = ex.Message });
			}
		}

		[HttpGet("/payment/vnpay")]
		public async Task<IActionResult> IpnUrl()
		{
			try
			{
				var vnpParams = Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
				var secureHash = vnpParams.GetValueOrDefault("vnp_SecureHash");
				vnpParams.Remove("vnp_SecureHash");

				if (!ValidateSignature(vnpParams, secureHash))
				{
					return Ok(new { RspCode = "97", Message = "Invalid checksum" });
				}

				var responseCode = vnpParams["vnp_ResponseCode"];
				var maHoaDon = vnpParams["vnp_TxnRef"];
				var hoadon = await _context.Hoadonthanhtoans.FirstOrDefaultAsync(h => h.MaHoaDon == maHoaDon);

				if (hoadon == null)
				{
					return Ok(new { RspCode = "01", Message = "Order not found" });
				}

				if (responseCode == "00")
				{
					hoadon.TrangThaiThanhToan = "completed";
					hoadon.ThoiGianThanhToan = DateTime.Now;
					_context.Hoadonthanhtoans.Update(hoadon);
					await _context.SaveChangesAsync();
					return Ok(new { RspCode = "00", Message = "Confirm Success" });
				}
				else
				{
					hoadon.TrangThaiThanhToan = "failed";
					_context.Hoadonthanhtoans.Update(hoadon);
					await _context.SaveChangesAsync();
					return Ok(new { RspCode = "01", Message = "Confirm Failed" });
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in IpnUrl: {ex.Message}");
				return Ok(new { RspCode = "99", Message = $"Error: {ex.Message}" });
			}
		}

		private string GeneratePaymentUrl(Hoadonthanhtoan hoadon)
		{
			try
			{
				var vnpUrl = _configuration["Vnpay:BaseUrl"];
				var vnpTmnCode = _configuration["Vnpay:TmnCode"];
				var vnpHashSecret = _configuration["Vnpay:HashSecret"];
				var vnpReturnUrl = _configuration["Vnpay:ReturnUrl"];
				var vnpIpAddr = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

				if (string.IsNullOrEmpty(vnpUrl) || string.IsNullOrEmpty(vnpTmnCode) || string.IsNullOrEmpty(vnpHashSecret))
				{
					throw new Exception("Thiếu cấu hình VNPAY trong appsettings.json");
				}

				// Sử dụng VNPayLibrary như code cũ
				var vnpay = new VNPayLibrary();

				vnpay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"] ?? "2.1.0");
				vnpay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"] ?? "pay");
				vnpay.AddRequestData("vnp_TmnCode", vnpTmnCode);
				vnpay.AddRequestData("vnp_Amount", ((long)((hoadon.SoTienCoc ?? 0) * 100)).ToString());
				vnpay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"] ?? "VND");
				vnpay.AddRequestData("vnp_TxnRef", hoadon.MaHoaDon);
				vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan hoa don {hoadon.MaHoaDon}");
				vnpay.AddRequestData("vnp_OrderType", "billpayment");
				vnpay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"] ?? "vn");
				vnpay.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
				vnpay.AddRequestData("vnp_IpAddr", vnpIpAddr);
				vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
				vnpay.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));

				var paymentUrl = vnpay.CreateRequestUrl(vnpUrl, vnpHashSecret);
				Console.WriteLine($"Generated paymentUrl: {paymentUrl}");

				return paymentUrl;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in GeneratePaymentUrl: {ex.Message}");
				throw;
			}
		}

		private bool ValidateSignature(Dictionary<string, string> vnpParams, string secureHash)
		{
			var vnpHashSecret = _configuration["Vnpay:HashSecret"];
			var queryString = string.Join("&", vnpParams.OrderBy(k => k.Key).Select(kvp => $"{kvp.Key}={HttpUtility.UrlEncode(kvp.Value)}"));
			var checkSum = HmacSha512(vnpHashSecret, queryString);
			return checkSum.Equals(secureHash, StringComparison.OrdinalIgnoreCase);
		}

		private string HmacSha512(string key, string inputData)
		{
			var hash = new HMACSHA512(Encoding.UTF8.GetBytes(key));
			var hashBytes = hash.ComputeHash(Encoding.UTF8.GetBytes(inputData));
			return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
		}

		private async Task SendPaymentConfirmationEmail(Hoadonthanhtoan hoadon)
		{
			try
			{
				var khachHang = await _context.Khachhangs.FirstOrDefaultAsync(kh => kh.MaKhachHang == hoadon.MaKhachHang);
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
                                        <td style='padding: 8px;'>{hoadon.MaHoaDon}</td>
                                    </tr>
                                    <tr style='background-color: #f9f9f9;'>
                                        <td style='padding: 8px; font-weight: bold;'>💳 Phương thức:</td>
                                        <td style='padding: 8px;'>{hoadon.PhuongThucThanhToan}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>💸 Tổng tiền:</td>
                                        <td style='padding: 8px;'>{hoadon.TongTien:N0} VNĐ</td>
                                    </tr>
                                    {(hoadon.TienGiam > 0 ? $@"
                                    <tr style='background-color: #f9f9f9;'>
                                        <td style='padding: 8px; font-weight: bold;'>🎁 Tiền giảm:</td>
                                        <td style='padding: 8px;'>{hoadon.TienGiam:N0} VNĐ</td>
                                    </tr>" : "")}
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>💰 Tiền cọc:</td>
                                        <td style='padding: 8px;'>{hoadon.SoTienCoc:N0} VNĐ</td>
                                    </tr>
                                    <tr style='background-color: #f9f9f9;'>
                                        <td style='padding: 8px; font-weight: bold;'>💵 Tiền còn lại:</td>
                                        <td style='padding: 8px;'>{hoadon.SoTienConLai:N0} VNĐ</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>📅 Ngày thanh toán:</td>
                                        <td style='padding: 8px;'>{DateTime.Now:HH:mm dd/MM/yyyy}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px; font-weight: bold;'>📝 Ghi chú:</td>
                                        <td style='padding: 8px;'>{(string.IsNullOrEmpty(hoadon.GhiChu) ? "Không có" : hoadon.GhiChu)}</td>
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
				Console.WriteLine($"Email sent to {toEmail} for order {hoadon.MaHoaDon}");
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error sending email: {ex.Message}");
			}
		}
	}

	public class OrderPaymentDTO
	{
		public string MaDatMon { get; set; }
		public string MaBanAn { get; set; }
		public string MaKhachHang { get; set; }
		public string MaKhuyenMai { get; set; }
		public decimal TongTien { get; set; }
		public decimal SoTienCoc { get; set; }
		public decimal SoTienConLai { get; set; }
		public decimal TienGiam { get; set; }
		public string PhuongThucThanhToan { get; set; }
		public string MaNhanVien { get; set; }
		public string GhiChu { get; set; }
	}
}
