using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Khachhang
{
    public string MaKhachHang { get; set; } = null!;

    public string TenKhachHang { get; set; } = null!;

    public string? SoDienThoai { get; set; }

    public string? DiaChi { get; set; }

    public string? Email { get; set; }

    public string? MaTaiKhoan { get; set; }

    public virtual ICollection<Danhgium> Danhgia { get; set; } = new List<Danhgium>();

    public virtual ICollection<Datban> Datbans { get; set; } = new List<Datban>();

    public virtual ICollection<Dondatmon> Dondatmons { get; set; } = new List<Dondatmon>();

    public virtual ICollection<Hoadonthanhtoan> Hoadonthanhtoans { get; set; } = new List<Hoadonthanhtoan>();

    public virtual Taikhoan? MaTaiKhoanNavigation { get; set; }
}
