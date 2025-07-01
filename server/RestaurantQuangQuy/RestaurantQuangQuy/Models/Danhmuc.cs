using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RestaurantQuangQuy.Models;

public partial class Danhmuc
{
    public string MaDanhMuc { get; set; } = null!;

    public string TenDanhMuc { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? TinhTrang { get; set; }

    public virtual ICollection<Monan> Monans { get; set; } = new List<Monan>();
	public string? HinhAnh { get; internal set; }
	//[Range(0, int.MaxValue, ErrorMessage = "Số lượng món ăn không được âm.")]
	public int SoLuongMonAn { get; set; }

}
