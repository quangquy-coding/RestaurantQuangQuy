using System.ComponentModel.DataAnnotations;

namespace RestaurantQuangQuy.Models
{
	public class VNPayCreatePaymentRequest
	{
		[Required]
		public decimal Amount { get; set; }

		[Required]
		public string OrderDescription { get; set; }

		[Required]
		public string OrderId { get; set; }

		public string CustomerName { get; set; }

		public string CustomerEmail { get; set; }

		public string CustomerPhone { get; set; }
	}

	public class VNPayCreatePaymentResponse
	{
		public string PaymentUrl { get; set; }
		public string OrderId { get; set; }
		public bool Success { get; set; }
		public string Message { get; set; }
	}

	public class VNPayIpnRequest
	{
		public string vnp_Amount { get; set; }
		public string vnp_BankCode { get; set; }
		public string vnp_BankTranNo { get; set; }
		public string vnp_CardType { get; set; }
		public string vnp_OrderInfo { get; set; }
		public string vnp_PayDate { get; set; }
		public string vnp_ResponseCode { get; set; }
		public string vnp_TmnCode { get; set; }
		public string vnp_TransactionNo { get; set; }
		public string vnp_TransactionStatus { get; set; }
		public string vnp_TxnRef { get; set; }
		public string vnp_SecureHashType { get; set; }
		public string vnp_SecureHash { get; set; }
	}

	public class VNPayPaymentResult
	{
		public bool Success { get; set; }
		public string OrderId { get; set; }
		public decimal Amount { get; set; }
		public string TransactionId { get; set; }
		public string ResponseCode { get; set; }
		public string Message { get; set; }
		public DateTime PaymentDate { get; set; }
	}
}