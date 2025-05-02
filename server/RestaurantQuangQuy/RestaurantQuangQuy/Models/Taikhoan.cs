using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Taikhoan
{
    public string MaTaiKhoan { get; set; } = null!;

    public string TenTaiKhoan { get; set; } = null!;

    public string MatKhau { get; set; } = null!;

    public string? Email { get; set; }

    public string? SoDienThoai { get; set; }

    public string? DiaChi { get; set; }

    public DateOnly NgayDangKy { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? MaQuyen { get; set; }

    public virtual Khachhang? Khachhang { get; set; }

    public virtual Quyentruycap? MaQuyenNavigation { get; set; }

    public virtual Nhanvien? Nhanvien { get; set; }
}
