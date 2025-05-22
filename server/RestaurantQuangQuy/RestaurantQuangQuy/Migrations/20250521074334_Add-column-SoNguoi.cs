using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    /// <inheritdoc />
    public partial class AddcolumnSoNguoi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "soLuongKhach",
                table: "HOADONTHANHTOAN");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "ngayDangKy",
                table: "TAIKHOAN",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<string>(
                name: "hinhAnh",
                table: "TAIKHOAN",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "ngayTuyenDung",
                table: "NHANVIEN",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<int>(
                name: "soLuongKhach",
                table: "DATBAN",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hinhAnh",
                table: "TAIKHOAN");

            migrationBuilder.DropColumn(
                name: "soLuongKhach",
                table: "DATBAN");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "ngayDangKy",
                table: "TAIKHOAN",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "ngayTuyenDung",
                table: "NHANVIEN",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "soLuongKhach",
                table: "HOADONTHANHTOAN",
                type: "int",
                nullable: true);
        }
    }
}
