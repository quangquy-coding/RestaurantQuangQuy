using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Baocaodoanhthu
{
    public string MaBaoCao { get; set; } = null!;

    public DateOnly NgayBaoCao { get; set; }

    public decimal TongDoanhThu { get; set; }

    public int SoHoaDon { get; set; }

    public int SoLuongMon { get; set; }

    public string? MaHoaDon { get; set; }

    public virtual Hoadonthanhtoan? MaHoaDonNavigation { get; set; }
}
