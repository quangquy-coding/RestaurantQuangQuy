import axios from "axios"

const API_BASE_URL = "http://localhost:5080/api" // Thay đổi theo URL API của bạn

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Get all dishes
export const getAllDishes = async () => {
  try {
    const response = await api.get("/MonAnManager")
    return response.data
  } catch (error) {
    console.error("Get dishes error:", error)
    throw error
  }
}

// Get dish detail
export const getDishDetail = async (id) => {
  try {
    const response = await api.get(`/MonAnManager/ChiTiet/${id}`)
    return response.data
  } catch (error) {
    console.error("Get dish detail error:", error)
    throw error
  }
}

// Search dishes
export const searchDishes = async (tenMon, maDanhMuc, tinhTrang) => {
  try {
    const params = new URLSearchParams()
    if (tenMon) params.append("tenMon", tenMon)
    if (maDanhMuc) params.append("maDanhMuc", maDanhMuc)
    if (tinhTrang) params.append("tinhTrang", tinhTrang)

    const response = await api.get(`/MonAnManager/TimKiem?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error("Search dishes error:", error)
    throw error
  }
}

// Filter by category
export const filterByCategory = async (maDanhMuc) => {
  try {
    const response = await api.get(`/MonAnManager/LocTheoDanhMuc?maDanhMuc=${maDanhMuc}`)
    return response.data
  } catch (error) {
    console.error("Filter by category error:", error)
    throw error
  }
}

// Get categories
export const getCategories = async () => {
  try {
    const response = await api.get("/MonAnManager/DanhMuc")
    return response.data
  } catch (error) {
    console.error("Get categories error:", error)
    throw error
  }
}

// Get status options
export const getStatusOptions = async () => {
  try {
    const response = await api.get("/MonAnManager/TinhTrang")
    return response.data
  } catch (error) {
    console.error("Get status options error:", error)
    throw error
  }
}
