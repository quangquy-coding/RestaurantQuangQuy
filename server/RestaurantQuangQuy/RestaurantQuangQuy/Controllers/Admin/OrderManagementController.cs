using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class OrderManagementController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;

		public OrderManagementController(RestaurantManagementContext context)
		{
			_context = context;
		}

        // Lấy tất cả đơn hàng cho admin
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
				var orders = await _context.Hoadonthanhtoans
					.Select(h => new
					{
						id = h.MaHoaDon,
						customerName = _context.Khachhangs
							.Where(k => k.MaKhachHang == h.MaKhachHang)
							.Select(k => k.TenKhachHang)
							.FirstOrDefault() ?? "Khách vãng lai",

						tableNumber = _context.Banans
							.Where(b => b.MaBan == h.MaBanAn)
							.Select(b => b.TenBan)
							.FirstOrDefault() ?? "",

						tableId = h.MaBanAn ?? "",
						orderDate = h.ThoiGianDat,

						status = h.TrangThaiThanhToan,


						total = h.TongTien ?? 0,

						paymentMethod = h.PhuongThucThanhToan == "Tiền mặt" ? "cash" :
										h.PhuongThucThanhToan == "Thẻ" ? "card" : "ewallet",

						items = _context.Chitietdondatmons
							.Where(ct => ct.MaDatMon == h.MaDatMon)
							.Select(ct => new
							{
								id = ct.MaMon,
								name = _context.Monans
									.Where(m => m.MaMon == ct.MaMon)
									.Select(m => m.TenMon)
									.FirstOrDefault(),
								quantity = ct.SoLuong,
								price = ct.Gia
							}).ToList(),

                        orderInfo = _context.Dondatmons
							.Where(d => d.MaBanAn == h.MaBanAn)
							.Select(d => new
							{
								maDatMon = d.MaDatMon,
								soDienThoai = d.SoDienThoai,
								trangThai = d.TrangThai,
								soLuong = d.SoLuong,
								tongTien = d.TongTien,
								ghiChu = d.GhiChu
							})
							.FirstOrDefault(),

                        bookingInfo = _context.Datbans
							.Where(db => db.MaBanAn == h.MaBanAn)
							.Select(db => new
							{
								maDatBan = db.MaBanAn,
								soLuongKhach = db.SoLuongKhach,
								thoiGianDat = db.ThoiGianDat,
								thoiGianDen = db.ThoiGianDen,
								trangThai = db.TrangThai,
								ghiChu = db.GhiChu
							})
							.FirstOrDefault(),
						tables = (
								from dbba in _context.DatBanBanAns
								join b in _context.Banans on dbba.MaBanAn equals b.MaBan
								where dbba.MaDatBan == h.MaBanAn
								select new
								{
									maBan = b.MaBan,
									tenBan = b.TenBan,
									viTri = b.ViTri,
									soChoNgoi = b.SoChoNgoi,
									ghiChu = b.GhiChu
								}
							).ToList()

					})
                    .OrderByDescending(h => h.orderDate)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách đơn hàng", error = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetOrdersByCustomer(string customerId)
        {
            try
            {
                var orders = await _context.Hoadonthanhtoans
                    .Where(h => h.MaKhachHang == customerId)
                    .Select(h => new
                    {
                        id = h.MaHoaDon,

                        customerName = _context.Khachhangs
                            .Where(k => k.MaKhachHang == h.MaKhachHang)
                            .Select(k => k.TenKhachHang)
                            .FirstOrDefault() ?? "Khách vãng lai",

                        tableNumber = _context.Banans
                            .Where(b => b.MaBan == h.MaBanAn)
                            .Select(b => b.TenBan)
                            .FirstOrDefault() ?? "",

                        tableId = h.MaBanAn ?? "",
                        orderDate = h.ThoiGianDat,

                        status = h.TrangThaiThanhToan == "Chờ xử lí" ? "pending" :
                                 h.TrangThaiThanhToan == "Đang xử lí" ? "processing" :
                                 h.TrangThaiThanhToan == "Hoàn thành" ? "completed" :
                                 h.TrangThaiThanhToan == "Đã hủy" ? "cancelled" : "pending",

                        total = h.TongTien ?? 0,

                        paymentMethod = h.PhuongThucThanhToan == "Tiền mặt" ? "cash" :
                                        h.PhuongThucThanhToan == "Thẻ" ? "card" : "ewallet",

                        items = _context.Chitietdondatmons
                            .Where(ct => ct.MaDatMon == h.MaDatMon)
                            .Select(ct => new
                            {
                                id = ct.MaMon,
                                name = _context.Monans
                                    .Where(m => m.MaMon == ct.MaMon)
                                    .Select(m => m.TenMon)
                                    .FirstOrDefault(),
                                quantity = ct.SoLuong,
                                price = ct.Gia
                            }).ToList(),

                        bookingInfo = _context.Datbans
                            .Where(db => db.MaBanAn == h.MaBanAn)
                            .Select(db => new
                            {
                                maDatBan = db.MaBanAn,
                                soLuongKhach = db.SoLuongKhach,
                                thoiGianDat = db.ThoiGianDat,
                                thoiGianDen = db.ThoiGianDen,
                                trangThai = db.TrangThai,
                                ghiChu = db.GhiChu
                            })
                            .FirstOrDefault(),
                        tables = (
                                from dbba in _context.DatBanBanAns
                                join b in _context.Banans on dbba.MaBanAn equals b.MaBan
                                where dbba.MaDatBan == h.MaBanAn
                                select new
                                {
                                    maBan = b.MaBan,
                                    tenBan = b.TenBan,
                                    viTri = b.ViTri,
                                    soChoNgoi = b.SoChoNgoi,
                                    ghiChu = b.GhiChu
                                }
                            ).ToList()
                    })
                    .OrderByDescending(h => h.orderDate)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy đơn hàng khách hàng", error = ex.Message });
            }
        }

        // Lấy bàn trống theo thời gian
        [HttpGet("available-tables")]
		public async Task<IActionResult> GetAvailableTables([FromQuery] DateTime? dateTime = null)
		{
			try
			{
				var targetDateTime = dateTime ?? DateTime.Now;

				// Lấy các bàn đang được sử dụng trong khoảng thời gian +/- 2 giờ
				var startTime = targetDateTime.AddHours(-2);
				var endTime = targetDateTime.AddHours(2);

				var occupiedTableIds = await _context.Hoadonthanhtoans
					.Where(h => h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
							   (h.TrangThaiThanhToan == "Chờ xác nhận" ||
								h.TrangThaiThanhToan == "Đang chuẩn bị" ||
								h.TrangThaiThanhToan == "Đang phục vụ") &&
							   !string.IsNullOrEmpty(h.MaBanAn))
					.Select(h => h.MaBanAn)
					.ToListAsync();

				var availableTables = await _context.Banans
					.Where(b => !occupiedTableIds.Contains(b.MaBan))
					.Select(b => new
					{
						id = b.MaBan,
						name = b.TenBan,
						capacity = b.SoChoNgoi,
						location = b.ViTri,
						status = "available"
					})
					.OrderBy(b => b.name)
					.ToListAsync();

				return Ok(availableTables);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách bàn trống", error = ex.Message });
			}
		}

		// Lấy menu items - SỬA LẠI ĐỂ HIỂN THỊ TẤT CẢ MÓN
		[HttpGet("menu-items")]
		public async Task<IActionResult> GetMenuItems()
		{
			try
			{
				var menuItems = await _context.Monans
					.Select(m => new
					{
						id = m.MaMon,
						name = m.TenMon,
						price = m.Gia,
						description = m.MoTa ?? "",
						image = m.HinhAnh ?? "",
						status = m.TinhTrang ?? "Còn",
						category = _context.Danhmucs
							.Where(d => d.MaDanhMuc == m.MaDanhMuc)
							.Select(d => d.TenDanhMuc)
							.FirstOrDefault() ?? "Khác",
						categoryId = m.MaDanhMuc
					})
					.OrderBy(m => m.category)
					.ThenBy(m => m.name)
					.ToListAsync();

				return Ok(menuItems);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy menu", error = ex.Message });
			}
		}

		// Cập nhật trạng thái đơn hàng
		[HttpPut("{orderId}/status")]
		public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] UpdateStatusRequest request)
		{
			try
			{
				var order = await _context.Hoadonthanhtoans.FindAsync(orderId);
				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				// Convert status

				order.TrangThaiThanhToan = request.Status;

				if (request.Status == "completed" || request.Status == "cancelled")
				{
					order.ThoiGianThanhToan = DateTime.Now;
				}

				await _context.SaveChangesAsync();
				return Ok(new { message = "Cập nhật trạng thái thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi cập nhật trạng thái", error = ex.Message });
			}
		}

        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderFoodStatus(string orderId, [FromBody] UpdateStatusRequest request)
        {
            try
            {
              	//cập nhật đơn đặt món 
				var donDatMonUpdate = await _context.Dondatmons
                    .FirstOrDefaultAsync(d => d.MaDatMon == orderId);

				if (donDatMonUpdate != null)
				{
					donDatMonUpdate.TrangThai = request.Status;
                    _context.Dondatmons.Update(donDatMonUpdate);
                    await _context.SaveChangesAsync();
                }
				return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi cập nhật trạng thái", error = ex.Message });
            }
        }

        // Gán bàn cho đơn hàng
        [HttpPut("{orderId}/assign-table")]
		public async Task<IActionResult> AssignTable(string orderId, [FromBody] AssignTableRequest request)
		{
			try
			{
				var order = await _context.Hoadonthanhtoans.FindAsync(orderId);
				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				var table = await _context.Banans.FindAsync(request.TableId);
				if (table == null)
				{
					return NotFound(new { message = "Không tìm thấy bàn" });
				}

				// Kiểm tra bàn có đang được sử dụng trong khoảng thời gian +/- 2 giờ không
				var orderDateTime = order.ThoiGianDat;
				var startTime = orderDateTime.AddHours(-2);
				var endTime = orderDateTime.AddHours(2);

				var isTableOccupied = await _context.Hoadonthanhtoans
					.AnyAsync(h => h.MaBanAn == request.TableId &&
								  h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
								  (h.TrangThaiThanhToan == "Chờ xác nhận" ||
								   h.TrangThaiThanhToan == "Đang chuẩn bị" ||
								   h.TrangThaiThanhToan == "Đang phục vụ") &&
								  h.MaHoaDon != orderId);

				if (isTableOccupied)
				{
					return BadRequest(new { message = "Bàn đã được sử dụng trong khoảng thời gian này" });
				}

				order.MaBanAn = request.TableId;
				await _context.SaveChangesAsync();

				return Ok(new { message = "Gán bàn thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi gán bàn", error = ex.Message });
			}
		}

		// Tạo đơn hàng mới
		[HttpPost]
		public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
		{
			using var transaction = await _context.Database.BeginTransactionAsync();
			try
			{
				if (request.Items == null || !request.Items.Any())
				{
					return BadRequest(new { message = "Đơn hàng phải có ít nhất một món" });
				}

				// Tạo mã đơn đặt món
				var maDatMon = "DDM" + DateTime.Now.ToString("yyyyMMddHHmmss");

				// Tạo đơn đặt món
				var donDatMon = new Dondatmon
				{
					MaDatMon = maDatMon,
					MaKhachHang = request.CustomerId ?? "KH001",
					ThoiGianDat = DateTime.Now,
					TrangThai = "Đã xác nhận",
					GhiChu = request.Notes
				};

				_context.Dondatmons.Add(donDatMon);
				await _context.SaveChangesAsync();

				// Tạo chi tiết đơn đặt món
				foreach (var item in request.Items)
				{
					var chiTiet = new Chitietdondatmon
					{
						MaDatMon = maDatMon,
						MaMon = item.Id,
						SoLuong = item.Quantity,
						Gia = item.Price
					};
					_context.Chitietdondatmons.Add(chiTiet);
				}

				await _context.SaveChangesAsync();

				// Tạo hóa đơn
				var maHoaDon = "HD" + DateTime.Now.ToString("yyyyMMddHHmmss");
				var vietnameseStatus = request.Status;

				var vietnamesePayment = request.PaymentMethod switch
				{
					"cash" => "Tiền mặt",
					"card" => "Thẻ",
					"ewallet" => "Ví điện tử",
					_ => "Tiền mặt"
				};

				// Kiểm tra bàn có trống không nếu có gán bàn
				if (!string.IsNullOrEmpty(request.TableId))
				{
					var orderDateTime = DateTime.Now;
					var startTime = orderDateTime.AddHours(-2);
					var endTime = orderDateTime.AddHours(2);

					var isTableOccupied = await _context.Hoadonthanhtoans
						.AnyAsync(h => h.MaBanAn == request.TableId &&
									  h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
									  (h.TrangThaiThanhToan == "Chờ xác nhận" ||
									   h.TrangThaiThanhToan == "Đang chuẩn bị" ||
									   h.TrangThaiThanhToan == "Đang phục vụ"));

					if (isTableOccupied)
					{
						return BadRequest(new { message = "Bàn đã được sử dụng trong khoảng thời gian này" });
					}
				}

				var hoaDon = new Hoadonthanhtoan
				{
					MaHoaDon = maHoaDon,
					MaDatMon = maDatMon,
					MaKhachHang = request.CustomerId ?? "KH001",
					MaBanAn = string.IsNullOrEmpty(request.TableId) ? null : request.TableId,
					ThoiGianDat = DateTime.Now,
					TongTien = request.Items.Sum(i => i.Price * i.Quantity),
					PhuongThucThanhToan = vietnamesePayment,
					TrangThaiThanhToan = vietnameseStatus,
					GhiChu = request.Notes
				};

				_context.Hoadonthanhtoans.Add(hoaDon);
				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new { message = "Tạo đơn hàng thành công", orderId = maHoaDon });
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				return BadRequest(new { message = "Lỗi khi tạo đơn hàng", error = ex.Message });
			}
		}

		// SỬA LẠI PHƯƠNG THỨC CẬP NHẬT ĐƠN HÀNG
		[HttpPut("{orderId}")]
		public async Task<IActionResult> UpdateOrder(string orderId, [FromBody] UpdateOrderRequest request)
		{
			using var transaction = await _context.Database.BeginTransactionAsync();
			try
			{
				if (request.Items == null || !request.Items.Any())
				{
					return BadRequest(new { message = "Đơn hàng phải có ít nhất một món" });
				}

				// Tìm hóa đơn
				var order = await _context.Hoadonthanhtoans
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				// Kiểm tra đơn đặt món có tồn tại không
				var donDatMon = await _context.Dondatmons
					.FirstOrDefaultAsync(d => d.MaDatMon == order.MaDatMon);

				if (donDatMon == null)
				{
					return BadRequest(new { message = "Không tìm thấy đơn đặt món liên quan" });
				}

				// Cập nhật thông tin đơn hàng
				var vietnameseStatus = request.Status;

				var vietnamesePayment = request.PaymentMethod switch
				{
					"cash" => "Tiền mặt",
					"card" => "Thẻ",
					"ewallet" => "Ví điện tử",
					_ => "Tiền mặt"
				};

				// Kiểm tra bàn có trống không nếu thay đổi bàn
				if (!string.IsNullOrEmpty(request.OrderTableId) && request.OrderTableId != order.MaBanAn)
				{
					var orderDateTime = order.ThoiGianDat;
					var startTime = orderDateTime.AddHours(-2);
					var endTime = orderDateTime.AddHours(2);

					var isTableOccupied = await _context.Hoadonthanhtoans
						.AnyAsync(h => h.MaBanAn == request.OrderTableId &&
									  h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
									  (h.TrangThaiThanhToan == "Chờ xác nhận" ||
									   h.TrangThaiThanhToan == "Đang chuẩn bị" ||
									   h.TrangThaiThanhToan == "Đang phục vụ") &&
									  h.MaHoaDon != orderId);

					if (isTableOccupied)
					{
						return BadRequest(new { message = "Bàn đã được sử dụng trong khoảng thời gian này" });
					}
				}

				// Cập nhật hóa đơn
				order.TrangThaiThanhToan = vietnameseStatus;
				order.PhuongThucThanhToan = vietnamesePayment;
				order.MaBanAn = string.IsNullOrEmpty(request.OrderTableId) ? null : request.OrderTableId;
				order.GhiChu = request.Notes;
				order.TongTien = request.Items.Sum(i => i.Price * i.Quantity);

				// Cập nhật đơn đặt món
				donDatMon.GhiChu = request.Notes;

                // === Cập nhật lại danh sách bàn của đơn ===
                var oldTableLinks = await _context.DatBanBanAns
                    .Where(d => d.MaDatBan == order.MaBanAn)
                    .ToListAsync();

                if (oldTableLinks.Any())
                {
                    _context.DatBanBanAns.RemoveRange(oldTableLinks);
                    await _context.SaveChangesAsync();
                }

                if (request.TableId != null && request.TableId.Any())
                {
                    var newLinks = request.TableId.Select(banId => new DatBanBanAn
                    {
                        MaDatBan = order.MaBanAn,
                        MaBanAn = banId
                    }).ToList();

                    _context.DatBanBanAns.AddRange(newLinks);
                    await _context.SaveChangesAsync();
                }

				//cập nhật số lượng khách trong đơn đặt bàn
				var donDatBan = await _context.Datbans
					.FirstOrDefaultAsync(d => d.MaBanAn == order.MaBanAn);

                if (donDatBan != null)
                {
                    donDatBan.SoLuongKhach = request.Guest;
                    _context.Datbans.Update(donDatBan);
                    await _context.SaveChangesAsync();
                }

				//cập nhật đơn đặt món 
				var donDatMonUpdate = await _context.Dondatmons
                    .FirstOrDefaultAsync(d => d.MaDatMon == order.MaDatMon);

				if (donDatMonUpdate != null)
				{
					donDatMonUpdate.TrangThai = request.StatusOrderFood;
                    _context.Dondatmons.Update(donDatMonUpdate);
                    await _context.SaveChangesAsync();
                }
            
                // Xóa chi tiết cũ
                var oldDetails = await _context.Chitietdondatmons
					.Where(ct => ct.MaDatMon == order.MaDatMon)
					.ToListAsync();

				if (oldDetails.Any())
				{
					_context.Chitietdondatmons.RemoveRange(oldDetails);
					await _context.SaveChangesAsync();
				}

				// Thêm chi tiết mới
				foreach (var item in request.Items)
				{
					// Kiểm tra món ăn có tồn tại không
					var monAn = await _context.Monans.FindAsync(item.Id);
					if (monAn == null)
					{
						return BadRequest(new { message = $"Không tìm thấy món ăn với mã {item.Id}" });
					}

					var chiTiet = new Chitietdondatmon
					{
						MaDatMon = order.MaDatMon,
						MaMon = item.Id,
						SoLuong = item.Quantity,
						Gia = item.Price
					};
					_context.Chitietdondatmons.Add(chiTiet);
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new { message = "Cập nhật đơn hàng thành công" });
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				return BadRequest(new
				{
					message = "Lỗi khi cập nhật đơn hàng",
					error = ex.Message,
					innerException = ex.InnerException?.Message,
					stackTrace = ex.StackTrace
				});
			}
		}

		// Xóa đơn hàng
		[HttpDelete("{orderId}")]
		public async Task<IActionResult> DeleteOrder(string orderId)
		{
			using var transaction = await _context.Database.BeginTransactionAsync();
			try
			{
				var order = await _context.Hoadonthanhtoans
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				// Xóa chi tiết đơn đặt món
				var orderDetails = await _context.Chitietdondatmons
					.Where(ct => ct.MaDatMon == order.MaDatMon)
					.ToListAsync();

				if (orderDetails.Any())
				{
					_context.Chitietdondatmons.RemoveRange(orderDetails);
				}

				// Xóa đơn đặt món
				var donDatMon = await _context.Dondatmons
					.FirstOrDefaultAsync(d => d.MaDatMon == order.MaDatMon);
				if (donDatMon != null)
				{
					_context.Dondatmons.Remove(donDatMon);
				}

				// Xóa hóa đơn
				_context.Hoadonthanhtoans.Remove(order);

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new { message = "Xóa đơn hàng thành công" });
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				return BadRequest(new { message = "Lỗi khi xóa đơn hàng", error = ex.Message });
			}
		}
	}

	// Request DTOs
	public class UpdateStatusRequest
	{
		public string Status { get; set; } = null!;
	}

	public class AssignTableRequest
	{
		public string TableId { get; set; } = null!;
	}

	public class CreateOrderRequest
	{
		public string? CustomerId { get; set; }
		public string CustomerName { get; set; } = null!;
		public string? TableId { get; set; }
		public string Status { get; set; } = "pending";
		public string PaymentMethod { get; set; } = "cash";
		public string? Notes { get; set; }
		public List<OrderItemRequest> Items { get; set; } = new();
	}

	public class UpdateOrderRequest
	{
		public string CustomerName { get; set; } = null!;
        public string? OrderTableId { get; set; }
        public List<string> TableId { get; set; } = new();
        public string Status { get; set; } = "processing";
		public string StatusOrderFood { get; set; } = "pending";
		public string PaymentMethod { get; set; } = "cash";
		public string? Notes { get; set; }
		public int Guest { get; set; }
		public List<OrderItemRequest> Items { get; set; } = new();
	}

	public class OrderItemRequest
	{
		public string Id { get; set; } = null!;
		public string Name { get; set; } = null!;
		public int Quantity { get; set; }
		public decimal Price { get; set; }
	}
}
