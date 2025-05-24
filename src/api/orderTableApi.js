import axios from "axios"

const API_URL = "http://localhost:5080/api/DatBan"

export const getAll = () => axios.get(`${API_URL}/GetAll`)

export const createOrderTable = (data) => {
  // Đảm bảo dữ liệu thời gian được format đúng trước khi gửi
  const formattedData = {
    ...data,
    // Kiểm tra và format lại thời gian nếu cần
    thoiGianDat: data.thoiGianDat,
    thoiGianDen: data.thoiGianDen,
  }

  console.log("📤 Gửi dữ liệu đặt bàn:", formattedData)

  return axios.post(`${API_URL}/Create`, formattedData, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const updateOrderTable = (id, data) => {
  // Đảm bảo dữ liệu thời gian được format đúng trước khi gửi
  const formattedData = {
    ...data,
    thoiGianDat: data.thoiGianDat,
    thoiGianDen: data.thoiGianDen,
  }

  console.log("📤 Cập nhật dữ liệu đặt bàn:", formattedData)

  return axios.put(`${API_URL}/Update/${id}`, formattedData, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const deleteOrderTable = (id) => axios.delete(`${API_URL}/Delete/${id}`)
