using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    public partial class RenameViTriColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ViTri",
                table: "BANAN",
                newName: "viTri"
            );

            migrationBuilder.AlterColumn<string>(
                name: "viTri",
                table: "BANAN",
                type: "nvarchar(50)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ✅ Quay ngược lại tên cột ban đầu
            migrationBuilder.RenameColumn(
                name: "viTri",
                table: "BANAN",
                newName: "ViTri"
            );

            migrationBuilder.AlterColumn<string>(
                name: "ViTri",
                table: "BANAN",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldNullable: true
            );
        }
    }
}
