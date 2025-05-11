using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Danhgium
{
    public string MaDanhGia { get; set; } = null!;

    public string MaKhachHang { get; set; } = null!;

    public string MaHoaDon { get; set; } = null!;

    public string? NoiDungPhanHoi { get; set; }

    public DateOnly NgayDanhGia { get; set; }

    public int? XepHang { get; set; }

    public virtual Hoadonthanhtoan MaHoaDonNavigation { get; set; } = null!;

    public virtual Khachhang MaKhachHangNavigation { get; set; } = null!;
}
