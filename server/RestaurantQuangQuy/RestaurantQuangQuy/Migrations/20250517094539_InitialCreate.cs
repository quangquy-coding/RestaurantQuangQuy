using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantQuangQuy.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "BanAnSeq");

            migrationBuilder.CreateSequence(
                name: "DanhGiaSeq");

            migrationBuilder.CreateSequence(
                name: "DanhMucSeq");

            migrationBuilder.CreateSequence(
                name: "DatBanSeq");

            migrationBuilder.CreateSequence(
                name: "DonDatMonSeq");

            migrationBuilder.CreateSequence(
                name: "HoaDonSeq");

            migrationBuilder.CreateSequence(
                name: "KhachHangSeq");

            migrationBuilder.CreateSequence(
                name: "KhuyenMaiSeq");

            migrationBuilder.CreateSequence(
                name: "MonAnSeq");

            migrationBuilder.CreateSequence(
                name: "NhanVienSeq");

            migrationBuilder.CreateSequence(
                name: "QuyenSeq");

            migrationBuilder.CreateSequence(
                name: "TaiKhoanSeq");

            migrationBuilder.CreateTable(
                name: "BANAN",
                columns: table => new
                {
                    maBan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenBan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ViTri = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    soChoNgoi = table.Column<int>(type: "int", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ghiChu = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__BANAN__1B8FFFB2021B50CB", x => x.maBan);
                });

            migrationBuilder.CreateTable(
                name: "DANHMUC",
                columns: table => new
                {
                    maDanhMuc = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenDanhMuc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    moTa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    tinhTrang = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    HinhAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoLuongMonAn = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DANHMUC__6B0F914C953BE2DE", x => x.maDanhMuc);
                });

            migrationBuilder.CreateTable(
                name: "KHUYENMAI",
                columns: table => new
                {
                    maKhuyenMai = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenKhuyenMai = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    mucTienToiThieu = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    tyLeGiamGia = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ngayBatDau = table.Column<DateOnly>(type: "date", nullable: false),
                    ngayKetThuc = table.Column<DateOnly>(type: "date", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__KHUYENMA__87BEDDE90FE754E2", x => x.maKhuyenMai);
                });

            migrationBuilder.CreateTable(
                name: "QUYENTRUYCAP",
                columns: table => new
                {
                    maQuyen = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenQuyen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    moTa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__QUYENTRU__97001DA32AC2B24D", x => x.maQuyen);
                });

            migrationBuilder.CreateTable(
                name: "MONAN",
                columns: table => new
                {
                    maMon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenMon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    moTa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    gia = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    hinhAnh = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    thoiGianMon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    tinhTrang = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    maDanhMuc = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    ThanhPhan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DinhDuong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiUng = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MONAN__27547BFAA6F09E8B", x => x.maMon);
                    table.ForeignKey(
                        name: "FK__MONAN__maDanhMuc__49C3F6B7",
                        column: x => x.maDanhMuc,
                        principalTable: "DANHMUC",
                        principalColumn: "maDanhMuc");
                });

            migrationBuilder.CreateTable(
                name: "TAIKHOAN",
                columns: table => new
                {
                    maTaiKhoan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenTaiKhoan = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    matKhau = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    soDienThoai = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    diaChi = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ngayDangKy = table.Column<DateOnly>(type: "date", nullable: false),
                    ngaySinh = table.Column<DateOnly>(type: "date", nullable: true),
                    maQuyen = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__TAIKHOAN__8FFF6A9DCA1F286E", x => x.maTaiKhoan);
                    table.ForeignKey(
                        name: "FK__TAIKHOAN__maQuye__33D4B598",
                        column: x => x.maQuyen,
                        principalTable: "QUYENTRUYCAP",
                        principalColumn: "maQuyen");
                });

            migrationBuilder.CreateTable(
                name: "KHACHHANG",
                columns: table => new
                {
                    maKhachHang = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    tenKhachHang = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    soDienThoai = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    diaChi = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    maTaiKhoan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__KHACHHAN__0CCB3D496C3B90F5", x => x.maKhachHang);
                    table.ForeignKey(
                        name: "FK__KHACHHANG__maTai__38996AB5",
                        column: x => x.maTaiKhoan,
                        principalTable: "TAIKHOAN",
                        principalColumn: "maTaiKhoan");
                });

            migrationBuilder.CreateTable(
                name: "NHANVIEN",
                columns: table => new
                {
                    maNhanVien = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    hoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    chucVu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    luong = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    ngayTuyenDung = table.Column<DateOnly>(type: "date", nullable: false),
                    soCCCD = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    maTaiKhoan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__NHANVIEN__BDDEF20DA9C8DD40", x => x.maNhanVien);
                    table.ForeignKey(
                        name: "FK__NHANVIEN__maTaiK__3E52440B",
                        column: x => x.maTaiKhoan,
                        principalTable: "TAIKHOAN",
                        principalColumn: "maTaiKhoan");
                });

            migrationBuilder.CreateTable(
                name: "DATBAN",
                columns: table => new
                {
                    maBanAn = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maKhachHang = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    thoiGianDat = table.Column<DateTime>(type: "datetime", nullable: false),
                    thoiGianDen = table.Column<DateTime>(type: "datetime", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ghiChu = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DATBAN__F95DC5422D848DF9", x => x.maBanAn);
                    table.ForeignKey(
                        name: "FK__DATBAN__maKhachH__534D60F1",
                        column: x => x.maKhachHang,
                        principalTable: "KHACHHANG",
                        principalColumn: "maKhachHang");
                });

            migrationBuilder.CreateTable(
                name: "DATBANBANAN",
                columns: table => new
                {
                    maBan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maBanAn = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DATBAN_B__241A23E6A4488252", x => new { x.maBan, x.maBanAn });
                    table.ForeignKey(
                        name: "FK__DATBAN_BA__maBan__571DF1D5",
                        column: x => x.maBanAn,
                        principalTable: "BANAN",
                        principalColumn: "maBan");
                    table.ForeignKey(
                        name: "FK__DATBAN_BA__maBan__5812160E",
                        column: x => x.maBan,
                        principalTable: "DATBAN",
                        principalColumn: "maBanAn");
                });

            migrationBuilder.CreateTable(
                name: "DONDATMON",
                columns: table => new
                {
                    maDatMon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maBanAn = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    maKhachHang = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    soDienThoai = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    thoiGianDat = table.Column<DateTime>(type: "datetime", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    soLuong = table.Column<int>(type: "int", nullable: true),
                    tongTien = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    ghiChu = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DONDATMO__CF8D8482F745E7AB", x => x.maDatMon);
                    table.ForeignKey(
                        name: "FK__DONDATMON__maBan__5DCAEF64",
                        column: x => x.maBanAn,
                        principalTable: "DATBAN",
                        principalColumn: "maBanAn");
                    table.ForeignKey(
                        name: "FK__DONDATMON__maKha__5EBF139D",
                        column: x => x.maKhachHang,
                        principalTable: "KHACHHANG",
                        principalColumn: "maKhachHang");
                });

            migrationBuilder.CreateTable(
                name: "CHITIETDONDATMON",
                columns: table => new
                {
                    maDatMon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maMon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    soLuong = table.Column<int>(type: "int", nullable: false),
                    gia = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    tongTien = table.Column<decimal>(type: "decimal(21,2)", nullable: true, computedColumnSql: "([soLuong]*[gia])", stored: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CHITIETD__7DF8C33D8E177503", x => new { x.maDatMon, x.maMon });
                    table.ForeignKey(
                        name: "FK__CHITIETDO__maDat__6383C8BA",
                        column: x => x.maDatMon,
                        principalTable: "DONDATMON",
                        principalColumn: "maDatMon");
                    table.ForeignKey(
                        name: "FK__CHITIETDO__maMon__6477ECF3",
                        column: x => x.maMon,
                        principalTable: "MONAN",
                        principalColumn: "maMon");
                });

            migrationBuilder.CreateTable(
                name: "HOADONTHANHTOAN",
                columns: table => new
                {
                    maHoaDon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maDatMon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maBanAn = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    maKhachHang = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    soLuongKhach = table.Column<int>(type: "int", nullable: true),
                    thoiGianDat = table.Column<DateTime>(type: "datetime", nullable: false),
                    thoiGianThanhToan = table.Column<DateTime>(type: "datetime", nullable: true),
                    maKhuyenMai = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    tongTien = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    phuongThucThanhToan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    trangThaiThanhToan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    maNhanVien = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    ghiChu = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__HOADONTH__026B4D9A8226E812", x => x.maHoaDon);
                    table.ForeignKey(
                        name: "FK__HOADONTHA__maBan__6B24EA82",
                        column: x => x.maBanAn,
                        principalTable: "DATBAN",
                        principalColumn: "maBanAn");
                    table.ForeignKey(
                        name: "FK__HOADONTHA__maDat__6A30C649",
                        column: x => x.maDatMon,
                        principalTable: "DONDATMON",
                        principalColumn: "maDatMon");
                    table.ForeignKey(
                        name: "FK__HOADONTHA__maKha__6C190EBB",
                        column: x => x.maKhachHang,
                        principalTable: "KHACHHANG",
                        principalColumn: "maKhachHang");
                    table.ForeignKey(
                        name: "FK__HOADONTHA__maKhu__6D0D32F4",
                        column: x => x.maKhuyenMai,
                        principalTable: "KHUYENMAI",
                        principalColumn: "maKhuyenMai");
                    table.ForeignKey(
                        name: "FK__HOADONTHA__maNha__6E01572D",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                });

            migrationBuilder.CreateTable(
                name: "BAOCAODOANHTHU",
                columns: table => new
                {
                    maBaoCao = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    ngayBaoCao = table.Column<DateOnly>(type: "date", nullable: false),
                    tongDoanhThu = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    soHoaDon = table.Column<int>(type: "int", nullable: false),
                    soLuongMon = table.Column<int>(type: "int", nullable: false),
                    maHoaDon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__BAOCAODO__D21F362ADE33777D", x => x.maBaoCao);
                    table.ForeignKey(
                        name: "FK__BAOCAODOA__maHoa__787EE5A0",
                        column: x => x.maHoaDon,
                        principalTable: "HOADONTHANHTOAN",
                        principalColumn: "maHoaDon");
                });

            migrationBuilder.CreateTable(
                name: "DANHGIA",
                columns: table => new
                {
                    maDanhGia = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maKhachHang = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    maHoaDon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    noiDungPhanHoi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ngayDanhGia = table.Column<DateOnly>(type: "date", nullable: false),
                    xepHang = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DANHGIA__6B15DD9A6D080BB0", x => x.maDanhGia);
                    table.ForeignKey(
                        name: "FK__DANHGIA__maHoaDo__72C60C4A",
                        column: x => x.maHoaDon,
                        principalTable: "HOADONTHANHTOAN",
                        principalColumn: "maHoaDon");
                    table.ForeignKey(
                        name: "FK__DANHGIA__maKhach__71D1E811",
                        column: x => x.maKhachHang,
                        principalTable: "KHACHHANG",
                        principalColumn: "maKhachHang");
                });

            migrationBuilder.CreateIndex(
                name: "IX_BAOCAODOANHTHU_maHoaDon",
                table: "BAOCAODOANHTHU",
                column: "maHoaDon");

            migrationBuilder.CreateIndex(
                name: "IX_CHITIETDONDATMON_maMon",
                table: "CHITIETDONDATMON",
                column: "maMon");

            migrationBuilder.CreateIndex(
                name: "IX_DANHGIA_maHoaDon",
                table: "DANHGIA",
                column: "maHoaDon");

            migrationBuilder.CreateIndex(
                name: "IX_DANHGIA_maKhachHang",
                table: "DANHGIA",
                column: "maKhachHang");

            migrationBuilder.CreateIndex(
                name: "IX_DATBAN_maKhachHang",
                table: "DATBAN",
                column: "maKhachHang");

            migrationBuilder.CreateIndex(
                name: "IX_DATBANBANAN_maBanAn",
                table: "DATBANBANAN",
                column: "maBanAn");

            migrationBuilder.CreateIndex(
                name: "IX_DONDATMON_maBanAn",
                table: "DONDATMON",
                column: "maBanAn");

            migrationBuilder.CreateIndex(
                name: "IX_DONDATMON_maKhachHang",
                table: "DONDATMON",
                column: "maKhachHang");

            migrationBuilder.CreateIndex(
                name: "IX_HOADONTHANHTOAN_maBanAn",
                table: "HOADONTHANHTOAN",
                column: "maBanAn");

            migrationBuilder.CreateIndex(
                name: "IX_HOADONTHANHTOAN_maDatMon",
                table: "HOADONTHANHTOAN",
                column: "maDatMon");

            migrationBuilder.CreateIndex(
                name: "IX_HOADONTHANHTOAN_maKhachHang",
                table: "HOADONTHANHTOAN",
                column: "maKhachHang");

            migrationBuilder.CreateIndex(
                name: "IX_HOADONTHANHTOAN_maKhuyenMai",
                table: "HOADONTHANHTOAN",
                column: "maKhuyenMai");

            migrationBuilder.CreateIndex(
                name: "IX_HOADONTHANHTOAN_maNhanVien",
                table: "HOADONTHANHTOAN",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "UQ__KHACHHAN__06ACB9A25BCCB420",
                table: "KHACHHANG",
                column: "soDienThoai",
                unique: true,
                filter: "[soDienThoai] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UQ__KHACHHAN__8FFF6A9C294CDFEE",
                table: "KHACHHANG",
                column: "maTaiKhoan",
                unique: true,
                filter: "[maTaiKhoan] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MONAN_maDanhMuc",
                table: "MONAN",
                column: "maDanhMuc");

            migrationBuilder.CreateIndex(
                name: "UQ__NHANVIEN__8FFF6A9C249031F7",
                table: "NHANVIEN",
                column: "maTaiKhoan",
                unique: true,
                filter: "[maTaiKhoan] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UQ__NHANVIEN__C84E6072DB05F82B",
                table: "NHANVIEN",
                column: "soCCCD",
                unique: true,
                filter: "[soCCCD] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TAIKHOAN_maQuyen",
                table: "TAIKHOAN",
                column: "maQuyen");

            migrationBuilder.CreateIndex(
                name: "UQ__TAIKHOAN__4A8306F421AB5FF9",
                table: "TAIKHOAN",
                column: "tenTaiKhoan",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__TAIKHOAN__AB6E61649E4DE102",
                table: "TAIKHOAN",
                column: "email",
                unique: true,
                filter: "[email] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BAOCAODOANHTHU");

            migrationBuilder.DropTable(
                name: "CHITIETDONDATMON");

            migrationBuilder.DropTable(
                name: "DANHGIA");

            migrationBuilder.DropTable(
                name: "DATBANBANAN");

            migrationBuilder.DropTable(
                name: "MONAN");

            migrationBuilder.DropTable(
                name: "HOADONTHANHTOAN");

            migrationBuilder.DropTable(
                name: "BANAN");

            migrationBuilder.DropTable(
                name: "DANHMUC");

            migrationBuilder.DropTable(
                name: "DONDATMON");

            migrationBuilder.DropTable(
                name: "KHUYENMAI");

            migrationBuilder.DropTable(
                name: "NHANVIEN");

            migrationBuilder.DropTable(
                name: "DATBAN");

            migrationBuilder.DropTable(
                name: "KHACHHANG");

            migrationBuilder.DropTable(
                name: "TAIKHOAN");

            migrationBuilder.DropTable(
                name: "QUYENTRUYCAP");

            migrationBuilder.DropSequence(
                name: "BanAnSeq");

            migrationBuilder.DropSequence(
                name: "DanhGiaSeq");

            migrationBuilder.DropSequence(
                name: "DanhMucSeq");

            migrationBuilder.DropSequence(
                name: "DatBanSeq");

            migrationBuilder.DropSequence(
                name: "DonDatMonSeq");

            migrationBuilder.DropSequence(
                name: "HoaDonSeq");

            migrationBuilder.DropSequence(
                name: "KhachHangSeq");

            migrationBuilder.DropSequence(
                name: "KhuyenMaiSeq");

            migrationBuilder.DropSequence(
                name: "MonAnSeq");

            migrationBuilder.DropSequence(
                name: "NhanVienSeq");

            migrationBuilder.DropSequence(
                name: "QuyenSeq");

            migrationBuilder.DropSequence(
                name: "TaiKhoanSeq");
        }
    }
}
