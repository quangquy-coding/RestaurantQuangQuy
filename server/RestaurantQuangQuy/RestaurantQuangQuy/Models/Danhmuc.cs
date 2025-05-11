using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Danhmuc
{
    public string MaDanhMuc { get; set; } = null!;

    public string TenDanhMuc { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? TinhTrang { get; set; }

    public virtual ICollection<Monan> Monans { get; set; } = new List<Monan>();
}
