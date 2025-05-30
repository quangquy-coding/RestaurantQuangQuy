using System;
using System.Collections.Generic;
using RestaurantQuangQuy.Models;
namespace RestaurantQuangQuy.Models;

public partial class Banan
{
    public string MaBan { get; set; } = null!;

    public string TenBan { get; set; } = null!;

	public string ViTri { get; set; } = null!;
	public int SoChoNgoi { get; set; }

   

    public string? GhiChu { get; set; }

    public virtual ICollection<DatBanBanAn> DatBanBanAns { get; set; } = new List<DatBanBanAn>();
}
