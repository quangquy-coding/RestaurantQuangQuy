using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Hoadonthanhtoan
{
    public string MaHoaDon { get; set; } = null!;

    public string MaDatMon { get; set; } = null!;

    public string? MaBanAn { get; set; }

    public string? MaKhachHang { get; set; }

    public DateTime ThoiGianDat { get; set; }

    public DateTime? ThoiGianThanhToan { get; set; }

    public string? MaKhuyenMai { get; set; }

    public decimal? TongTien { get; set; }

    public string? PhuongThucThanhToan { get; set; }

    public string? TrangThaiThanhToan { get; set; }

    public string? MaNhanVien { get; set; }

    public string? GhiChu { get; set; }

    public virtual ICollection<Baocaodoanhthu> Baocaodoanhthus { get; set; } = new List<Baocaodoanhthu>();

    public virtual ICollection<Danhgium> Danhgia { get; set; } = new List<Danhgium>();

    public virtual Datban? MaBanAnNavigation { get; set; }

    public virtual Dondatmon MaDatMonNavigation { get; set; } = null!;

    public virtual Khachhang? MaKhachHangNavigation { get; set; }

    public virtual Khuyenmai? MaKhuyenMaiNavigation { get; set; }

    public virtual Nhanvien? MaNhanVienNavigation { get; set; }
}
