using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Nhanvien
{
    public string MaNhanVien { get; set; } = null!;

    public string HoTen { get; set; } = null!;

    public string ChucVu { get; set; } = null!;

    public decimal? Luong { get; set; }

    public DateOnly NgayTuyenDung { get; set; }

    public string? SoCccd { get; set; }

    public string? MaTaiKhoan { get; set; }

    public virtual ICollection<Hoadonthanhtoan> Hoadonthanhtoans { get; set; } = new List<Hoadonthanhtoan>();

    public virtual Taikhoan? MaTaiKhoanNavigation { get; set; }
}
