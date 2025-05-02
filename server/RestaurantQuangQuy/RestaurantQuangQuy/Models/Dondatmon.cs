using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Dondatmon
{
    public string MaDatMon { get; set; } = null!;

    public string? MaBanAn { get; set; }

    public string? MaKhachHang { get; set; }

    public string? SoDienThoai { get; set; }

    public DateTime ThoiGianDat { get; set; }

    public string? TrangThai { get; set; }

    public int? SoLuong { get; set; }

    public decimal? TongTien { get; set; }

    public string? GhiChu { get; set; }

    public virtual ICollection<Chitietdondatmon> Chitietdondatmons { get; set; } = new List<Chitietdondatmon>();

    public virtual ICollection<Hoadonthanhtoan> Hoadonthanhtoans { get; set; } = new List<Hoadonthanhtoan>();

    public virtual Datban? MaBanAnNavigation { get; set; }

    public virtual Khachhang? MaKhachHangNavigation { get; set; }
}
