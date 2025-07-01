using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTrangThaiFromBanAn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "trangThai",
                table: "BANAN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "trangThai",
                table: "BANAN",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }
    }
}
