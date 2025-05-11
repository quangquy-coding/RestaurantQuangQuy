using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Banan
{
    public string MaBan { get; set; } = null!;

    public string TenBan { get; set; } = null!;

    public int SoChoNgoi { get; set; }

    public string TrangThai { get; set; } = null!;

    public string? GhiChu { get; set; }

    public virtual ICollection<Datban> MaBanAns { get; set; } = new List<Datban>();
}
