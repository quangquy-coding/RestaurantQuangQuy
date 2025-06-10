using System;

namespace RestaurantQuangQuy.Utils
{
	public static class VNPayHelper
	{
		public const decimal MIN_AMOUNT = 5000;
		public const decimal MAX_AMOUNT = 999999999;

		public static bool IsValidAmount(decimal amount)
		{
			return amount >= MIN_AMOUNT && amount < MAX_AMOUNT;
		}

		public static string FormatAmount(decimal amount)
		{
			// VNPay yêu cầu số tiền tính bằng đồng (x100)
			return ((long)(Math.Round(amount) * 100)).ToString();
		}

		public static string GetAmountValidationMessage(decimal amount)
		{
			if (amount < MIN_AMOUNT)
			{
				return $"Số tiền thanh toán phải từ {MIN_AMOUNT:N0} VNĐ trở lên";
			}

			if (amount >= MAX_AMOUNT)
			{
				return $"Số tiền thanh toán phải dưới {MAX_AMOUNT:N0} VNĐ";
			}

			return string.Empty;
		}
	}
}
