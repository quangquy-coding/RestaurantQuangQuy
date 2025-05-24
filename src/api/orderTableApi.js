import axios from "axios";

const API_URL = "http://localhost:5080/api/DatBan";

export const getAll = () => axios.get(API_URL);

export const createOrderTable = (data) => axios.post(`${API_URL}/Create`, data);

export const updateOrderTable = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const deleteOrderTable = (id) => axios.delete(`${API_URL}/${id}`);
