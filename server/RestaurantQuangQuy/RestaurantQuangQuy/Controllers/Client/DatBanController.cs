using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.DTO;
using RestaurantQuangQuy.DTO.DatBanDTO;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.DTO.BanAnDTO;

namespace RestaurantQuangQuy.Controllers.Client
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatBanController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;
        public DatBanController(RestaurantManagementContext context)
        {
            _context = context;
        }
        // GET: api/DatBan
        [HttpGet("GetAll")]
        public  IActionResult GetDatBan()
        {
            try
            {
                // Lấy tất cả các bản ghi Datban và include liên kết tới bảng trung gian DatBanBanAn để lấy thông tin các Banan
                var datBanList = _context.Datbans
                    .Include(d => d.DatBanBanAns)
                    .ThenInclude(dbba => dbba.Banans)
                    .ToList();

                // Kiểm tra nếu không có dữ liệu
                if (datBanList == null || !datBanList.Any())
                {
                    return NotFound("No DatBan records found.");
                }

                // Ánh xạ sang DTO
                var datBanDTOs = datBanList.Select(db => new DatBanDTO
                {
                    MaBanAn = db.MaBanAn,
                    MaKhachHang = db.MaKhachHang,
                    SoLuongKhach = db.SoLuongKhach,
                    ThoiGianDat = db.ThoiGianDat,
                    ThoiGianDen = db.ThoiGianDen,
                    TrangThai = db.TrangThai,
                    GhiChu = db.GhiChu,

                    // Lấy thông tin các bàn ăn
                    Banans = db.DatBanBanAns.Select(b => new BanAnDTO
                    {
                        MaBan = b.Banans.MaBan,
                        TenBan = b.Banans.TenBan,
                        ViTri = b.Banans.ViTri,
                        TrangThai = b.Banans.TrangThai,
                        SoGhe = b.Banans.SoChoNgoi,
                        GhiChu = b.Banans.GhiChu ?? ""
                    }).ToList()
                }).ToList();

                return Ok(datBanDTOs);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nếu cần thiết
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        // Lấy thông tin đặt bàn theo mã khách hàng hoặc mã bàn
        [HttpGet("GetByMaKhachHangOrMaBan/{maKhachHang}/{maBan}")]
        public IActionResult GetDatBanByMaKhachHangOrMaBan(string maKhachHang, string maBan)
        {
            try
            {
                // Truy vấn cơ sở dữ liệu lấy thông tin đặt bàn, liên kết tới bảng trung gian DatBanBanAn và Banan
                var datBanList = _context.Datbans
                    .Include(db => db.DatBanBanAns)
                    .ThenInclude(dba => dba.Banans)
                    .Where(db => db.MaKhachHang == maKhachHang || db.DatBanBanAns.Any(dba => dba.Banans.MaBan == maBan))
                    .ToList();

                // Nếu không tìm thấy thông tin
                if (datBanList == null || !datBanList.Any())
                {
                    return NotFound("No DatBan records found for the given MaKhachHang or MaBan.");
                }

                // Ánh xạ sang DTO
                var datBanDTOs = datBanList.Select(db => new DatBanDTO
                {
                    MaBanAn = db.MaBanAn,
                    MaKhachHang = db.MaKhachHang,
					SoLuongKhach = db.SoLuongKhach,
					ThoiGianDat = db.ThoiGianDat,
                    ThoiGianDen = db.ThoiGianDen,
                    TrangThai = db.TrangThai,
                    GhiChu = db.GhiChu,

                    // Thông tin các bàn ăn liên kết
                    Banans = db.DatBanBanAns.Select(dba => new BanAnDTO
                    {
                        MaBan = dba.Banans.MaBan,
                        TenBan = dba.Banans.TenBan,
                        ViTri = dba.Banans.ViTri,
                        TrangThai = dba.Banans.TrangThai,
                        SoGhe = dba.Banans.SoChoNgoi,
                        GhiChu = dba.Banans.GhiChu ?? ""
                    }).ToList()
                }).ToList();

                return Ok(datBanDTOs);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nếu cần
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        // POST: api/DatBan
        [HttpPost("Create")]
        public IActionResult CreateDatBan([FromBody] DatBanCreateDTO datBanDTO)
        {
            try
            {
                if (datBanDTO == null)
                {
                    return BadRequest("Invalid DatBan data.");
                }

                // Randomly generate MaBanAn start with "BA" with 10 characters
                var maBanAn = "BA" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

                // Check if the MaBanAn already exists
                var existingDatBan = _context.Datbans.FirstOrDefault(db => db.MaBanAn == maBanAn);
                if (existingDatBan != null)
                {
                    return Conflict("MaBanAn already exists.");
                }

                // Check if the MaKhachHang exists
                var existingKhachHang = _context.Khachhangs.FirstOrDefault(kh => kh.MaKhachHang == datBanDTO.MaKhachHang);
                if (existingKhachHang == null)
                {
                    return NotFound("MaKhachHang not found.");
                }

                // Check if the ThoiGianDen is in the future
                if (datBanDTO.ThoiGianDen <= DateTime.Now)
                {
                    return BadRequest("ThoiGianDen must be in the future.");
                }

                // Check if the ThoiGianDen is after ThoiGianDat
                if (datBanDTO.ThoiGianDen <= datBanDTO.ThoiGianDat)
                {
                    return BadRequest("ThoiGianDen must be after ThoiGianDat.");
                }

                // Map DTO to DatBan entity
                var datBan = new Datban
                {
                    MaBanAn = maBanAn,
                    MaKhachHang = datBanDTO.MaKhachHang,
					SoLuongKhach = datBanDTO.SoLuongKhach,
					ThoiGianDat = datBanDTO.ThoiGianDat,
                    ThoiGianDen = datBanDTO.ThoiGianDen,
                    TrangThai = datBanDTO.TrangThai,
                    GhiChu = datBanDTO.GhiChu
                };

                // Thêm vào bảng Datban
                _context.Datbans.Add(datBan);

                //// Thêm vào bảng DatBanBanAn nếu có danh sách bàn
                //if (datBanDTO.MaBans != null && datBanDTO.MaBans.Any())
                //{
                //    foreach (var maBan in datBanDTO.MaBans)
                //    {
                //        var existingBan = _context.Banans.FirstOrDefault(b => b.MaBan == maBan);
                //        if (existingBan == null)
                //        {
                //            return NotFound($"MaBan '{maBan}' not found.");
                //        }

                //        var datBanBanAn = new DatBanBanAn
                //        {
                //            MaDatBan = maBanAn,
                //            MaBanAn = maBan
                //        };
                //        _context.DatBanBanAns.Add(datBanBanAn);
                //    }
                //}

                // Lưu tất cả vào database
                _context.SaveChanges();

                // Trả về thông tin DatBan mới tạo
                return CreatedAtAction(nameof(GetDatBan), new { id = datBan.MaBanAn }, datBan);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        // PUT: api/DatBan/Update/{id}
        [HttpPut("Update")]
        public IActionResult UpdateDatBan([FromBody] DatBanUpdateDTO datBanDTO)
        {
            try
            {
                if (datBanDTO == null)
                {
                    return BadRequest("Invalid DatBan data.");
                }

                // Tìm đối tượng DatBan cần cập nhật
                var existingDatBan = _context.Datbans.FirstOrDefault(db => db.MaBanAn == datBanDTO.MaBanAn);
                if (existingDatBan == null)
                {
                    return NotFound("DatBan not found.");
                }

                // Kiểm tra khách hàng tồn tại hay không
                var existingKhachHang = _context.Khachhangs.FirstOrDefault(kh => kh.MaKhachHang == datBanDTO.MaKhachHang);
                if (existingKhachHang == null)
                {
                    return NotFound("MaKhachHang not found.");
                }

                // Kiểm tra thời gian
                if (datBanDTO.ThoiGianDen <= DateTime.Now)
                {
                    return BadRequest("ThoiGianDen must be in the future.");
                }
                if (datBanDTO.ThoiGianDen <= datBanDTO.ThoiGianDat)
                {
                    return BadRequest("ThoiGianDen must be after ThoiGianDat.");
                }

                // **Bước 1:** Cập nhật thông tin chính của DatBan
                existingDatBan.MaKhachHang = datBanDTO.MaKhachHang;
				existingDatBan.SoLuongKhach = datBanDTO.SoLuongKhach;
				existingDatBan.ThoiGianDat = datBanDTO.ThoiGianDat;
                existingDatBan.ThoiGianDen = datBanDTO.ThoiGianDen;
                existingDatBan.TrangThai = datBanDTO.TrangThai;
                existingDatBan.GhiChu = datBanDTO.GhiChu;

                // **Bước 2:** Xóa hết liên kết cũ trong bảng DatBanBanAn
                var existingLinks = _context.DatBanBanAns.Where(dba => dba.MaDatBan == datBanDTO.MaBanAn).ToList();
                if (existingLinks.Any())
                {
                    _context.DatBanBanAns.RemoveRange(existingLinks);
                }

                // **Bước 3:** Thêm lại danh sách bàn mới vào bảng trung gian
                if (datBanDTO.MaBans != null && datBanDTO.MaBans.Any())
                {
                    foreach (var maBan in datBanDTO.MaBans)
                    {
                        // Kiểm tra bàn có tồn tại hay không
                        var existingBan = _context.Banans.FirstOrDefault(b => b.MaBan == maBan);
                        if (existingBan == null)
                        {
                            return NotFound($"MaBan '{maBan}' not found.");
                        }

                        // Thêm mới liên kết
                        var newDatBanBanAn = new DatBanBanAn
                        {
                            MaDatBan = datBanDTO.MaBanAn,
                            MaBanAn = maBan
                        };
                        _context.DatBanBanAns.Add(newDatBanBanAn);
                    }
                }

                // **Bước 4:** Lưu toàn bộ thay đổi vào Database
                _context.SaveChanges();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        // Update trạng thái đặt bàn
        [HttpPut("UpdateTrangThai/{id}")]
        public IActionResult UpdateTrangThai(string id, [FromBody] string trangThai)
        {
            // Logic to update the status of an existing DatBan record
            try
            {
                if (string.IsNullOrEmpty(trangThai))
                {
                    return BadRequest("Invalid TrangThai data.");
                }
                // Find the existing DatBan record by id
                var existingDatBan = _context.Datbans.FirstOrDefault(db => db.MaBanAn == id);
                if (existingDatBan == null)
                {
                    return NotFound("DatBan not found.");
                }
                // Update the TrangThai of the existing DatBan record
                existingDatBan.TrangThai = trangThai;
                // Save changes to the database
                _context.SaveChanges();
                return NoContent();
            }
            catch (Exception ex)
            {
                // Handle exception
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        // DELETE: api/DatBan/Delete/{id}
        [HttpDelete("Delete/{id}")]
        public IActionResult DeleteDatBan(string id)
        {
            try
            {
                // **Bước 1:** Tìm đối tượng DatBan cần xóa
                var existingDatBan = _context.Datbans.FirstOrDefault(db => db.MaBanAn == id);
                if (existingDatBan == null)
                {
                    return NotFound("DatBan not found.");
                }

                // **Bước 2:** Tìm tất cả các liên kết của DatBan này trong bảng DatBanBanAn
                var existingLinks = _context.DatBanBanAns.Where(dba => dba.MaDatBan == id).ToList();

                if (existingLinks.Any())
                {
                    // **Bước 3:** Xóa toàn bộ liên kết khỏi bảng DatBanBanAn
                    _context.DatBanBanAns.RemoveRange(existingLinks);
                }

                // **Bước 4:** Xóa đối tượng DatBan khỏi bảng Datban
                _context.Datbans.Remove(existingDatBan);

                // **Bước 5:** Lưu thay đổi vào Database
                _context.SaveChanges();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
    }
}
