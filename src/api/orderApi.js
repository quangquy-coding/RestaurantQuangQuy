import axios from 'axios';

const API_URL = "http://localhost:5080/api";

export const orderService = {
    createDatMon: (datMonDTO) =>
        axios.post(`${API_URL}/DatMon/CreateDatMon`, datMonDTO),

    createHoaDon: (hoaDonDTO) =>
        axios.post(`${API_URL}/HoaDonThanhToan/CreateHoaDon`, hoaDonDTO),

    deleteDatMon: (maDatMon) =>
        axios.delete(`${API_URL}/DatMon/DeleteDatMon/${maDatMon}`),
};