using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.DatMonAnDTO;
using RestaurantQuangQuy.DTO.MonAnDTO;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Client
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatMonController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public DatMonController(RestaurantManagementContext context)
        {
            _context = context;
        }

        [HttpGet("CheckMaBanAn/{maBanAn}")]
        public IActionResult CheckMaBanAn(string maBanAn)
        {
            if (string.IsNullOrEmpty(maBanAn))
            {
                return BadRequest(new { message = "Mã bàn ăn không hợp lệ" });
            }

            var exists = _context.Datbans.Any(b => b.MaBanAn == maBanAn);
            return Ok(new { exists });
        }

        [HttpGet("GetAllDatMon")]
        public IActionResult GetAllDatMon()
        {
            try
            {
                // Lấy dữ liệu từ Database
                var datMonList = _context.Dondatmons
                    .Include(d => d.Chitietdondatmons)
                        .ThenInclude(c => c.MaMonNavigation)
                    .ToList();

                // Kiểm tra xem có đơn đặt món nào không
                if (datMonList == null || !datMonList.Any())
                {
                    return NotFound(new { message = "Không tìm thấy đơn đặt món" });
                }
                // Mapping sang DTO
                var result = datMonList.Select(don => new DatMonAnResponsiveDTO
                {
                    MaDatMon = don.MaDatMon,
                    MaBanAn = don.MaBanAn,
                    MaKhachHang = don.MaKhachHang,
                    SoDienThoai = don.SoDienThoai,
                    ThoiGianDat = don.ThoiGianDat,
                    TrangThai = don.TrangThai,
                    SoLuong = don.SoLuong,
                    TongTien = don.TongTien,
                    GhiChu = don.GhiChu,
                    ChiTietDatMonAns = don.Chitietdondatmons.Select(ct => new ChiTietDonDatMonResponsiveDTO
                    {
                        MaDatMon = ct.MaDatMon,
                        MaMon = ct.MaMon,
                        SoLuong = ct.SoLuong,
                        Gia = ct.Gia,
                        TongTien = ct.TongTien,
                        MonAn = new MonAnResponsiveDTO
                        {
                            TenMon = ct.MaMonNavigation.TenMon,
                            HinhAnh = ct.MaMonNavigation.HinhAnh,
                            MoTa = ct.MaMonNavigation.MoTa,
                            Gia = ct.MaMonNavigation.Gia,
                            ThoiGianMon = ct.MaMonNavigation.ThoiGianMon,
                            TinhTrang = ct.MaMonNavigation.TinhTrang,
                            DinhDuong = ct.MaMonNavigation.DinhDuong,
                            ThanhPhan = ct.MaMonNavigation.ThanhPhan,
                            DiUng = ct.MaMonNavigation.DiUng,
                        }
                    }).ToList()
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách đặt món", error = ex.Message });
            }
        }

        [HttpGet("GetDatMonById/{id}")]
        public IActionResult GetDatMonById(string id)
        {
            try
            {
                // Kiểm tra điều kiện đầu vào
                if (string.IsNullOrEmpty(id))
                {
                    return BadRequest(new { message = "Mã đơn đặt món không hợp lệ" });
                }
                // Lấy dữ liệu từ Database
                var datMon = _context.Dondatmons
                    .Include(d => d.Chitietdondatmons)
                        .ThenInclude(c => c.MaMonNavigation)
                    .FirstOrDefault(d => d.MaDatMon == id);
                if (datMon == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn đặt món" });
                }
                // Mapping sang DTO
                var result = new DatMonAnResponsiveDTO
                {
                    MaDatMon = datMon.MaDatMon,
                    MaBanAn = datMon.MaBanAn,
                    MaKhachHang = datMon.MaKhachHang,
                    SoDienThoai = datMon.SoDienThoai,
                    ThoiGianDat = datMon.ThoiGianDat,
                    TrangThai = datMon.TrangThai,
                    SoLuong = datMon.SoLuong,
                    TongTien = datMon.TongTien,
                    GhiChu = datMon.GhiChu,
                    ChiTietDatMonAns = datMon.Chitietdondatmons.Select(ct => new ChiTietDonDatMonResponsiveDTO
                    {
                        MaDatMon = ct.MaDatMon,
                        MaMon = ct.MaMon,
                        SoLuong = ct.SoLuong,
                        Gia = ct.Gia,
                        TongTien = ct.TongTien,
                        MonAn = new MonAnResponsiveDTO
                        {
                            TenMon = ct.MaMonNavigation.TenMon,
                            HinhAnh = ct.MaMonNavigation.HinhAnh,
                            MoTa = ct.MaMonNavigation.MoTa,
                            Gia = ct.MaMonNavigation.Gia,
                            ThoiGianMon = ct.MaMonNavigation.ThoiGianMon,
                            TinhTrang = ct.MaMonNavigation.TinhTrang,
                            DinhDuong = ct.MaMonNavigation.DinhDuong,
                            ThanhPhan = ct.MaMonNavigation.ThanhPhan,
                            DiUng = ct.MaMonNavigation.DiUng,
                        }
                    }).ToList()
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy đơn đặt món", error = ex.Message });
            }
        }

        [HttpPost("CreateDatMon")]
        public IActionResult CreateDatMon([FromBody] DatMonAnDTO datMonAnDTO)
        {
            try
            {
                if (datMonAnDTO == null)
                {
                    return BadRequest(new { message = "Đơn đặt món không hợp lệ" });
                }

                var isBanAnExists = _context.Datbans.Any(b => b.MaBanAn == datMonAnDTO.MaBanAn);
                if (!isBanAnExists)
                {
                    return NotFound(new { message = "Không tìm thấy bàn ăn với mã " + datMonAnDTO.MaBanAn });
                }

                // Tạo mã đơn đặt món mới
                var random = new Random();
                var randomString = "DM" + new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8)
                    .Select(s => s[random.Next(s.Length)]).ToArray());;
                // Mapping từ DTO sang Entity
                var datMon = new Dondatmon
                {
                    MaDatMon = randomString,
                    MaBanAn = datMonAnDTO.MaBanAn,
                    MaKhachHang = datMonAnDTO.MaKhachHang,
                    SoDienThoai = datMonAnDTO.SoDienThoai,
                    ThoiGianDat = DateTime.Now,
                    TrangThai = "pending",
                    SoLuong = datMonAnDTO.SoLuong,
                    TongTien = datMonAnDTO.TongTien,
                    GhiChu = datMonAnDTO.GhiChu
                };
                _context.Dondatmons.Add(datMon);

                // Lưu chi tiết đơn đặt món
                foreach (var chiTiet in datMonAnDTO.ChiTietDatMonAns)
                {
                    var chiTietEntity = new Chitietdondatmon
                    {
                        MaDatMon = datMon.MaDatMon,
                        MaMon = chiTiet.MaMon,
                        SoLuong = chiTiet.SoLuong,
                        Gia = chiTiet.Gia,
                        TongTien = chiTiet.TongTien
                    };
                    _context.Chitietdondatmons.Add(chiTietEntity);
                }
                _context.SaveChanges();
                return Ok(new
                {
                    maDatMon = datMon.MaDatMon,
                    maBanAn = datMon.MaBanAn
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi đặt món", error = ex.Message });
            }
        }
        [HttpPut("UpdateDatMon/{id}")]
        public IActionResult UpDateDatMon(string id,[FromBody] DatMonAnDTO datMonAnDTO)
        {
            try
            {
                if (datMonAnDTO == null)
                {
                    return BadRequest(new { message = "Đơn đặt món không hợp lệ" });
                }
                // Lấy đơn đặt món từ Database
                var datMon = _context.Dondatmons
                    .Include(d => d.Chitietdondatmons)
                    .FirstOrDefault(d => d.MaDatMon == id);
                // Lấy dữ liệu từ Database
                if (datMon == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn đặt món" });
                }
                // Cập nhật thông tin đơn đặt món
                datMon.MaBanAn = datMonAnDTO.MaBanAn;
                datMon.MaKhachHang = datMonAnDTO.MaKhachHang;
                datMon.SoDienThoai = datMonAnDTO.SoDienThoai;
                datMon.ThoiGianDat = datMonAnDTO.ThoiGianDat;
                datMon.TrangThai = datMonAnDTO.TrangThai;
                datMon.SoLuong = datMonAnDTO.SoLuong;
                datMon.TongTien = datMonAnDTO.TongTien;
                datMon.GhiChu = datMonAnDTO.GhiChu;
                // Cập nhật chi tiết đơn đặt món
                foreach (var chiTiet in datMon.Chitietdondatmons)
                {
                    var chiTietDTO = datMonAnDTO.ChiTietDatMonAns.FirstOrDefault(ct => ct.MaMon == chiTiet.MaMon);
                    if (chiTietDTO != null)
                    {
                        chiTiet.SoLuong = chiTietDTO.SoLuong;
                        chiTiet.Gia = chiTietDTO.Gia;
                        chiTiet.TongTien = chiTietDTO.TongTien;
                    }
                }
                // Xóa các chi tiết không còn trong danh sách
                var chiTietIds = datMonAnDTO.ChiTietDatMonAns.Select(ct => ct.MaMon).ToList();
                var chiTietToDelete = datMon.Chitietdondatmons.Where(ct => !chiTietIds.Contains(ct.MaMon)).ToList();
                foreach (var chiTiet in chiTietToDelete)
                {
                    _context.Chitietdondatmons.Remove(chiTiet);
                }
                // Thêm các chi tiết mới
                foreach (var chiTiet in datMonAnDTO.ChiTietDatMonAns)
                {
                    if (!datMon.Chitietdondatmons.Any(ct => ct.MaMon == chiTiet.MaMon))
                    {
                        var chiTietEntity = new Chitietdondatmon
                        {
                            MaDatMon = datMon.MaDatMon,
                            MaMon = chiTiet.MaMon,
                            SoLuong = chiTiet.SoLuong,
                            Gia = chiTiet.Gia,
                            TongTien = chiTiet.TongTien
                        };
                        _context.Chitietdondatmons.Add(chiTietEntity);
                    }
                }
                // Lưu thay đổi vào Database
                _context.SaveChanges();
                return Ok(datMon);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi cập nhật đơn đặt món", error = ex.Message });
            }
        }

        [HttpDelete("DeleteDatMon/{id}")]
        public IActionResult DeleteDatMon(string id)
        {
            try
            {
                // Kiểm tra điều kiện đầu vào
                if(string.IsNullOrEmpty(id))
                {
                    return BadRequest(new { message = "Mã đơn đặt món không hợp lệ" });
                }
                // Lấy đơn đặt món từ Database
                var datMon = _context.Dondatmons
                    .Include(d => d.Chitietdondatmons)
                    .FirstOrDefault(d => d.MaDatMon == id);
                if (datMon == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn đặt món" });
                }
                // Xóa chi tiết đơn đặt món
                _context.Chitietdondatmons.RemoveRange(datMon.Chitietdondatmons);
                // Xóa đơn đặt món
                _context.Dondatmons.Remove(datMon);
                // Lưu thay đổi vào Database
                _context.SaveChanges();
                return Ok(new { message = "Xóa đơn đặt món thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa đơn đặt món", error = ex.Message });
            }
        }
    }
}
