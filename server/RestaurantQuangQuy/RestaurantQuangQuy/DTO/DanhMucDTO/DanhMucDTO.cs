using RestaurantQuangQuy.Models;
using System.ComponentModel.DataAnnotations;
namespace RestaurantQuangQuy.DTO.DanhMucDTO
{
	public class DanhMucDTO
	{
		//private bool v;

		//public DanhMucDTO(object value, string maDanhMuc, string tenDanhMuc, string? moTa, string? hinhAnh, bool v)
		//{
		//	MaDanhMuc = maDanhMuc;
		//	TenDanhMuc = tenDanhMuc;
		//	MoTa = moTa;
		//	HinhAnh = hinhAnh;
		//	this.v = v;
		//}

		//private bool v;

		//public DanhMucDTO(string maDanhMuc, string tenDanhMuc, string? moTa, string hinhAnh, bool v)
		//{
		//	MaDanhMuc = maDanhMuc;
		//	TenDanhMuc = tenDanhMuc;
		//	MoTa = moTa;
		//	HinhAnh = hinhAnh;
		//	this.v = v;
		//}

		//private bool v;

		//public DanhMucDTO(string maDanhMuc, string tenDanhMuc, string? moTa, string? hinhAnh, bool v)
		//{
		//	MaDanhMuc = maDanhMuc;
		//	TenDanhMuc = tenDanhMuc;
		//	MoTa = moTa;
		//	HinhAnh = hinhAnh;
		//	this.v = v;
		//}

		//private string v1;
		//private string v2;
		//private bool v3;

		//public DanhMucDTO(string maDanhMuc, string tenDanhMuc, string v1, string v2, bool v3)
		//{
		//	MaDanhMuc = maDanhMuc;
		//	TenDanhMuc = tenDanhMuc;
		//	this.v1 = v1;
		//	this.v2 = v2;
		//	this.v3 = v3;
		//}

		public string MaDanhMuc { get; set; }
		public string TenDanhMuc { get; set; }
		//[Range(0, int.MaxValue, ErrorMessage = "Số lượng món ăn không được âm.")]
		public int SoLuongMonAn { get; set; }

		public string MoTa { get; set; }
		public string? HinhAnh { get; set; }
		public string? TrangThai { get; set; }

	}
}
