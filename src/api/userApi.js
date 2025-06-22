import axios from "axios";

// API URL configuration
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/NguoiDungManager`;

// API functions
const getUsers = () => axios.get(API_URL);
const getUserById = (id) => axios.get(`${API_URL}/${id}`);
const addUser = (data) => axios.post(API_URL, data);
const updateUser = (id, data) => axios.put(`${API_URL}/${id}`, data);
const deleteUser = (id) => axios.delete(`${API_URL}/${id}`);
const searchUsers = (keyword) =>
  axios.get(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
const filterUsersByRole = (role) =>
  axios.get(`${API_URL}/filter?role=${encodeURIComponent(role)}`);

export {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  searchUsers,
  filterUsersByRole,
};
