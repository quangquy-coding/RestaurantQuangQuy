using RestaurantQuangQuy.DTO.BanAnDTO;
namespace RestaurantQuangQuy.DTO.DatBanDTO
{
    public class DatBanDTO
    {
        public string MaBanAn { get; set; } = null!;
        public List<string> MaBans { get; set; } = new List<string>();
        public int SoLuongKhach { get; set; } = 0;
        public string MaKhachHang { get; set; } = null!;
        public DateTime ThoiGianDat { get; set; }
        public DateTime ThoiGianDen { get; set; }
        public string TrangThai { get; set; } = null!;
        public string? GhiChu { get; set; }

        // Fully qualify the type to avoid ambiguity
        public List<RestaurantQuangQuy.DTO.BanAnDTO.BanAnDTO> Banans { get; set; } = new List<RestaurantQuangQuy.DTO.BanAnDTO.BanAnDTO>();
    }

    public class DatBanCreateDTO
    {
        public string MaKhachHang { get; set; } = null!;
        public int SoLuongKhach { get; set; } = 0;
        public List<string> MaBans { get; set; } = new List<string>();
        public DateTime ThoiGianDat { get; set; }
        public DateTime ThoiGianDen { get; set; }
        public string TrangThai { get; set; } = null!;
        public string? GhiChu { get; set; }
    }

    public class DatBanUpdateDTO
    {
        public string MaBanAn { get; set; } = null!;
        public string MaKhachHang { get; set; } = null!;
        public int SoLuongKhach { get; set; } = 0;
        public List<string> MaBans { get; set; } = new List<string>();
        public DateTime ThoiGianDat { get; set; }
        public DateTime ThoiGianDen { get; set; }
        public string TrangThai { get; set; } = null!;
        public string? GhiChu { get; set; }
    }
	

}