using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    /// <inheritdoc />
    public partial class PhanHoiDanhGia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhanHoiDanhGia",
                table: "DANHGIA",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhanHoiDanhGia",
                table: "DANHGIA");
        }
    }
}
