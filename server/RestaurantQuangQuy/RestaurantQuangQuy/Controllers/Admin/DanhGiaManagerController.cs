using Microsoft.AspNetCore.Mvc;

namespace RestaurantQuangQuy.Controllers.Admin
{
	public class DanhGiaManagerController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
