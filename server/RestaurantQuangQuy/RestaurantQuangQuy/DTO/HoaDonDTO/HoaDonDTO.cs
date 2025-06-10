namespace RestaurantQuangQuy.DTO.HoaDonDTO
{
    public class HoaDonDTO
    {
        public string MaHoaDon { get; set; } = null!;
        public string MaDatMon { get; set; } = null!;
        public string? MaBanAn { get; set; }
        public string? MaKhachHang { get; set; }
        public int? SoLuongKhach { get; set; }
        public DateTime ThoiGianDat { get; set; }
        public DateTime? ThoiGianThanhToan { get; set; }
        public string? MaKhuyenMai { get; set; }
        public decimal? TienGiam { get; set; }
		public decimal? TongTien { get; set; }

		public decimal? SoTienCoc { get; set; }
        public decimal? SoTienConLai { get; set; }
		public string? PhuongThucThanhToan { get; set; }
        public string? TrangThaiThanhToan { get; set; }
        public string? MaNhanVien { get; set; }
        public string? GhiChu { get; set; }
    }

    public class HoaDonCreateDTO
    {
        public string MaDatMon { get; set; } = null!;
        public string? MaBanAn { get; set; }
        public string? MaKhachHang { get; set; }
        public int? SoLuongKhach { get; set; }
        public DateTime ThoiGianDat { get; set; }
        public DateTime? ThoiGianThanhToan { get; set; }
        public string? MaKhuyenMai { get; set; }
        public decimal? TongTien { get; set; }
		public decimal? SoTienCoc { get; set; }
		public decimal? SoTienConLai { get; set; }
		public decimal? TienGiam { get; set; }
		public string? PhuongThucThanhToan { get; set; }
        public string? TrangThaiThanhToan { get; set; }
        public string? MaNhanVien { get; set; }
        public string? GhiChu { get; set; }
    }
}
