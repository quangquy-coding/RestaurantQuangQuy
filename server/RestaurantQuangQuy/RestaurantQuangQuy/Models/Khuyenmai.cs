using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Khuyenmai
{
    public string MaKhuyenMai { get; set; } = null!;

    public string TenKhuyenMai { get; set; } = null!;

    public decimal? MucTienToiThieu { get; set; }

    public decimal? TyLeGiamGia { get; set; }

    public DateOnly NgayBatDau { get; set; }

    public DateOnly NgayKetThuc { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<Hoadonthanhtoan> Hoadonthanhtoans { get; set; } = new List<Hoadonthanhtoan>();
}
