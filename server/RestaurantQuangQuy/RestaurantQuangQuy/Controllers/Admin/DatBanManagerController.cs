using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RestaurantQuangQuy.Models;

namespace RestaurantQuangQuy.Controllers.Admin
{
	[Route("api/[controller]")]
	[ApiController]
	public class DatBanManagerController : ControllerBase
	{
		private readonly RestaurantManagementContext _context;
		public DatBanManagerController(RestaurantManagementContext context)
		{
			_context = context;
		}
	}
}
