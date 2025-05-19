using RestaurantQuangQuy.DTO.MonAnDTO;
using RestaurantQuangQuy.Models;
using System.ComponentModel.DataAnnotations;

namespace RestaurantQuangQuy.DTO.DatMonAnDTO
{
    public class DatMonAnDTO
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

        public List<ChiTietDonDatMonDTO> ChiTietDatMonAns { get; set; } = new List<ChiTietDonDatMonDTO>();
    }
    public class ChiTietDonDatMonDTO
    {
        public string MaDatMon { get; set; } = null!;

        public string MaMon { get; set; } = null!;

        public int SoLuong { get; set; }

        public decimal Gia { get; set; }

        public decimal? TongTien { get; set; }
    }

    public class DatMonAnResponsiveDTO
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

        public List<ChiTietDonDatMonResponsiveDTO> ChiTietDatMonAns { get; set; } = new List<ChiTietDonDatMonResponsiveDTO>();
    }

    public class ChiTietDonDatMonResponsiveDTO {
        public string MaDatMon { get; set; } = null!;
        public string MaMon { get; set; } = null!;
        public int SoLuong { get; set; }
        public decimal Gia { get; set; }
        public decimal? TongTien { get; set; }
        public MonAnResponsiveDTO MonAn { get; set; } = new MonAnResponsiveDTO();
    }

    public class MonAnResponsiveDTO
    {
        public string? MaMon { get; set; } // MaMon chỉ cần khi sửa

        [Required(ErrorMessage = "Tên món không được để trống.")]
        public string TenMon { get; set; }

        public string? MoTa { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá phải lớn hơn hoặc bằng 0.")]
        public decimal Gia { get; set; }

        public string? HinhAnh { get; set; }

        public string? ThoiGianMon { get; set; }

        [Required(ErrorMessage = "Tình trạng không được để trống.")]
        public string TinhTrang { get; set; }

        [Required(ErrorMessage = "Mã danh mục không được để trống.")]
        public string MaDanhMuc { get; set; }

        public string? TenDanhMuc { get; set; } // Không cần ràng buộc, chỉ dùng hiển thị
        public string? ThanhPhan { get; set; }  // Ví dụ: "Cơm, Tôm, Mực, Cua, Sò điệp"
        public string? DinhDuong { get; set; }  // Có thể lưu JSON dưới dạng string
        public string? DiUng { get; set; }
    }
}
