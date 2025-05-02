using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class HomeController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		public HomeController(RestaurantManagementContext context)
		{
			_context = context;
		}

		// GET: api/Home
		[HttpGet]
		public IActionResult GetMonAns()
		{
			var monAns = _context.Monans.ToList();
			if (monAns == null || !monAns.Any())
			{
				return NotFound("No dishes found.");
			}
			return Ok(monAns);
		}

	}
}
