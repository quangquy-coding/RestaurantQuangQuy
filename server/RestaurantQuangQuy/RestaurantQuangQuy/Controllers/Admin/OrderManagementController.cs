﻿using Microsoft.AspNetCore.Http;
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

				// Lấy danh sách bàn đã được đặt trong khoảng thời gian 2 giờ trước và sau
				var occupiedTableIds = await (
					from dbba in _context.DatBanBanAns
					join db in _context.Datbans on dbba.MaDatBan equals db.MaBanAn
					where db.ThoiGianDen >= startTime && db.ThoiGianDen <= endTime
					  && (db.TrangThai != "Đã hủy" && db.TrangThai != "cancelled")
					select dbba.MaBanAn
				).Distinct().ToListAsync();

				// Lấy tất cả bàn và đánh dấu trạng thái
				var allTables = await _context.Banans
					.Select(b => new
					{
						id = b.MaBan,
						name = b.TenBan,
						capacity = b.SoChoNgoi,
						location = b.ViTri,
						status = occupiedTableIds.Contains(b.MaBan) ? "occupied" : "available",
						description = b.GhiChu,
						occupiedTime = occupiedTableIds.Contains(b.MaBan) ? 
							_context.Datbans
								.Where(db => db.ThoiGianDen >= startTime && db.ThoiGianDen <= endTime)
								.Join(_context.DatBanBanAns, db => db.MaBanAn, dbba => dbba.MaDatBan, (db, dbba) => new { db, dbba })
								.Where(x => x.dbba.MaBanAn == b.MaBan)
								.Select(x => x.db.ThoiGianDen)
								.FirstOrDefault() : (DateTime?)null
					})
					.OrderBy(b => b.name)
					.ToListAsync();

				return Ok(allTables);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi lấy danh sách bàn trống", error = ex.Message });
			}
		}

		// Kiểm tra bàn có sẵn theo thời gian cụ thể
		[HttpGet("check-table-availability")]
		public async Task<IActionResult> CheckTableAvailability([FromQuery] string tableId, [FromQuery] DateTime arrivalTime)
		{
			try
			{
				var table = await _context.Banans.FindAsync(tableId);
				if (table == null)
				{
					return NotFound(new { message = "Không tìm thấy bàn" });
				}

				var startTime = arrivalTime.AddHours(-2);
				var endTime = arrivalTime.AddHours(2);

				// Kiểm tra xem bàn có được đặt trong khoảng thời gian này không
				var isOccupied = await (
					from dbba in _context.DatBanBanAns
					join db in _context.Datbans on dbba.MaDatBan equals db.MaBanAn
					where dbba.MaBanAn == tableId
					  && db.ThoiGianDen >= startTime && db.ThoiGianDen <= endTime
					  && (db.TrangThai != "Đã hủy" && db.TrangThai != "cancelled")
					select new { db.ThoiGianDen, db.MaBanAn }
				).FirstOrDefaultAsync();

				return Ok(new
				{
					tableId = tableId,
					tableName = table.TenBan,
					isAvailable = isOccupied == null,
					conflictingBooking = isOccupied != null ? new
					{
						arrivalTime = isOccupied.ThoiGianDen,
						bookingId = isOccupied.MaBanAn
					} : null,
					searchTime = arrivalTime,
					startTime = startTime,
					endTime = endTime
				});
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi kiểm tra bàn", error = ex.Message });
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

				// Lấy thông tin đặt bàn của đơn hàng này
				var datBan = await _context.Datbans.FirstOrDefaultAsync(db => db.MaBanAn == order.MaBanAn);
				if (datBan == null)
				{
					return BadRequest(new { message = "Không tìm thấy thông tin đặt bàn cho đơn hàng này" });
				}

				var arrivalTime = datBan.ThoiGianDen;
				var startTime = arrivalTime.AddHours(-2);
				var endTime = arrivalTime.AddHours(2);

				// Kiểm tra xem bàn này đã được đặt trong khoảng thời gian 2 giờ trước và sau chưa
				var conflictingBooking = await (
					from dbba in _context.DatBanBanAns
					join db in _context.Datbans on dbba.MaDatBan equals db.MaBanAn
					where dbba.MaBanAn == request.TableId
					  && db.ThoiGianDen >= startTime && db.ThoiGianDen <= endTime
					  && db.MaBanAn != datBan.MaBanAn
					  && (db.TrangThai != "Đã hủy" && db.TrangThai != "cancelled")
					select new { 
						BookingId = db.MaBanAn, 
						ArrivalTime = db.ThoiGianDen,
						GuestCount = db.SoLuongKhach,
						CustomerName = _context.Khachhangs
							.Where(k => k.MaKhachHang == db.MaKhachHang)
							.Select(k => k.TenKhachHang)
							.FirstOrDefault() ?? "Khách vãng lai"
					}
				).FirstOrDefaultAsync();

				if (conflictingBooking != null)
				{
					return BadRequest(new { 
						message = $"Bàn {table.TenBan} đã được đặt bởi {conflictingBooking.CustomerName} vào lúc {conflictingBooking.ArrivalTime:HH:mm dd/MM/yyyy} (khoảng thời gian từ {startTime:HH:mm dd/MM/yyyy} đến {endTime:HH:mm dd/MM/yyyy})",
						conflictingBooking = conflictingBooking
					});
				}

				// Gán bàn cho booking (DatBanBanAn)
				// Xóa các liên kết cũ nếu có
				var oldLinks = await _context.DatBanBanAns.Where(x => x.MaDatBan == datBan.MaBanAn).ToListAsync();
				if (oldLinks.Any())
				{
					_context.DatBanBanAns.RemoveRange(oldLinks);
					await _context.SaveChangesAsync();
				}
				
				// Thêm liên kết mới
				_context.DatBanBanAns.Add(new DatBanBanAn
				{
					MaDatBan = datBan.MaBanAn,
					MaBanAn = request.TableId
				});
				await _context.SaveChangesAsync();

				// Cập nhật mã bàn cho hóa đơn
				order.MaBanAn = datBan.MaBanAn;
				await _context.SaveChangesAsync();

				return Ok(new { 
					message = $"Gán bàn {table.TenBan} thành công cho thời gian {arrivalTime:HH:mm dd/MM/yyyy}",
					tableId = request.TableId,
					tableName = table.TenBan,
					arrivalTime = arrivalTime
				});
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
			using var transaction = _context.Database.BeginTransaction();
			try
			{
				// 1. Validate ít nhất một món
				if (request.Items == null || !request.Items.Any())
					return BadRequest(new { message = "Đơn hàng phải có ít nhất một món" });

				// 2. Check hoặc tạo mới khách hàng theo số điện thoại
				var customer = await _context.Khachhangs
					.FirstOrDefaultAsync(c => c.SoDienThoai == request.CustomerPhone);
				if (customer == null)
				{
					// Nếu không tìm thấy khách hàng, tạo mới mã khách hàng 10 kí tự
					var maKhachHangNew = "KH" + Guid.NewGuid()
							  .ToString("N")
							  .Substring(0, 8);
					customer = new Khachhang
					{
						MaKhachHang = maKhachHangNew,
						TenKhachHang = request.CustomerName ?? "",
						SoDienThoai = request.CustomerPhone ?? "",
						Email = request.CustomerEmail ?? "",
						DiaChi = request.Notes ?? ""
					};
					_context.Khachhangs.Add(customer);
					await _context.SaveChangesAsync();
				}
				// Lấy mã Khách hàng
				var maKh = customer.MaKhachHang.ToString();

				// 3. Tạo mã đặt bàn
				var maDatBan = "DB" + Guid.NewGuid()
							  .ToString("N")
							  .Substring(0, 8);

				// 4. Tạo Datban và liên kết bàn vào DatBanBanAn
				var datBan = new Datban
				{
					MaBanAn = maDatBan,
					MaKhachHang = maKh,
					SoLuongKhach = request.GuestCount ?? 1,
					ThoiGianDat = request.OrderDate ?? DateTime.Now,
					ThoiGianDen = request.ArrivalTime ?? DateTime.Now.AddHours(1),
					TrangThai = "Đã đặt",
					GhiChu = request.Notes
				};
				_context.Datbans.Add(datBan);
				await _context.SaveChangesAsync();  // để Datban có ID nếu cần khoá ngoại

				// Kiểm tra xung đột bàn trước khi gán
				if (request.TableIds?.Any() == true)
				{
					var arrivalTime = datBan.ThoiGianDen;
					var startTime = arrivalTime.AddHours(-2);
					var endTime = arrivalTime.AddHours(2);

					foreach (var tableId in request.TableIds)
					{
						// Kiểm tra xem bàn có bị xung đột không
						var conflictingBooking = await (
							from dbba in _context.DatBanBanAns
							join db in _context.Datbans on dbba.MaDatBan equals db.MaBanAn
							where dbba.MaBanAn == tableId
							  && db.ThoiGianDen >= startTime && db.ThoiGianDen <= endTime
							  && (db.TrangThai != "Đã hủy" && db.TrangThai != "cancelled")
							select new { 
								BookingId = db.MaBanAn, 
								ArrivalTime = db.ThoiGianDen,
								CustomerName = _context.Khachhangs
									.Where(k => k.MaKhachHang == db.MaKhachHang)
									.Select(k => k.TenKhachHang)
									.FirstOrDefault() ?? "Khách vãng lai",
								TableName = _context.Banans
									.Where(b => b.MaBan == tableId)
									.Select(b => b.TenBan)
									.FirstOrDefault() ?? "Bàn"
							}
						).FirstOrDefaultAsync();

						if (conflictingBooking != null)
						{
							return BadRequest(new { 
								message = $"Bàn {conflictingBooking.TableName} đã được đặt bởi {conflictingBooking.CustomerName} vào lúc {conflictingBooking.ArrivalTime:HH:mm dd/MM/yyyy} (khoảng thời gian từ {startTime:HH:mm dd/MM/yyyy} đến {endTime:HH:mm dd/MM/yyyy})",
								conflictingBooking = conflictingBooking
							});
						}
					}

					// Nếu không có xung đột, thêm liên kết bàn
					foreach (var tableId in request.TableIds)
					{
						_context.DatBanBanAns.Add(new DatBanBanAn
						{
							MaDatBan = maDatBan,
							MaBanAn = tableId
						});
					}
				}

				// 5. Tạo đơn đặt món (Dondatmon + Chitietdondatmon)
				var maDatMon = "DDM" + Guid.NewGuid()
							  .ToString("N")
							  .Substring(0, 7);
				var donDatMon = new Dondatmon
				{
					MaDatMon = maDatMon,
					MaKhachHang = maKh,
					MaBanAn = maDatBan,
					ThoiGianDat = request.OrderDate ?? DateTime.Now,
					TrangThai = "Chờ xử lí",
					SoLuong = request.Items.Sum(i => i.Quantity),
					TongTien = request.Items.Sum(i => i.Price * i.Quantity),
					GhiChu = request.Notes
				};
				_context.Dondatmons.Add(donDatMon);
				await _context.SaveChangesAsync();

				foreach (var item in request.Items)
				{
					_context.Chitietdondatmons.Add(new Chitietdondatmon
					{
						MaDatMon = maDatMon,
						MaMon = item.Id,
						SoLuong = item.Quantity,
						Gia = item.Price,
						TongTien = item.Price * item.Quantity
					});
				}
				await _context.SaveChangesAsync();

				// 6. Tạo hoá đơn
				var maHoaDon = "HDTQ" + Guid.NewGuid().ToString("N").Substring(0, 6);
				var totalAmount = request.Items.Sum(i => i.Price * i.Quantity);
				var depositAmt = request.Deposit ?? totalAmount * 0.3m;
				var remaining = totalAmount - depositAmt;
				var paymentVN = request.PaymentMethod switch
				{
					"cash" => "Tiền mặt",
					"vnpay" => "VNPay",
					_ => "Tiền mặt"
				};

				var hoaDon = new Hoadonthanhtoan
				{
					MaHoaDon = maHoaDon,
					MaDatMon = maDatMon,
					MaKhachHang = maKh,
					MaBanAn = maDatBan,
					ThoiGianDat = DateTime.Now,
					TongTien = totalAmount,
					SoTienCoc = depositAmt,
					SoTienConLai = remaining,
					TienGiam = request.Discount,
					PhuongThucThanhToan = paymentVN,
					TrangThaiThanhToan = paymentVN == "VNPay" ? "completed" : "pending",

					MaNhanVien = request.StaffId ?? "NV001",
					GhiChu = request.Notes
				};
				_context.Hoadonthanhtoans.Add(hoaDon);

				// 7. Commit transaction
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


		[HttpPut("{orderId}")]
		public async Task<IActionResult> UpdateOrder(string orderId, [FromBody] UpdateOrderRequest request)
		{
			await using var transaction = await _context.Database.BeginTransactionAsync();
			try
			{
				// 1. Validate
				if (request.Items == null || !request.Items.Any())
					return BadRequest(new { message = "Đơn hàng phải có ít nhất một món" });

				// 2. Lấy hóa đơn (HoadonThanhToan)
				var invoice = await _context.Hoadonthanhtoans
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (invoice == null)
					return NotFound(new { message = "Không tìm thấy đơn hàng" });

				// 3. Lấy đơn đặt món liên quan (Dondatmon)
				var order = await _context.Dondatmons
					.FirstOrDefaultAsync(d => d.MaDatMon == invoice.MaDatMon);

				if (order == null)
					return BadRequest(new { message = "Không tìm thấy đơn đặt món liên quan" });

				// 4. Ràng buộc: không cho sửa khi đã hoàn thành thanh toán
				if (invoice.TrangThaiThanhToan == "completed")
					return BadRequest(new { message = "Không thể cập nhật đơn đã hoàn thành thanh toán" });

				// 5. Tính lại tổng tiền, cọc và còn lại
				decimal totalAmount = request.Items.Sum(i => i.Price * i.Quantity);
				decimal depositAmt = request.Deposit;
				decimal remaining = totalAmount - depositAmt;

				// 6. Cập nhật HoadonThanhToan
				invoice.TrangThaiThanhToan = request.Status;
				invoice.PhuongThucThanhToan = request.PaymentMethod switch
				{
					"cash" => "Tiền mặt",
					"vnpay" => "VNPay",
					_ => invoice.PhuongThucThanhToan
				};
				invoice.GhiChu = request.Notes;
				invoice.TienGiam = request.Discount;
				invoice.SoTienCoc = depositAmt;
				invoice.TongTien = totalAmount;
				invoice.SoTienConLai = remaining;
				// **Lưu ý:** không gán lại invoice.MaBanAn ở đây!

				// 7. Cập nhật Dondatmon
				order.TrangThai = request.StatusOrderFood switch
				{
					"pending" => "Chờ xử lí",
					"processing" => "Đang xử lí",
					"completed" => "Hoàn thành",
					"cancelled" => "Đã hủy",
					_ => order.TrangThai
				};
				order.GhiChu = request.Notes;
				order.SoLuong = request.Items.Sum(i => i.Quantity);
				order.TongTien = totalAmount;

				// 8. Xóa chi tiết cũ và thêm chi tiết mới
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
					_context.Chitietdondatmons.Add(new Chitietdondatmon
					{
						MaDatMon = order.MaDatMon,
						MaMon = item.Id,
						SoLuong = item.Quantity,
						Gia = item.Price,
						TongTien = item.Price * item.Quantity
					});
				}

				// 9. Cập nhật Datban (booking) và liên kết DatBanBanAn
				//    Dùng invoice.MaBanAn (booking-id) do Create sinh
				var datBan = await _context.Datbans
					.FirstOrDefaultAsync(d => d.MaBanAn == invoice.MaBanAn);
				if (datBan != null)
				{
					datBan.SoLuongKhach = request.Guest;
					datBan.ThoiGianDen = request.DateComming;
					datBan.GhiChu = request.Notes;
					_context.Datbans.Update(datBan);

					// Kiểm tra xung đột bàn trước khi cập nhật
					if (request.TableIds?.Any() == true)
					{
						var arrivalTime = request.DateComming;
						var startTime = arrivalTime.AddHours(-2);
						var endTime = arrivalTime.AddHours(2);

						foreach (var tableId in request.TableIds)
						{
							// Kiểm tra xem bàn có bị xung đột không (loại trừ booking hiện tại)
							var conflictingBooking = await (
								from dbba in _context.DatBanBanAns
								join db in _context.Datbans on dbba.MaDatBan equals db.MaBanAn
								where dbba.MaBanAn == tableId
								  && db.ThoiGianDen >= startTime && db.ThoiGianDen <= endTime
								  && db.MaBanAn != datBan.MaBanAn
								  && (db.TrangThai != "Đã hủy" && db.TrangThai != "cancelled")
								select new { 
									BookingId = db.MaBanAn, 
									ArrivalTime = db.ThoiGianDen,
									CustomerName = _context.Khachhangs
										.Where(k => k.MaKhachHang == db.MaKhachHang)
										.Select(k => k.TenKhachHang)
										.FirstOrDefault() ?? "Khách vãng lai",
									TableName = _context.Banans
										.Where(b => b.MaBan == tableId)
										.Select(b => b.TenBan)
										.FirstOrDefault() ?? "Bàn"
								}
							).FirstOrDefaultAsync();

							if (conflictingBooking != null)
							{
								return BadRequest(new { 
									message = $"Bàn {conflictingBooking.TableName} đã được đặt bởi {conflictingBooking.CustomerName} vào lúc {conflictingBooking.ArrivalTime:HH:mm dd/MM/yyyy} (khoảng thời gian từ {startTime:HH:mm dd/MM/yyyy} đến {endTime:HH:mm dd/MM/yyyy})",
									conflictingBooking = conflictingBooking
								});
							}
						}
					}

					// Xóa liên kết bàn cũ
					var oldLinks = await _context.DatBanBanAns
						.Where(link => link.MaDatBan == datBan.MaBanAn)
						.ToListAsync();
					if (oldLinks.Any())
					{
						_context.DatBanBanAns.RemoveRange(oldLinks);
						await _context.SaveChangesAsync();
					}

					// Thêm liên kết bàn mới
					foreach (var tableId in request.TableIds)
					{
						_context.DatBanBanAns.Add(new DatBanBanAn
						{
							MaDatBan = datBan.MaBanAn,
							MaBanAn = tableId
						});
					}
				}

				// 10. Lưu và commit
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

		// Fix for CS0119: 'ControllerBase.File(byte[], string)' is a method, which is not valid in the given context  
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
				var fontPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "fonts", "arialuni.ttf");
				if (!System.IO.File.Exists(fontPath)) // Fix for CS0119  
				{
					return BadRequest(new { message = "Không tìm thấy file font hỗ trợ tiếng Việt" });
				}
				var baseFont = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
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
				return new FileContentResult(memoryStream.ToArray(), "application/pdf")
				{
					FileDownloadName = fileName
				};
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
				// Lấy thông tin đơn hàng
				var order = await _context.Hoadonthanhtoans
					.Include(h => h.MaKhachHangNavigation)
					.Include(h => h.MaDatMonNavigation)
					.FirstOrDefaultAsync(h => h.MaHoaDon == orderId);

				if (order == null)
				{
					return NotFound(new { message = "Không tìm thấy đơn hàng" });
				}

				// Kiểm tra điều kiện gửi
				if (order.TrangThaiThanhToan != "completed")
				{
					return BadRequest(new { message = "Chỉ có thể gửi hóa đơn cho đơn hàng đã hoàn thành thanh toán" });
				}

				if (order.MaDatMonNavigation?.TrangThai != "Hoàn thành")
				{
					return BadRequest(new { message = "Chỉ có thể gửi hóa đơn cho đơn hàng đã hoàn thành phục vụ" });
				}

				// Lấy email người nhận
				var email = request.Email ?? order.MaKhachHangNavigation?.Email;
				if (string.IsNullOrEmpty(email))
				{
					return BadRequest(new { message = "Không có địa chỉ email để gửi" });
				}

				// Lấy chi tiết đơn hàng
				var orderDetails = await _context.Chitietdondatmons
					.Where(ct => ct.MaDatMon == order.MaDatMon)
					.Include(ct => ct.MaMonNavigation)
					.ToListAsync();

				// Tạo nội dung email HTML
				var emailBody = $@"
            <html>
            <head>
                <meta charset='UTF-8'>
            </head>
            <body style='font-family: Arial, sans-serif; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='text-align: center; color: #2c3e50;'>HÓA ĐƠN THANH TOÁN - NHÀ HÀNG QUANG QUÝ</h2>
                    <p style='text-align: center;'>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi. Dưới đây là thông tin hóa đơn của quý khách:</p>
                    <p style='text-align: center; color: #e74c3c;'><strong>Lưu ý:</strong> Hóa đơn PDF chi tiết sẽ được cung cấp qua kênh khác do hệ thống hiện chưa hỗ trợ đính kèm.</p>
                    <hr style='border: 1px solid #ddd; margin: 20px 0;'>
                    <h3 style='color: #2c3e50;'>Thông tin hóa đơn</h3>
                    <p><strong>Mã hóa đơn:</strong> {order.MaHoaDon}</p>
                    <p><strong>Ngày xuất:</strong> {DateTime.Now:dd/MM/yyyy HH:mm:ss}</p>
                    <p><strong>Khách hàng:</strong> {order.MaKhachHangNavigation?.TenKhachHang ?? "Khách vãng lai"}</p>
                    <p><strong>Số điện thoại:</strong> {order.MaKhachHangNavigation?.SoDienThoai ?? "N/A"}</p>
                    <p><strong>Mã bàn :</strong> {order.MaBanAn ?? "N/A"}</p>
                    <p><strong>Thời gian đặt:</strong> {order.ThoiGianDat:dd/MM/yyyy HH:mm:ss}</p>
                    <p><strong>Thời gian thanh toán:</strong> {(order.ThoiGianThanhToan.HasValue ? order.ThoiGianThanhToan.Value.ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}</p>
                    <h3 style='color: #2c3e50;'>Chi tiết đơn hàng</h3>
                    <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                        <thead>
                            <tr style='background-color: #f2f2f2;'>
                                <th style='border: 1px solid #ddd; padding: 10px; text-align: center;'>STT</th>
                                <th style='border: 1px solid #ddd; padding: 10px; text-align: left;'>Tên món</th>
                                <th style='border: 1px solid #ddd; padding: 10px; text-align: center;'>Số lượng</th>
                                <th style='border: 1px solid #ddd; padding: 10px; text-align: right;'>Đơn giá</th>
                                <th style='border: 1px solid #ddd; padding: 10px; text-align: right;'>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {string.Join("", orderDetails.Select((detail, index) => $@"
                                <tr>
                                    <td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>{index + 1}</td>
                                    <td style='border: 1px solid #ddd; padding: 10px;'>{detail.MaMonNavigation?.TenMon ?? ""}</td>
                                    <td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>{detail.SoLuong}</td>
                                    <td style='border: 1px solid #ddd; padding: 10px; text-align: right;'>{detail.Gia:N0} ₫</td>
                                    <td style='border: 1px solid #ddd; padding: 10px; text-align: right;'>{detail.TongTien:N0} ₫</td>
                                </tr>"))}
                        </tbody>
                    </table>
                    <h3 style='color: #2c3e50;'>Tổng kết</h3>
                    <p style='text-align: right;'><strong>Tạm tính:</strong> {order.TongTien:N0} ₫</p>
                    {(order.TienGiam > 0 ? $"<p style='text-align: right;'><strong>Giảm giá:</strong> -{order.TienGiam:N0} ₫</p>" : "")}
                    <p style='text-align: right;'><strong>Tiền cọc:</strong> {order.SoTienCoc:N0} ₫</p>
                    <p style='text-align: right;'><strong>Tiền còn lại:</strong> {order.SoTienConLai:N0} ₫</p>
                    <p style='text-align: right;'><strong>TỔNG CỘNG:</strong> {(order.TongTien ?? 0) - (order.TienGiam ?? 0):N0} ₫</p>
                    <p style='text-align: right;'><strong>Phương thức thanh toán:</strong> {order.PhuongThucThanhToan}</p>
                    <hr style='border: 1px solid #ddd; margin: 20px 0;'>
                    <p style='text-align: center; font-style: italic;'>Cảm ơn quý khách và hẹn gặp lại!</p>
                    <p style='text-align: center; color: #7f8c8d;'>Nhà Hàng Quang Quý - 106 Phạm Nhữ Tăng, Thanh Khê Đông, TP Đà Nẵng</p>
                </div>
            </body>
            </html>";

				// Gửi email
				await _emailService.SendEmailAsync(
					email,
					"Hóa đơn thanh toán - Nhà Hàng Quang Quý",
					emailBody
				);

				return Ok(new { message = "Gửi hóa đơn qua email thành công" });
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = "Lỗi khi gửi hóa đơn", error = ex.Message });
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
			public decimal? Deposit { get; set; }
			public decimal? Discount { get; set; } = 0;
			public List<OrderItemRequest> Items { get; set; } = new();
		}

		// Model dành cho Update
		public class UpdateOrderRequest
		{
			public string CustomerName { get; set; } = null!;
			public List<string> TableIds { get; set; } = new();
			public string Status { get; set; } = "processing";     // payment status
			public string StatusOrderFood { get; set; } = "pending";
			public string PaymentMethod { get; set; } = "cash";
			public string? Notes { get; set; }
			public int Guest { get; set; }
			public decimal Discount { get; set; }                      // thêm trường Discount
			public decimal Deposit { get; set; }                      // thêm trường Deposit
			public DateTime DateComming { get; set; } = DateTime.Now; // thời gian đến bàn
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
}
