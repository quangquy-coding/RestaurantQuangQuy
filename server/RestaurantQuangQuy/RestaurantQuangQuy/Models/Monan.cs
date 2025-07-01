using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantQuangQuy.Models
{
	public partial class Monan
	{
		[Key]
		[DatabaseGenerated(DatabaseGeneratedOption.None)] // Không để EF tự động tạo mã
		public string MaMon { get; set; } = null!;

		public string TenMon { get; set; } = null!;

		public string? MoTa { get; set; }

		public decimal Gia { get; set; }

		public string? HinhAnh { get; set; }

		public string? ThoiGianMon { get; set; }

		public string? TinhTrang { get; set; }

		public string? MaDanhMuc { get; set; }

		public virtual ICollection<Chitietdondatmon> Chitietdondatmons { get; set; } = new List<Chitietdondatmon>();

		public virtual Danhmuc? MaDanhMucNavigation { get; set; }
		public string? ThanhPhan { get; internal set; }
		public string? DinhDuong { get; internal set; }
		public string? DiUng { get; internal set; }
	}
}
