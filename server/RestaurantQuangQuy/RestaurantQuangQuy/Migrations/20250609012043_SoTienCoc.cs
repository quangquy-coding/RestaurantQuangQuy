using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    /// <inheritdoc />
    public partial class SoTienCoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "SoTienCoc",
                table: "HOADONTHANHTOAN",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SoTienConLai",
                table: "HOADONTHANHTOAN",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SoTienCoc",
                table: "HOADONTHANHTOAN");

            migrationBuilder.DropColumn(
                name: "SoTienConLai",
                table: "HOADONTHANHTOAN");
        }
    }
}
