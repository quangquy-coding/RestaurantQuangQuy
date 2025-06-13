using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantQuangQuy.Models;
using RestaurantQuangQuy.Services;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;
using System.Xml.Linq;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class OrderManagementController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		private readonly IEmailService _emailService;

		public OrderManagementController(RestaurantManagementContext context, IEmailService emailService)
		{
			_context = context;
			_emailService = emailService;
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
						customerId = h.MaKhachHang,
						customerName = _context.Khachhangs
							.Where(k => k.MaKhachHang == h.MaKhachHang)
							.Select(k => k.TenKhachHang)
							.FirstOrDefault() ?? "Khách vãng lai",
						customerPhone = _context.Khachhangs
							.Where(k => k.MaKhachHang == h.MaKhachHang)
							.Select(k => k.SoDienThoai)
							.FirstOrDefault() ?? "",
						customerEmail = _context.Khachhangs
							.Where(k => k.MaKhachHang == h.MaKhachHang)
							.Select(k => k.Email)
							.FirstOrDefault() ?? "",
						tableNumber = _context.Banans
							.Where(b => b.MaBan == h.MaBanAn)
							.Select(b => b.TenBan)
							.FirstOrDefault() ?? "",
						tableId = h.MaBanAn ?? "",
						orderDate = h.ThoiGianDat,
						paymentDate = h.ThoiGianThanhToan,
						status = h.TrangThaiThanhToan,
						total = h.TongTien ?? 0,
						deposit = h.SoTienCoc ?? 0,
						remaining = h.SoTienConLai ?? 0,
						discount = h.TienGiam ?? 0,
						paymentMethod = h.PhuongThucThanhToan == "Tiền mặt" ? "cash" :
							h.PhuongThucThanhToan == "VNPay" ? "VNPay" : "cash",
						promoCode = h.MaKhuyenMai,
						staffId = h.MaNhanVien,
						notes = h.GhiChu,
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
								price = ct.Gia,
								total = ct.TongTien
							}).ToList(),
						orderInfo = _context.Dondatmons
							.Where(d => d.MaDatMon == h.MaDatMon)
							.Select(d => new
							{
								maDatMon = d.MaDatMon,
								soDienThoai = d.SoDienThoai,
								trangThai = d.TrangThai == null ? "pending" :
									d.TrangThai.Trim() == "Chờ xử lí" ? "pending" :
									d.TrangThai.Trim() == "Đang xử lí" ? "processing" :
									d.TrangThai.Trim() == "Hoàn thành" ? "completed" :
									d.TrangThai.Trim() == "Đã hủy" ? "cancelled" : d.TrangThai.ToLower(),
								soLuong = d.SoLuong,
								tongTien = d.TongTien,
								thoiGianDat = d.ThoiGianDat,
								ghiChu = d.GhiChu,
								canComplete = d.ThoiGianDat <= DateTime.Now // Kiểm tra có thể hoàn thành không
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
								ghiChu = db.GhiChu,
								canServe = db.ThoiGianDen <= DateTime.Now // Kiểm tra có thể phục vụ không
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
						).ToList(),
						canExportPdf = h.TrangThaiThanhToan == "completed" &&
									  _context.Dondatmons.Any(d => d.MaDatMon == h.MaDatMon && d.TrangThai == "Hoàn thành")
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
						paymentDate = h.ThoiGianThanhToan,
						status = h.TrangThaiThanhToan,
						total = h.TongTien ?? 0,
						deposit = h.SoTienCoc ?? 0,
						remaining = h.SoTienConLai ?? 0,
						discount = h.TienGiam ?? 0,
						paymentMethod = h.PhuongThucThanhToan,
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
								price = ct.Gia,
								total = ct.TongTien
							}).ToList(),
						orderInfo = _context.Dondatmons
							.Where(d => d.MaDatMon == h.MaDatMon)
							.Select(d => new
							{
								maDatMon = d.MaDatMon,
								trangThai = d.TrangThai,
								canComplete = d.ThoiGianDat <= DateTime.Now
							})
							.FirstOrDefault(),
						bookingInfo = _context.Datbans
							.Where(db => db.MaBanAn == h.MaBanAn)
							.Select(db => new
							{
								thoiGianDen = db.ThoiGianDen,
								canServe = db.ThoiGianDen <= DateTime.Now
							})
							.FirstOrDefault(),
						canExportPdf = h.TrangThaiThanhToan == "completed" &&
									  _context.Dondatmons.Any(d => d.MaDatMon == h.MaDatMon && d.TrangThai == "Hoàn thành")
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
				var startTime = targetDateTime.AddHours(-2);
				var endTime = targetDateTime.AddHours(2);

				var occupiedTableIds = await _context.Hoadonthanhtoans
					.Where(h => h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
							   (h.TrangThaiThanhToan == "pending" ||
								h.TrangThaiThanhToan == "processing" ||
								h.TrangThaiThanhToan == "completed") &&
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
						status = "available",
						description = b.GhiChu
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

		// Lấy menu items

		[HttpGet("menu-items")]
		public async Task<IActionResult> GetMenuItems()
		{
			try
			{
				var validStatuses = new[] { "Còn hàng", "Món đặc biệt", "Món mới" };
				var menuItems = await _context.Monans
					.Where(m => validStatuses.Contains(m.TinhTrang))
					.Select(m => new
					{
						id = m.MaMon,
						name = m.TenMon,
						price = m.Gia,
						description = m.MoTa ?? "",
						image = m.HinhAnh ?? "",
						status = m.TinhTrang ?? "Còn hàng",
						category = _context.Danhmucs
							.Where(d => d.MaDanhMuc == m.MaDanhMuc)
							.Select(d => d.TenDanhMuc)
							.FirstOrDefault() ?? "Khác",
						categoryId = m.MaDanhMuc,
						isAvailable = validStatuses.Contains(m.TinhTrang)
					})
					.OrderBy(m => m.category)
					.ThenBy(m => m.name)
					.ToListAsync();

				return Ok(menuItems);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách món ăn", error = ex.Message });
			}
		}

		// Cập nhật trạng thái thanh toán đơn hàng
		[HttpPut("{orderId}/status")]
		public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] UpdateStatusRequest request)
		{
			try
			{
				var order = await _context.Hoadonthanhtoans
					.Include(h => h.MaDatMonNavigation)
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				// Kiểm tra ràng buộc thời gian
				if (request.Status == "completed")
				{
					var bookingInfo = await _context.Datbans
						.FirstOrDefaultAsync(db => db.MaBanAn == order.MaBanAn);

					if (bookingInfo != null && bookingInfo.ThoiGianDen > DateTime.Now)
					{
						return BadRequest(new
						{
							message = $"Không thể hoàn thành thanh toán trước thời gian đến bàn ({bookingInfo.ThoiGianDen:HH:mm dd/MM/yyyy})"
						});
					}

					// Kiểm tra đơn đặt món đã hoàn thành chưa
					if (order.MaDatMonNavigation?.TrangThai != "Hoàn thành")
					{
						return BadRequest(new
						{
							message = "Không thể hoàn thành thanh toán khi đơn đặt món chưa hoàn thành"
						});
					}
				}

				order.TrangThaiThanhToan = request.Status;

				if (request.Status == "completed" || request.Status == "cancelled")
				{
					order.ThoiGianThanhToan = DateTime.Now;
				}

				await _context.SaveChangesAsync();
				return Ok(new { message = "Cập nhật trạng thái thanh toán thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi cập nhật trạng thái", error = ex.Message });
			}
		}

		// Cập nhật trạng thái đặt món
		[HttpPut("{orderId}/food-status")]
		public async Task<IActionResult> UpdateOrderFoodStatus(string orderId, [FromBody] UpdateStatusRequest request)
		{
			try
			{
				var donDatMon = await _context.Dondatmons
					.FirstOrDefaultAsync(d => d.MaDatMon == orderId);

				if (donDatMon == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn đặt món" });
				}

				// Kiểm tra ràng buộc thời gian
				if (request.Status == "completed")
				{
					if (donDatMon.ThoiGianDat > DateTime.Now)
					{
						return BadRequest(new
						{
							message = $"Không thể hoàn thành đơn đặt món trước thời gian đặt ({donDatMon.ThoiGianDat:HH:mm dd/MM/yyyy})"
						});
					}

					// Kiểm tra thời gian đến bàn
					var bookingInfo = await _context.Datbans
						.FirstOrDefaultAsync(db => db.MaBanAn == donDatMon.MaBanAn);

					if (bookingInfo != null && bookingInfo.ThoiGianDen > DateTime.Now)
					{
						return BadRequest(new
						{
							message = $"Không thể hoàn thành đơn đặt món trước thời gian đến bàn ({bookingInfo.ThoiGianDen:HH:mm dd/MM/yyyy})"
						});
					}
				}

				string vietnameseStatus = request.Status switch
				{
					"pending" => "Chờ xử lí",
					"processing" => "Đang xử lí",
					"completed" => "Hoàn thành",
					"cancelled" => "Đã hủy",
					_ => request.Status
				};

				donDatMon.TrangThai = vietnameseStatus;
				_context.Dondatmons.Update(donDatMon);
				await _context.SaveChangesAsync();

				return Ok(new { message = "Cập nhật trạng thái đặt món thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi cập nhật trạng thái đặt món", error = ex.Message });
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

				// Kiểm tra bàn có đang được sử dụng không
				var orderDateTime = order.ThoiGianDat;
				var startTime = orderDateTime.AddHours(-2);
				var endTime = orderDateTime.AddHours(2);

				var isTableOccupied = await _context.Hoadonthanhtoans
					.AnyAsync(h => h.MaBanAn == request.TableId &&
								  h.ThoiGianDat >= startTime && h.ThoiGianDat <= endTime &&
								  (h.TrangThaiThanhToan == "pending" ||
								   h.TrangThaiThanhToan == "processing" ||
								   h.TrangThaiThanhToan == "completed") &&
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

				// Validate thời gian
				if (request.OrderDate.HasValue && request.OrderDate.Value < DateTime.Now.AddMinutes(-5))
				{
					return BadRequest(new { message = "Không thể tạo đơn hàng với thời gian trong quá khứ" });
				}

				// Tạo mã đơn đặt món
				var maDatMon = "DDM" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(100, 999);

				// Tạo đơn đặt món
				var donDatMon = new Dondatmon
				{
					MaDatMon = maDatMon,
					MaKhachHang = request.CustomerId ?? "GUEST_" + DateTime.Now.Ticks,
					MaBanAn = request.TableIds?.FirstOrDefault(),
					SoDienThoai = request.CustomerPhone ?? "",
					ThoiGianDat = request.OrderDate ?? DateTime.Now,
					TrangThai = "Chờ xử lí",
					SoLuong = request.Items.Sum(i => i.Quantity),
					TongTien = request.Items.Sum(i => i.Price * i.Quantity),
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
						Gia = item.Price,
						TongTien = item.Price * item.Quantity
					};
					_context.Chitietdondatmons.Add(chiTiet);
				}

				await _context.SaveChangesAsync();

				// Tạo hóa đơn
				var maHoaDon = "HDMM" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(100, 999);
				var vietnamesePayment = request.PaymentMethod switch
				{
					"cash" => "Tiền mặt",
					"vnpay" => "VNPay",
					_ => "Tiền mặt"
				};

				var totalAmount = request.Items.Sum(i => i.Price * i.Quantity);
				var deposit = totalAmount * 0.3m;
				var remaining = totalAmount - deposit;

				var hoaDon = new Hoadonthanhtoan
				{
					MaHoaDon = maHoaDon,
					MaDatMon = maDatMon,
					MaKhachHang = request.CustomerId ?? "GUEST_" + DateTime.Now.Ticks,
					MaBanAn = request.TableIds?.FirstOrDefault(),
					ThoiGianDat = request.OrderDate ?? DateTime.Now,
					TongTien = totalAmount,
					SoTienCoc = deposit,
					SoTienConLai = remaining,
					TienGiam = 0,
					PhuongThucThanhToan = vietnamesePayment,
					TrangThaiThanhToan = "pending",
					MaNhanVien = request.StaffId ?? "NV001",
					GhiChu = request.Notes
				};

				_context.Hoadonthanhtoans.Add(hoaDon);

				// Tạo đặt bàn nếu có
				if (request.TableIds != null && request.TableIds.Any())
				{
					var maDatBan = "DB" + DateTime.Now.ToString("yyyyMMddHHmmss");
					var datBan = new Datban
					{
						MaBanAn = maDatBan,
						MaKhachHang = request.CustomerId ?? "GUEST_" + DateTime.Now.Ticks,
						SoLuongKhach = request.GuestCount ?? 2,
						ThoiGianDat = request.OrderDate ?? DateTime.Now,
						ThoiGianDen = request.ArrivalTime ?? DateTime.Now.AddHours(1),
						TrangThai = "Đã đặt",
						GhiChu = request.Notes
					};
					_context.Datbans.Add(datBan);

					// Liên kết bàn
					foreach (var tableId in request.TableIds)
					{
						var datBanBanAn = new DatBanBanAn
						{
							MaDatBan = maDatBan,
							MaBanAn = tableId
						};
						_context.DatBanBanAns.Add(datBanBanAn);
					}
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new { message = "Tạo đơn hàng thành công", orderId = maHoaDon, orderCode = maDatMon });
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				return BadRequest(new { message = "Lỗi khi tạo đơn hàng", error = ex.Message });
			}
		}

		// Cập nhật đơn hàng
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

				var order = await _context.Hoadonthanhtoans
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				var donDatMon = await _context.Dondatmons
					.FirstOrDefaultAsync(d => d.MaDatMon == order.MaDatMon);

				if (donDatMon == null)
				{
					return BadRequest(new { message = "Không tìm thấy đơn đặt món liên quan" });
				}

				// Kiểm tra ràng buộc cập nhật
				if (order.TrangThaiThanhToan == "completed")
				{
					return BadRequest(new { message = "Không thể cập nhật đơn hàng đã hoàn thành thanh toán" });
				}

				// Cập nhật thông tin
				var vietnamesePayment = request.PaymentMethod switch
				{
					"cash" => "Tiền mặt",
					"vnpay" => "VNPay",
					_ => "Tiền mặt"
				};

				var totalAmount = request.Items.Sum(i => i.Price * i.Quantity);
				var deposit = totalAmount * 0.3m;
				var remaining = totalAmount - deposit;

				order.TrangThaiThanhToan = request.Status;
				order.PhuongThucThanhToan = vietnamesePayment;
				order.MaBanAn = request.TableIds?.FirstOrDefault();
				order.GhiChu = request.Notes;
				order.TongTien = totalAmount;
				order.SoTienCoc = deposit;
				order.SoTienConLai = remaining;

				// Cập nhật đơn đặt món
				string vietnameseFoodStatus = request.StatusOrderFood switch
				{
					"pending" => "Chờ xử lí",
					"processing" => "Đang xử lí",
					"completed" => "Hoàn thành",
					"cancelled" => "Đã hủy",
					_ => request.StatusOrderFood
				};

				donDatMon.TrangThai = vietnameseFoodStatus;
				donDatMon.GhiChu = request.Notes;
				donDatMon.SoLuong = request.Items.Sum(i => i.Quantity);
				donDatMon.TongTien = totalAmount;

				// Cập nhật chi tiết món
				var oldDetails = await _context.Chitietdondatmons
					.Where(ct => ct.MaDatMon == order.MaDatMon)
					.ToListAsync();

				if (oldDetails.Any())
				{
					_context.Chitietdondatmons.RemoveRange(oldDetails);
					await _context.SaveChangesAsync();
				}

				foreach (var item in request.Items)
				{
					var chiTiet = new Chitietdondatmon
					{
						MaDatMon = order.MaDatMon,
						MaMon = item.Id,
						SoLuong = item.Quantity,
						Gia = item.Price,
						TongTien = item.Price * item.Quantity
					};
					_context.Chitietdondatmons.Add(chiTiet);
				}

				// Cập nhật thông tin đặt bàn
				var datBan = await _context.Datbans
					.FirstOrDefaultAsync(d => d.MaBanAn == order.MaBanAn);

				if (datBan != null)
				{
					datBan.SoLuongKhach = request.Guest;
					datBan.GhiChu = request.Notes;
					_context.Datbans.Update(datBan);
				}

				// Cập nhật liên kết bàn
				if (request.TableIds != null && request.TableIds.Any())
				{
					var oldTableLinks = await _context.DatBanBanAns
						.Where(d => d.MaDatBan == order.MaBanAn)
						.ToListAsync();

					if (oldTableLinks.Any())
					{
						_context.DatBanBanAns.RemoveRange(oldTableLinks);
						await _context.SaveChangesAsync();
					}

					var newLinks = request.TableIds.Select(banId => new DatBanBanAn
					{
						MaDatBan = order.MaBanAn,
						MaBanAn = banId
					}).ToList();

					_context.DatBanBanAns.AddRange(newLinks);
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new { message = "Cập nhật đơn hàng thành công" });
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();
				return BadRequest(new { message = "Lỗi khi cập nhật đơn hàng", error = ex.Message });
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

				// Kiểm tra ràng buộc xóa
				if (order.TrangThaiThanhToan == "completed")
				{
					return BadRequest(new { message = "Không thể xóa đơn hàng đã hoàn thành thanh toán" });
				}

				// Xóa chi tiết đơn đặt món
				var orderDetails = await _context.Chitietdondatmons
					.Where(ct => ct.MaDatMon == order.MaDatMon)
					.ToListAsync();

				if (orderDetails.Any())
				{
					_context.Chitietdondatmons.RemoveRange(orderDetails);
				}

				// Xóa liên kết bàn
				var tableLinks = await _context.DatBanBanAns
					.Where(d => d.MaDatBan == order.MaBanAn)
					.ToListAsync();

				if (tableLinks.Any())
				{
					_context.DatBanBanAns.RemoveRange(tableLinks);
				}

				// Xóa đặt bàn
				var datBan = await _context.Datbans
					.FirstOrDefaultAsync(d => d.MaBanAn == order.MaBanAn);
				if (datBan != null)
				{
					_context.Datbans.Remove(datBan);
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

		// Xuất hóa đơn PDF
		[HttpGet("{orderId}/export-pdf")]
		public async Task<IActionResult> ExportInvoicePdf(string orderId)
		{
			try
			{
				var order = await _context.Hoadonthanhtoans
					.Include(h => h.MaKhachHangNavigation)
					.Include(h => h.MaDatMonNavigation)
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				// Kiểm tra điều kiện xuất PDF
				if (order.TrangThaiThanhToan != "completed")
				{
					return BadRequest(new { message = "Chỉ có thể xuất hóa đơn cho đơn hàng đã hoàn thành thanh toán" });
				}

				if (order.MaDatMonNavigation?.TrangThai != "Hoàn thành")
				{
					return BadRequest(new { message = "Chỉ có thể xuất hóa đơn cho đơn hàng đã hoàn thành phục vụ" });
				}

				// Lấy chi tiết đơn hàng
				var orderDetails = await _context.Chitietdondatmons
					.Where(ct => ct.MaDatMon == order.MaDatMon)
					.Include(ct => ct.MaMonNavigation)
					.ToListAsync();

				// Tạo PDF
				using var memoryStream = new MemoryStream();
				var document = new Document(PageSize.A4, 50, 50, 25, 25);
				var writer = PdfWriter.GetInstance(document, memoryStream);

				document.Open();

				// Font cho tiếng Việt
				var baseFont = BaseFont.CreateFont("F:\\", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
				var titleFont = new Font(baseFont, 18, Font.BOLD);
				var headerFont = new Font(baseFont, 14, Font.BOLD);
				var normalFont = new Font(baseFont, 12, Font.NORMAL);
				var smallFont = new Font(baseFont, 10, Font.NORMAL);

				// Header
				var titleParagraph = new Paragraph("HÓA ĐƠN THANH TOÁN", titleFont);
				titleParagraph.Alignment = Element.ALIGN_CENTER;
				document.Add(titleParagraph);

				document.Add(new Paragraph("NHÀ HÀNG QUANG QUÝ", headerFont) { Alignment = Element.ALIGN_CENTER });
				document.Add(new Paragraph("Địa chỉ: 106 Phạm Nhữ Tăng, Thanh Khê Đông, TP Đà Nẵng", normalFont) { Alignment = Element.ALIGN_CENTER });
				document.Add(new Paragraph("Điện thoại: 0382.208.154", normalFont) { Alignment = Element.ALIGN_CENTER });
				document.Add(new Paragraph(" "));

				// Thông tin hóa đơn
				document.Add(new Paragraph($"Mã hóa đơn: {order.MaHoaDon}", normalFont));
				document.Add(new Paragraph($"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}", normalFont));
				document.Add(new Paragraph($"Khách hàng: {order.MaKhachHangNavigation?.TenKhachHang ?? "Khách vãng lai"}", normalFont));
				document.Add(new Paragraph($"Số điện thoại: {order.MaKhachHangNavigation?.SoDienThoai ?? "N/A"}", normalFont));
				document.Add(new Paragraph($"Bàn: {order.MaBanAn ?? "N/A"}", normalFont));
				document.Add(new Paragraph($"Thời gian đặt: {order.ThoiGianDat:dd/MM/yyyy HH:mm}", normalFont));
				document.Add(new Paragraph($"Thời gian thanh toán: {order.ThoiGianThanhToan:dd/MM/yyyy HH:mm}", normalFont));
				document.Add(new Paragraph(" "));

				// Bảng chi tiết
				var table = new PdfPTable(5);
				table.WidthPercentage = 100;
				table.SetWidths(new float[] { 1f, 3f, 1f, 2f, 2f });

				// Header bảng
				table.AddCell(new PdfPCell(new Phrase("STT", headerFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
				table.AddCell(new PdfPCell(new Phrase("Tên món", headerFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
				table.AddCell(new PdfPCell(new Phrase("SL", headerFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
				table.AddCell(new PdfPCell(new Phrase("Đơn giá", headerFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
				table.AddCell(new PdfPCell(new Phrase("Thành tiền", headerFont)) { HorizontalAlignment = Element.ALIGN_CENTER });

				// Dữ liệu
				int stt = 1;
				foreach (var detail in orderDetails)
				{
					table.AddCell(new PdfPCell(new Phrase(stt.ToString(), normalFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
					table.AddCell(new PdfPCell(new Phrase(detail.MaMonNavigation?.TenMon ?? "", normalFont)));
					table.AddCell(new PdfPCell(new Phrase(detail.SoLuong.ToString(), normalFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
					table.AddCell(new PdfPCell(new Phrase($"{detail.Gia:N0} ₫", normalFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
					table.AddCell(new PdfPCell(new Phrase($"{detail.TongTien:N0} ₫", normalFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
					stt++;
				}
				document.Add(table);
				document.Add(new Paragraph(" "));

				// Tổng kết
				document.Add(new Paragraph($"Tạm tính: {order.TongTien:N0} ₫", normalFont) { Alignment = Element.ALIGN_RIGHT });
				if (order.TienGiam > 0)
				{
					document.Add(new Paragraph($"Giảm giá: -{order.TienGiam:N0} ₫", normalFont) { Alignment = Element.ALIGN_RIGHT });
				}
				document.Add(new Paragraph($"Tiền cọc đã thanh toán: {order.SoTienCoc:N0} ₫", normalFont) { Alignment = Element.ALIGN_RIGHT });
				document.Add(new Paragraph($"Tiền còn lại: {order.SoTienConLai:N0} ₫", normalFont) { Alignment = Element.ALIGN_RIGHT });

				var finalTotal = (order.TongTien ?? 0) - (order.TienGiam ?? 0);
				document.Add(new Paragraph($"TỔNG CỘNG: {finalTotal:N0} ₫", headerFont) { Alignment = Element.ALIGN_RIGHT });
				document.Add(new Paragraph($"Phương thức thanh toán: {order.PhuongThucThanhToan}", normalFont) { Alignment = Element.ALIGN_RIGHT });

				document.Add(new Paragraph(" "));
				document.Add(new Paragraph("Cảm ơn quý khách đã sử dụng dịch vụ!", normalFont) { Alignment = Element.ALIGN_CENTER });

				document.Close();

				var fileName = $"HoaDon_{order.MaHoaDon}_{DateTime.Now:yyyyMMdd}.pdf";
				return File(memoryStream.ToArray(), "application/pdf", fileName);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi xuất hóa đơn PDF", error = ex.Message });
			}
		}

		// Gửi hóa đơn qua email
		[HttpPost("{orderId}/send-invoice")]
		public async Task<IActionResult> SendInvoiceEmail(string orderId, [FromBody] SendInvoiceRequest request)
		{
			try
			{
				var order = await _context.Hoadonthanhtoans
					.Include(h => h.MaKhachHangNavigation)
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				if (order.TrangThaiThanhToan != "completed")
				{
					return BadRequest(new { message = "Chỉ có thể gửi hóa đơn cho đơn hàng đã hoàn thành" });
				}

				var email = request.Email ?? order.MaKhachHangNavigation?.Email;
				if (string.IsNullOrEmpty(email))
				{
					return BadRequest(new { message = "Không có địa chỉ email để gửi" });
				}

				// Tạo PDF và gửi email
				// Implementation tương tự như ExportInvoicePdf nhưng gửi qua email

				await _emailService.SendEmailAsync(email, "Hóa đơn thanh toán - Nhà Hàng Quang Quý", "Hóa đơn đính kèm");

				return Ok(new { message = "Gửi hóa đơn qua email thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi gửi hóa đơn", error = ex.Message });
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
		public string? CustomerPhone { get; set; }
		public string? CustomerEmail { get; set; }
		public List<string>? TableIds { get; set; }
		public string? StaffId { get; set; }
		public DateTime? OrderDate { get; set; }
		public DateTime? ArrivalTime { get; set; }
		public int? GuestCount { get; set; }
		public string? Notes { get; set; }
		public string PaymentMethod { get; set; } = "cash";
		public List<OrderItemRequest> Items { get; set; } = new();
	}

	public class UpdateOrderRequest
	{
		public string CustomerName { get; set; } = null!;
		public List<string> TableIds { get; set; } = new();
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

	public class SendInvoiceRequest
	{
		public string? Email { get; set; }
	}
}
