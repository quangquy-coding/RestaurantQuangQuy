using Microsoft.AspNetCore.Mvc;

namespace RestaurantQuangQuy.Controllers.Admin
{
	public class NhanVienManagerController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
