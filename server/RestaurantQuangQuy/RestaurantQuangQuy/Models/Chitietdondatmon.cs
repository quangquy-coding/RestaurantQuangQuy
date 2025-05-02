using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Chitietdondatmon
{
    public string MaDatMon { get; set; } = null!;

    public string MaMon { get; set; } = null!;

    public int SoLuong { get; set; }

    public decimal Gia { get; set; }

    public decimal? TongTien { get; set; }

    public virtual Dondatmon MaDatMonNavigation { get; set; } = null!;

    public virtual Monan MaMonNavigation { get; set; } = null!;
}
