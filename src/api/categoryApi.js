import axios from "axios";

const API_URL = "http://localhost:5080/api/DanhMucManager";

// Lấy tất cả danh mục (GET /api/DanhMucManager)
export const getAllCategories = () => axios.get(API_URL);

// Thêm danh mục mới (POST /api/DanhMucManager/create)
export const createCategory = (data) => axios.post(`${API_URL}/create`, data);

// Cập nhật danh mục (PUT /api/DanhMucManager/{id})
export const updateCategory = (id, data) => axios.put(`${API_URL}/${id}`, data);

// Xóa danh mục (DELETE /api/DanhMucManager/{id})
export const deleteCategory = (id) => axios.delete(`${API_URL}/${id}`);

// Tìm kiếm danh mục theo tên hoặc mô tả (GET /api/DanhMucManager/TimKiem?tenDanhMuc=...&moTa=...)
export const searchCategory = (tenDanhMuc, moTa) =>
  axios.get(`${API_URL}/TimKiem`, {
    params: { tenDanhMuc, moTa },
  });

// Lọc theo tình trạng (GET /api/DanhMucManager/Loc?trangThai=...)
export const filterCategoryByStatus = (trangThai) =>
  axios.get(`${API_URL}/Loc`, {
    params: { trangThai },
  });

// Lấy danh sách tình trạng cố định (GET /api/DanhMucManager/TinhTrang)
export const getTrangThaiOptions = () => axios.get(`${API_URL}/TinhTrang`);
