using System.Globalization;
using System.Net;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Services
{
	public interface IVNPayService
	{
		Task<VNPayCreatePaymentResponse> CreatePaymentUrlAsync(VNPayCreatePaymentRequest request, HttpContext context);
		Task<VNPayPaymentResult> ProcessPaymentReturnAsync(IQueryCollection queryParams);
		Task<VNPayPaymentResult> ProcessIpnAsync(VNPayIpnRequest request);
		bool ValidateSignature(IQueryCollection queryParams);
	}

	public class VNPayService : IVNPayService
	{
		private readonly IConfiguration _configuration;
		private readonly string _vnpUrl;
		private readonly string _vnpReturnUrl;
		private readonly string _vnpTmnCode;
		private readonly string _vnpHashSecret;

		public VNPayService(IConfiguration configuration)
		{
			_configuration = configuration;
			_vnpUrl = _configuration["Vnpay:BaseUrl"];
			_vnpReturnUrl = _configuration["Vnpay:ReturnUrl"];
			_vnpTmnCode = _configuration["Vnpay:TmnCode"];
			_vnpHashSecret = _configuration["Vnpay:HashSecret"];
		}

		public async Task<VNPayCreatePaymentResponse> CreatePaymentUrlAsync(VNPayCreatePaymentRequest request, HttpContext context)
		{
			try
			{
				var vnpay = new VNPayLibrary();
				var clientIp = GetClientIpAddress(context);

				vnpay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
				vnpay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
				vnpay.AddRequestData("vnp_TmnCode", _vnpTmnCode);
				vnpay.AddRequestData("vnp_Amount", ((long)(request.SoTienCoc * 100)).ToString());
				vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
				vnpay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
				vnpay.AddRequestData("vnp_IpAddr", clientIp);
				vnpay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
				vnpay.AddRequestData("vnp_OrderInfo", request.OrderDescription);
				vnpay.AddRequestData("vnp_OrderType", "other");
				vnpay.AddRequestData("vnp_ReturnUrl", _vnpReturnUrl);
				vnpay.AddRequestData("vnp_TxnRef", request.OrderId);

				// Thêm thông tin khách hàng (tùy chọn)
				if (!string.IsNullOrEmpty(request.CustomerName))
					vnpay.AddRequestData("vnp_Bill_FirstName", request.CustomerName);
				if (!string.IsNullOrEmpty(request.CustomerEmail))
					vnpay.AddRequestData("vnp_Bill_Email", request.CustomerEmail);
				if (!string.IsNullOrEmpty(request.CustomerPhone))
					vnpay.AddRequestData("vnp_Bill_Mobile", request.CustomerPhone);

				var paymentUrl = vnpay.CreateRequestUrl(_vnpUrl, _vnpHashSecret);

				return new VNPayCreatePaymentResponse
				{
					PaymentUrl = paymentUrl,
					OrderId = request.OrderId,
					Success = true,
					Message = "Tạo URL thanh toán thành công"
				};
			}
			catch (Exception ex)
			{
				return new VNPayCreatePaymentResponse
				{
					Success = false,
					Message = $"Lỗi tạo URL thanh toán: {ex.Message}"
				};
			}
		}

		public async Task<VNPayPaymentResult> ProcessPaymentReturnAsync(IQueryCollection queryParams)
		{
			try
			{
				var vnpay = new VNPayLibrary();

				foreach (var param in queryParams)
				{
					if (!string.IsNullOrEmpty(param.Value) && param.Key.StartsWith("vnp_"))
					{
						vnpay.AddResponseData(param.Key, param.Value);
					}
				}

				var orderId = vnpay.GetResponseData("vnp_TxnRef");
				var vnpayTranId = vnpay.GetResponseData("vnp_TransactionNo");
				var vnpResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
				var vnpSecureHash = queryParams["vnp_SecureHash"];
				var amount = Convert.ToDecimal(vnpay.GetResponseData("vnp_Amount")) / 100;
				var payDateStr = vnpay.GetResponseData("vnp_PayDate");

				bool checkSignature = vnpay.ValidateSignature(vnpSecureHash, _vnpHashSecret);

				if (!checkSignature)
				{
					return new VNPayPaymentResult
					{
						Success = false,
						Message = "Chữ ký không hợp lệ",
						OrderId = orderId
					};
				}

				DateTime paymentDate = DateTime.ParseExact(payDateStr, "yyyyMMddHHmmss", CultureInfo.InvariantCulture);

				return new VNPayPaymentResult
				{
					Success = vnpResponseCode == "00",
					OrderId = orderId,
					Amount = amount,
					TransactionId = vnpayTranId,
					ResponseCode = vnpResponseCode,
					Message = GetResponseMessage(vnpResponseCode),
					PaymentDate = paymentDate
				};
			}
			catch (Exception ex)
			{
				return new VNPayPaymentResult
				{
					Success = false,
					Message = $"Lỗi xử lý kết quả thanh toán: {ex.Message}"
				};
			}
		}

		public async Task<VNPayPaymentResult> ProcessIpnAsync(VNPayIpnRequest request)
		{
			try
			{
				var vnpay = new VNPayLibrary();

				// Add all parameters except secure hash
				foreach (var prop in typeof(VNPayIpnRequest).GetProperties())
				{
					if (prop.Name != "vnp_SecureHash" && prop.Name != "vnp_SecureHashType")
					{
						var value = prop.GetValue(request)?.ToString();
						if (!string.IsNullOrEmpty(value))
						{
							vnpay.AddResponseData(prop.Name, value);
						}
					}
				}

				bool checkSignature = vnpay.ValidateSignature(request.vnp_SecureHash, _vnpHashSecret);

				if (!checkSignature)
				{
					return new VNPayPaymentResult
					{
						Success = false,
						Message = "Invalid signature",
						OrderId = request.vnp_TxnRef
					};
				}

				var amount = Convert.ToDecimal(request.vnp_Amount) / 100;
				var paymentDate = DateTime.ParseExact(request.vnp_PayDate, "yyyyMMddHHmmss", CultureInfo.InvariantCulture);

				return new VNPayPaymentResult
				{
					Success = request.vnp_ResponseCode == "00",
					OrderId = request.vnp_TxnRef,
					Amount = amount,
					TransactionId = request.vnp_TransactionNo,
					ResponseCode = request.vnp_ResponseCode,
					Message = GetResponseMessage(request.vnp_ResponseCode),
					PaymentDate = paymentDate
				};
			}
			catch (Exception ex)
			{
				return new VNPayPaymentResult
				{
					Success = false,
					Message = $"Error processing IPN: {ex.Message}"
				};
			}
		}

		public bool ValidateSignature(IQueryCollection queryParams)
		{
			var vnpay = new VNPayLibrary();

			foreach (var param in queryParams)
			{
				if (!string.IsNullOrEmpty(param.Value) && param.Key.StartsWith("vnp_"))
				{
					vnpay.AddResponseData(param.Key, param.Value);
				}
			}

			var vnpSecureHash = queryParams["vnp_SecureHash"];
			return vnpay.ValidateSignature(vnpSecureHash, _vnpHashSecret);
		}

		private string GetClientIpAddress(HttpContext context)
		{
			var ipAddress = context.Connection.RemoteIpAddress;
			if (ipAddress != null)
			{
				if (ipAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
				{
					ipAddress = Dns.GetHostEntry(ipAddress).AddressList
						.First(x => x.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
				}
				return ipAddress.ToString();
			}
			return "127.0.0.1";
		}

		private string GetResponseMessage(string responseCode)
		{
			return responseCode switch
			{
				"00" => "Giao dịch thành công",
				"07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
				"09" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
				"10" => "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
				"11" => "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
				"12" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
				"13" => "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
				"24" => "Giao dịch không thành công do: Khách hàng hủy giao dịch",
				"51" => "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
				"65" => "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
				"75" => "Ngân hàng thanh toán đang bảo trì.",
				"79" => "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
				"99" => "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
				_ => "Lỗi không xác định"
			};
		}
	}
}