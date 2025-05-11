using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Monan
{
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
}
