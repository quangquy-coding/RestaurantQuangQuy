using System;
using System.Collections.Generic;

namespace RestaurantQuangQuy.Models;

public partial class Quyentruycap
{
    public string MaQuyen { get; set; } = null!;

    public string TenQuyen { get; set; } = null!;

    public string? MoTa { get; set; }

    public virtual ICollection<Taikhoan> Taikhoans { get; set; } = new List<Taikhoan>();
}
