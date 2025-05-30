using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class BanAnControllers : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		public BanAnControllers(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/BanAn
		[HttpGet]
		public IActionResult GetBanans()
		{
			var banans = _context.Banans.ToList();
			if (banans == null || !banans.Any())
			{
				return NotFound("No dishes found.");
			}
			return Ok(banans);
		}

		// GET: api/BanAn/5
		[HttpGet("{id}")]
		public IActionResult GetBanAn(string id)
		{
			var banAn = _context.Banans.Find(id);
			// tìm theo tên bàn và mã bàn

			if (banAn == null)
			{
				banAn = _context.Banans.FirstOrDefault(b => b.MaBan == id);
			}
			if (banAn == null)
			{
				banAn = _context.Banans.FirstOrDefault(b => b.TenBan == id);
			}
		
			if (banAn == null)
			{
				return NotFound($"Dish with ID {id} not found.");
			}
			return Ok(banAn);
		}
		// POST: api/BanAn
		[HttpPost]
		public IActionResult CreateBanAn([FromBody] Banan banan)
		{
			if (banan == null)
			{
				return BadRequest("Invalid dish data.");
			}
			_context.Banans.Add(banan);
			_context.SaveChanges();
			return CreatedAtAction(nameof(GetBanAn), new { id = banan.MaBan }, banan);
		}
		// PUT: api/BanAn/5
		[HttpPut("{id}")]
		public IActionResult UpdateBanAn(string id, [FromBody] Banan banan)
		{
			if (id != banan.MaBan)
			{
				return BadRequest("Dish ID mismatch.");
			}
			var existingBanAn = _context.Banans.Find(id);
			if (existingBanAn == null)
			{
				return NotFound($"Dish with ID {id} not found.");
			}
			existingBanAn.TenBan= banan.TenBan;
			existingBanAn.SoChoNgoi = banan.SoChoNgoi;
		
			existingBanAn.GhiChu = banan.GhiChu;
			_context.SaveChanges();
			return NoContent();
		}
		// DELETE: api/BanAn/5
		[HttpDelete("{id}")]
		public IActionResult DeleteBanAn(string id)
		{
			var banAn = _context.Banans.Find(id);
			if (banAn == null)
			{
				return NotFound($"Dish with ID {id} not found.");
			}
			_context.Banans.Remove(banAn);
			_context.SaveChanges();
			return NoContent();
		}
	}
}
