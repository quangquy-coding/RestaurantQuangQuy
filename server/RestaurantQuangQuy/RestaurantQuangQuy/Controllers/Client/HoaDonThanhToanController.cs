using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantQuangQuy.DTO.HoaDonDTO;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Client
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoaDonThanhToanController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;
        public HoaDonThanhToanController(RestaurantManagementContext context)
        {
            _context = context;
        }

        //lấy danh sách hóa đơn
        [HttpGet]
        public IActionResult GetAllHoaDon()
        {
            try{
                //lấy danh sách hóa đơn
                var hoadon = _context.Hoadonthanhtoans
                    .Select(h => new
                    {
                        h.MaHoaDon,
                        h.MaDatMon,
                        h.MaBanAn,
                        h.MaKhachHang,
                        h.SoLuongKhach,
                        h.ThoiGianDat,
                        h.ThoiGianThanhToan,
                        h.MaKhuyenMai,
                        h.TongTien,
                        h.PhuongThucThanhToan,
                        h.TrangThaiThanhToan,
                        h.MaNhanVien,
                        h.GhiChu
                    })
                    .ToList();
                //kiểm tra nếu không có hóa đơn nào
                if (hoadon == null || hoadon.Count == 0)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
                }
                //trả về danh sách hóa đơn
                return Ok(new { message = "Lấy danh sách hóa đơn thành công", data = hoadon });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách hóa đơn", error = ex.Message });
            }
        }

        //lấy hóa đơn theo mã hóa đơn
        [HttpGet("{mahoadon}")]
        public IActionResult GetHoaDonById(string id)
        {
            try
            {
                //lấy hóa đơn theo mã hóa đơn
                var hoadon = _context.Hoadonthanhtoans
                    .Where(h => h.MaHoaDon == id)
                    .Select(h => new
                    {
                        h.MaHoaDon,
                        h.MaDatMon,
                        h.MaBanAn,
                        h.MaKhachHang,
                        h.SoLuongKhach,
                        h.ThoiGianDat,
                        h.ThoiGianThanhToan,
                        h.MaKhuyenMai,
                        h.TongTien,
                        h.PhuongThucThanhToan,
                        h.TrangThaiThanhToan,
                        h.MaNhanVien,
                        h.GhiChu
                    })
                    .FirstOrDefault();
                //kiểm tra nếu không có hóa đơn nào
                if (hoadon == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
                }
                //trả về hóa đơn
                return Ok(new { message = "Lấy hóa đơn thành công", data = hoadon });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy hóa đơn", error = ex.Message });
            }
        }

        //thêm hóa đơn
        [HttpPost]
        public IActionResult CreateHoaDon([FromBody] HoaDonCreateDTO hoadondto)
        {
            try
            {
                if (hoadondto == null)
                {
                    return BadRequest(new { message = "Dữ liệu hóa đơn không hợp lệ" });
                }
                //tạo mã hóa đơn random 10 kí tự bắt đầu bằng HDTT
                string mahoadon = "HDTT" + Guid.NewGuid().ToString().Substring(0, 6);
                //mapping từ DTO sang entity
                var hoadon = new Hoadonthanhtoan
                {
                    MaHoaDon = mahoadon,
                    MaDatMon = hoadondto.MaDatMon,
                    MaBanAn = hoadondto.MaBanAn,
                    MaKhachHang = hoadondto.MaKhachHang,
                    SoLuongKhach = hoadondto.SoLuongKhach,
                    ThoiGianDat = hoadondto.ThoiGianDat,
                    ThoiGianThanhToan = hoadondto.ThoiGianThanhToan,
                    MaKhuyenMai = hoadondto.MaKhuyenMai,
                    TongTien = hoadondto.TongTien,
                    PhuongThucThanhToan = hoadondto.PhuongThucThanhToan,
                    TrangThaiThanhToan = hoadondto.TrangThaiThanhToan,
                    MaNhanVien = hoadondto.MaNhanVien,
                    GhiChu = hoadondto.GhiChu
                };
                //thêm hóa đơn
                _context.Hoadonthanhtoans.Add(hoadon);
                _context.SaveChanges();
                return Ok(new { message = "Thêm hóa đơn thành công", data = hoadon });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi thêm hóa đơn", error = ex.Message });
            }
        }

        //cập nhật hóa đơn
        [HttpPut("{mahoadon}")]
        public IActionResult UpdateHoaDon(string maHoaDon, [FromBody] HoaDonCreateDTO hoadondto)
        {
            try
            {
                //kiểm tra điều kiện nếu mã hóa đơn không hợp lệ
                if (string.IsNullOrEmpty(maHoaDon))
                {
                    return BadRequest(new { message = "Mã hóa đơn không hợp lệ" });
                }
                if (hoadondto == null)
                {
                    return BadRequest(new { message = "Dữ liệu hóa đơn không hợp lệ" });
                }
                //lấy hóa đơn theo mã hóa đơn
                var hoadon = _context.Hoadonthanhtoans.FirstOrDefault(h => h.MaHoaDon == maHoaDon);
                //kiểm tra nếu không có hóa đơn nào
                if (hoadon == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
                }
                //mapping từ DTO sang entity
                hoadon.MaDatMon = hoadondto.MaDatMon;
                hoadon.MaBanAn = hoadondto.MaBanAn;
                hoadon.MaKhachHang = hoadondto.MaKhachHang;
                hoadon.SoLuongKhach = hoadondto.SoLuongKhach;
                hoadon.ThoiGianDat = hoadondto.ThoiGianDat;
                hoadon.ThoiGianThanhToan = hoadondto.ThoiGianThanhToan;
                hoadon.MaKhuyenMai = hoadondto.MaKhuyenMai;
                hoadon.TongTien = hoadondto.TongTien;
                hoadon.PhuongThucThanhToan = hoadondto.PhuongThucThanhToan;
                hoadon.TrangThaiThanhToan = hoadondto.TrangThaiThanhToan;
                hoadon.MaNhanVien = hoadondto.MaNhanVien;
                hoadon.GhiChu = hoadondto.GhiChu;
                //cập nhật hóa đơn
                _context.Hoadonthanhtoans.Update(hoadon);
                _context.SaveChanges();
                return Ok(new { message = "Cập nhật hóa đơn thành công", data = hoadon });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi cập nhật hóa đơn", error = ex.Message });
            }
        }

        //xóa hóa đơn
        [HttpDelete("{mahoadon}")]
        public IActionResult DeleteHoaDon(string maHoaDon)
        {
            try
            {
                //kiểm tra nếu mã hóa đơn không hợp lệ
                if (string.IsNullOrEmpty(maHoaDon))
                {
                    return BadRequest(new { message = "Mã hóa đơn không hợp lệ" });
                }
                //lấy hóa đơn theo mã hóa đơn
                var hoadon = _context.Hoadonthanhtoans.FirstOrDefault(h => h.MaHoaDon == maHoaDon);
                //kiểm tra nếu không có hóa đơn nào
                if (hoadon == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nào" });
                }
                //xóa hóa đơn
                _context.Hoadonthanhtoans.Remove(hoadon);
                _context.SaveChanges();
                return Ok(new { message = "Xóa hóa đơn thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa hóa đơn", error = ex.Message });
            }
        }
    }
}
