using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RestaurantQuangQuy.Models;

public partial class RestaurantManagementContext : DbContext
{
    public RestaurantManagementContext()
    {
    }

    public RestaurantManagementContext(DbContextOptions<RestaurantManagementContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Banan> Banans { get; set; }
	
	public virtual DbSet<Baocaodoanhthu> Baocaodoanhthus { get; set; }

    public virtual DbSet<Chitietdondatmon> Chitietdondatmons { get; set; }

    public virtual DbSet<Danhgium> Danhgia { get; set; }

    public virtual DbSet<Danhmuc> Danhmucs { get; set; }
	public object DanhMucs { get; internal set; }
	public virtual DbSet<Datban> Datbans { get; set; }

    public virtual DbSet<Dondatmon> Dondatmons { get; set; }

    public virtual DbSet<Hoadonthanhtoan> Hoadonthanhtoans { get; set; }

    public virtual DbSet<Khachhang> Khachhangs { get; set; }

    public virtual DbSet<Khuyenmai> Khuyenmais { get; set; }

    public virtual DbSet<Monan> Monans { get; set; }

    public virtual DbSet<Nhanvien> Nhanviens { get; set; }

    public virtual DbSet<Quyentruycap> Quyentruycaps { get; set; }

    public virtual DbSet<Taikhoan> Taikhoans { get; set; }

    public virtual DbSet<DatBanBanAn> DatBanBanAns { get; set; }

    public object BanAnDTO { get; internal set; }

	protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Banan>(entity =>
        {
            entity.HasKey(e => e.MaBan).HasName("PK__BANAN__1B8FFFB2021B50CB");

            entity.ToTable("BANAN");

            entity.Property(e => e.MaBan)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBan");
            entity.Property(e => e.GhiChu)
                .HasMaxLength(200)
                .HasColumnName("ghiChu");
            entity.Property(e => e.SoChoNgoi).HasColumnName("soChoNgoi");
            entity.Property(e => e.TenBan)
                .HasMaxLength(50)
                .HasColumnName("tenBan");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .HasColumnName("trangThai");

        });

        modelBuilder.Entity<Banan>()
        .HasMany(b => b.DatBanBanAns)
        .WithOne(dbba => dbba.Banans)
        .HasForeignKey(dbba => dbba.MaBanAn)
        .OnDelete(DeleteBehavior.ClientSetNull)
        .HasConstraintName("FK__DATBAN_BA__maBan__571DF1D5");

        modelBuilder.Entity<Datban>()
            .HasMany(d => d.DatBanBanAns)
            .WithOne(dbba => dbba.Datbans)
            .HasForeignKey(dbba => dbba.MaDatBan)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("FK__DATBAN_BA__maBan__5812160E");


        modelBuilder.Entity<Baocaodoanhthu>(entity =>
        {
            entity.HasKey(e => e.MaBaoCao).HasName("PK__BAOCAODO__D21F362ADE33777D");

            entity.ToTable("BAOCAODOANHTHU");

            entity.Property(e => e.MaBaoCao)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBaoCao");
            entity.Property(e => e.MaHoaDon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maHoaDon");
            entity.Property(e => e.NgayBaoCao).HasColumnName("ngayBaoCao");
            entity.Property(e => e.SoHoaDon).HasColumnName("soHoaDon");
            entity.Property(e => e.SoLuongMon).HasColumnName("soLuongMon");
            entity.Property(e => e.TongDoanhThu)
                .HasColumnType("decimal(12, 2)")
                .HasColumnName("tongDoanhThu");

            entity.HasOne(d => d.MaHoaDonNavigation).WithMany(p => p.Baocaodoanhthus)
                .HasForeignKey(d => d.MaHoaDon)
                .HasConstraintName("FK__BAOCAODOA__maHoa__787EE5A0");
        });

        modelBuilder.Entity<Chitietdondatmon>(entity =>
        {
            entity.HasKey(e => new { e.MaDatMon, e.MaMon }).HasName("PK__CHITIETD__7DF8C33D8E177503");

            entity.ToTable("CHITIETDONDATMON", tb => tb.HasTrigger("trg_CapNhatTongTienDonHang"));

            entity.Property(e => e.MaDatMon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maDatMon");
            entity.Property(e => e.MaMon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maMon");
            entity.Property(e => e.Gia)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("gia");
            entity.Property(e => e.SoLuong).HasColumnName("soLuong");
            entity.Property(e => e.TongTien)
                .HasComputedColumnSql("([soLuong]*[gia])", false)
                .HasColumnType("decimal(21, 2)")
                .HasColumnName("tongTien");

            entity.HasOne(d => d.MaDatMonNavigation).WithMany(p => p.Chitietdondatmons)
                .HasForeignKey(d => d.MaDatMon)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CHITIETDO__maDat__6383C8BA");

            entity.HasOne(d => d.MaMonNavigation).WithMany(p => p.Chitietdondatmons)
                .HasForeignKey(d => d.MaMon)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CHITIETDO__maMon__6477ECF3");
        });

        modelBuilder.Entity<Danhgium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DANHGIA__6B15DD9A6D080BB0");

            entity.ToTable("DANHGIA");

            entity.Property(e => e.MaDanhGia)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maDanhGia");
            entity.Property(e => e.MaHoaDon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maHoaDon");
            entity.Property(e => e.MaKhachHang)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhachHang");
            entity.Property(e => e.NgayDanhGia).HasColumnName("ngayDanhGia");
            entity.Property(e => e.NoiDungPhanHoi)
                .HasMaxLength(500)
                .HasColumnName("noiDungPhanHoi");
            entity.Property(e => e.XepHang).HasColumnName("xepHang");

            entity.HasOne(d => d.MaHoaDonNavigation).WithMany(p => p.Danhgia)
                .HasForeignKey(d => d.MaHoaDon)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DANHGIA__maHoaDo__72C60C4A");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.Danhgia)
                .HasForeignKey(d => d.MaKhachHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DANHGIA__maKhach__71D1E811");
        });

        modelBuilder.Entity<Danhmuc>(entity =>
        {
            entity.HasKey(e => e.MaDanhMuc).HasName("PK__DANHMUC__6B0F914C953BE2DE");

            entity.ToTable("DANHMUC");

            entity.Property(e => e.MaDanhMuc)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maDanhMuc");
            entity.Property(e => e.MoTa)
                .HasMaxLength(200)
                .HasColumnName("moTa");
            entity.Property(e => e.TenDanhMuc)
                .HasMaxLength(50)
                .HasColumnName("tenDanhMuc");
            entity.Property(e => e.TinhTrang)
                .HasMaxLength(20)
                .HasColumnName("tinhTrang");
        });

        modelBuilder.Entity<Datban>(entity =>
        {
            entity.HasKey(e => e.MaBanAn).HasName("PK__DATBAN__F95DC5422D848DF9");

            entity.ToTable("DATBAN");

            entity.Property(e => e.MaBanAn)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBanAn");
            entity.Property(e => e.GhiChu)
                .HasMaxLength(200)
                .HasColumnName("ghiChu");
            entity.Property(e => e.MaKhachHang)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhachHang");
            entity.Property(e => e.ThoiGianDat)
                .HasColumnType("datetime")
                .HasColumnName("thoiGianDat");
            entity.Property(e => e.ThoiGianDen)
                .HasColumnType("datetime")
                .HasColumnName("thoiGianDen");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .HasColumnName("trangThai");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.Datbans)
                .HasForeignKey(d => d.MaKhachHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DATBAN__maKhachH__534D60F1");
        });

        modelBuilder.Entity<Dondatmon>(entity =>
        {
            entity.HasKey(e => e.MaDatMon).HasName("PK__DONDATMO__CF8D8482F745E7AB");

            entity.ToTable("DONDATMON", tb => tb.HasTrigger("trg_TaoHoaDonKhiHoanThanh"));

            entity.Property(e => e.MaDatMon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maDatMon");
            entity.Property(e => e.GhiChu)
                .HasMaxLength(200)
                .HasColumnName("ghiChu");
            entity.Property(e => e.MaBanAn)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBanAn");
            entity.Property(e => e.MaKhachHang)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhachHang");
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("soDienThoai");
            entity.Property(e => e.SoLuong).HasColumnName("soLuong");
            entity.Property(e => e.ThoiGianDat)
                .HasColumnType("datetime")
                .HasColumnName("thoiGianDat");
            entity.Property(e => e.TongTien)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("tongTien");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .HasColumnName("trangThai");

            entity.HasOne(d => d.MaBanAnNavigation).WithMany(p => p.Dondatmons)
                .HasForeignKey(d => d.MaBanAn)
                .HasConstraintName("FK__DONDATMON__maBan__5DCAEF64");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.Dondatmons)
                .HasForeignKey(d => d.MaKhachHang)
                .HasConstraintName("FK__DONDATMON__maKha__5EBF139D");
        });

        modelBuilder.Entity<Hoadonthanhtoan>(entity =>
        {
            entity.HasKey(e => e.MaHoaDon).HasName("PK__HOADONTH__026B4D9A8226E812");

            entity.ToTable("HOADONTHANHTOAN", tb => tb.HasTrigger("trg_CapNhatBaoCaoDoanhThu"));

            entity.Property(e => e.MaHoaDon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maHoaDon");
            entity.Property(e => e.GhiChu)
                .HasMaxLength(200)
                .HasColumnName("ghiChu");
            entity.Property(e => e.MaBanAn)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBanAn");
            entity.Property(e => e.MaDatMon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maDatMon");
            entity.Property(e => e.MaKhachHang)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhachHang");
            entity.Property(e => e.MaKhuyenMai)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhuyenMai");
            entity.Property(e => e.MaNhanVien)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maNhanVien");
            entity.Property(e => e.PhuongThucThanhToan)
                .HasMaxLength(50)
                .HasColumnName("phuongThucThanhToan");
            entity.Property(e => e.SoLuongKhach).HasColumnName("soLuongKhach");
            entity.Property(e => e.ThoiGianDat)
                .HasColumnType("datetime")
                .HasColumnName("thoiGianDat");
            entity.Property(e => e.ThoiGianThanhToan)
                .HasColumnType("datetime")
                .HasColumnName("thoiGianThanhToan");
            entity.Property(e => e.TongTien)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("tongTien");
            entity.Property(e => e.TrangThaiThanhToan)
                .HasMaxLength(20)
                .HasColumnName("trangThaiThanhToan");

            entity.HasOne(d => d.MaBanAnNavigation).WithMany(p => p.Hoadonthanhtoans)
                .HasForeignKey(d => d.MaBanAn)
                .HasConstraintName("FK__HOADONTHA__maBan__6B24EA82");

            entity.HasOne(d => d.MaDatMonNavigation).WithMany(p => p.Hoadonthanhtoans)
                .HasForeignKey(d => d.MaDatMon)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HOADONTHA__maDat__6A30C649");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.Hoadonthanhtoans)
                .HasForeignKey(d => d.MaKhachHang)
                .HasConstraintName("FK__HOADONTHA__maKha__6C190EBB");

            entity.HasOne(d => d.MaKhuyenMaiNavigation).WithMany(p => p.Hoadonthanhtoans)
                .HasForeignKey(d => d.MaKhuyenMai)
                .HasConstraintName("FK__HOADONTHA__maKhu__6D0D32F4");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.Hoadonthanhtoans)
                .HasForeignKey(d => d.MaNhanVien)
                .HasConstraintName("FK__HOADONTHA__maNha__6E01572D");
        });

        modelBuilder.Entity<Khachhang>(entity =>
        {
            entity.HasKey(e => e.MaKhachHang).HasName("PK__KHACHHAN__0CCB3D496C3B90F5");

            entity.ToTable("KHACHHANG");

            entity.HasIndex(e => e.SoDienThoai, "UQ__KHACHHAN__06ACB9A25BCCB420").IsUnique();

            entity.HasIndex(e => e.MaTaiKhoan, "UQ__KHACHHAN__8FFF6A9C294CDFEE").IsUnique();

            entity.Property(e => e.MaKhachHang)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhachHang");
            entity.Property(e => e.DiaChi)
                .HasMaxLength(200)
                .HasColumnName("diaChi");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maTaiKhoan");
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("soDienThoai");
            entity.Property(e => e.TenKhachHang)
                .HasMaxLength(100)
                .HasColumnName("tenKhachHang");

            entity.HasOne(d => d.MaTaiKhoanNavigation).WithOne(p => p.Khachhang)
                .HasForeignKey<Khachhang>(d => d.MaTaiKhoan)
                .HasConstraintName("FK__KHACHHANG__maTai__38996AB5");
        });

        modelBuilder.Entity<Khuyenmai>(entity =>
        {
            entity.HasKey(e => e.MaKhuyenMai).HasName("PK__KHUYENMA__87BEDDE90FE754E2");

            entity.ToTable("KHUYENMAI", tb => tb.HasTrigger("trg_KiemTraNgayKhuyenMai"));

            entity.Property(e => e.MaKhuyenMai)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maKhuyenMai");
            entity.Property(e => e.MucTienToiThieu)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("mucTienToiThieu");
            entity.Property(e => e.NgayBatDau).HasColumnName("ngayBatDau");
            entity.Property(e => e.NgayKetThuc).HasColumnName("ngayKetThuc");
            entity.Property(e => e.TenKhuyenMai)
                .HasMaxLength(100)
                .HasColumnName("tenKhuyenMai");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .HasColumnName("trangThai");
            entity.Property(e => e.TyLeGiamGia)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("tyLeGiamGia");
        });

        modelBuilder.Entity<Monan>(entity =>
        {
            entity.HasKey(e => e.MaMon).HasName("PK__MONAN__27547BFAA6F09E8B");

            entity.ToTable("MONAN");

            entity.Property(e => e.MaMon)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maMon");
            entity.Property(e => e.Gia)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("gia");
            entity.Property(e => e.HinhAnh)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("hinhAnh");
            entity.Property(e => e.MaDanhMuc)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maDanhMuc");
            entity.Property(e => e.MoTa)
                .HasMaxLength(200)
                .HasColumnName("moTa");
            entity.Property(e => e.TenMon)
                .HasMaxLength(100)
                .HasColumnName("tenMon");
            entity.Property(e => e.ThoiGianMon)
                .HasMaxLength(50)
                .HasColumnName("thoiGianMon");
            entity.Property(e => e.TinhTrang)
                .HasMaxLength(20)
                .HasColumnName("tinhTrang");

            entity.HasOne(d => d.MaDanhMucNavigation).WithMany(p => p.Monans)
                .HasForeignKey(d => d.MaDanhMuc)
                .HasConstraintName("FK__MONAN__maDanhMuc__49C3F6B7");
        });

        modelBuilder.Entity<Nhanvien>(entity =>
        {
            entity.HasKey(e => e.MaNhanVien).HasName("PK__NHANVIEN__BDDEF20DA9C8DD40");

            entity.ToTable("NHANVIEN");

            entity.HasIndex(e => e.MaTaiKhoan, "UQ__NHANVIEN__8FFF6A9C249031F7").IsUnique();

            entity.HasIndex(e => e.SoCccd, "UQ__NHANVIEN__C84E6072DB05F82B").IsUnique();

            entity.Property(e => e.MaNhanVien)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maNhanVien");
            entity.Property(e => e.ChucVu)
                .HasMaxLength(50)
                .HasColumnName("chucVu");
            entity.Property(e => e.HoTen)
                .HasMaxLength(100)
                .HasColumnName("hoTen");
            entity.Property(e => e.Luong)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("luong");
            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maTaiKhoan");
            entity.Property(e => e.NgayTuyenDung).HasColumnName("ngayTuyenDung");
            entity.Property(e => e.SoCccd)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("soCCCD");

            entity.HasOne(d => d.MaTaiKhoanNavigation).WithOne(p => p.Nhanvien)
                .HasForeignKey<Nhanvien>(d => d.MaTaiKhoan)
                .HasConstraintName("FK__NHANVIEN__maTaiK__3E52440B");
        });

        modelBuilder.Entity<Quyentruycap>(entity =>
        {
            entity.HasKey(e => e.MaQuyen).HasName("PK__QUYENTRU__97001DA32AC2B24D");

            entity.ToTable("QUYENTRUYCAP");

            entity.Property(e => e.MaQuyen)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maQuyen");
            entity.Property(e => e.MoTa)
                .HasMaxLength(200)
                .HasColumnName("moTa");
            entity.Property(e => e.TenQuyen)
                .HasMaxLength(50)
                .HasColumnName("tenQuyen");
        });

        modelBuilder.Entity<Taikhoan>(entity =>
        {
            entity.HasKey(e => e.MaTaiKhoan).HasName("PK__TAIKHOAN__8FFF6A9DCA1F286E");

            entity.ToTable("TAIKHOAN");

            entity.HasIndex(e => e.TenTaiKhoan, "UQ__TAIKHOAN__4A8306F421AB5FF9").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__TAIKHOAN__AB6E61649E4DE102").IsUnique();

            entity.Property(e => e.MaTaiKhoan)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maTaiKhoan");
            entity.Property(e => e.DiaChi)
                .HasMaxLength(200)
                .HasColumnName("diaChi");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.MaQuyen)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maQuyen");
            entity.Property(e => e.MatKhau)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("matKhau");
            entity.Property(e => e.NgayDangKy).HasColumnName("ngayDangKy");
            entity.Property(e => e.NgaySinh).HasColumnName("ngaySinh");
            entity.Property(e => e.SoDienThoai)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("soDienThoai");
            entity.Property(e => e.TenTaiKhoan)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("tenTaiKhoan");

            entity.HasOne(d => d.MaQuyenNavigation).WithMany(p => p.Taikhoans)
                .HasForeignKey(d => d.MaQuyen)
                .HasConstraintName("FK__TAIKHOAN__maQuye__33D4B598");
        });

        modelBuilder.Entity<DatBanBanAn>(entity =>
        {
            entity.HasKey(e => new { e.MaDatBan, e.MaBanAn }).HasName("PK__DATBAN_B__241A23E6A4488252");
            entity.ToTable("DATBANBANAN", tb => tb.HasTrigger("trg_CapNhatTrangThaiBan"));
            entity.Property(e => e.MaDatBan)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBan");
            entity.Property(e => e.MaBanAn)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("maBanAn");
        });
        modelBuilder.HasSequence("BanAnSeq");
        modelBuilder.HasSequence("DanhGiaSeq");
        modelBuilder.HasSequence("DanhMucSeq");
        modelBuilder.HasSequence("DatBanSeq");
        modelBuilder.HasSequence("DonDatMonSeq");
        modelBuilder.HasSequence("HoaDonSeq");
        modelBuilder.HasSequence("KhachHangSeq");
        modelBuilder.HasSequence("KhuyenMaiSeq");
        modelBuilder.HasSequence("MonAnSeq");
        modelBuilder.HasSequence("NhanVienSeq");
        modelBuilder.HasSequence("QuyenSeq");
        modelBuilder.HasSequence("TaiKhoanSeq");

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
