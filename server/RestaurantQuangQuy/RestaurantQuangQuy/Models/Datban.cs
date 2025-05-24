using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Datban
{
    public string MaBanAn { get; set; } = null!;

    public string MaKhachHang { get; set; } = null!;

    public int SoLuongKhach { get; set; } = 0;
	public DateTime ThoiGianDat { get; set; }

    public DateTime ThoiGianDen { get; set; }

    public string TrangThai { get; set; } = null!;

    public string? GhiChu { get; set; }

    public virtual ICollection<Dondatmon> Dondatmons { get; set; } = new List<Dondatmon>();

    public virtual ICollection<Hoadonthanhtoan> Hoadonthanhtoans { get; set; } = new List<Hoadonthanhtoan>();

    public virtual Khachhang MaKhachHangNavigation { get; set; } = null!;

    public virtual ICollection<DatBanBanAn> DatBanBanAns { get; set; } = new List<DatBanBanAn>();
}
