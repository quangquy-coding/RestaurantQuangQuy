namespace RestaurantQuangQuy.Models
{
    public class DatBanBanAn
    {
        public string MaDatBan { get; set; }
        public string MaBanAn { get; set; }

        public Datban Datbans { get; set; } = null!;

        public Banan Banans { get; set; } = null!;
    }
}
