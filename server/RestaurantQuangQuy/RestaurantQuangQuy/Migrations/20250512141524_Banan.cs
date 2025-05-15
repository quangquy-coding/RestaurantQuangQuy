using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    /// <inheritdoc />
    public partial class Banan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ViTri",
                table: "BANAN",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ViTri",
                table: "BANAN");
        }
    }
}
