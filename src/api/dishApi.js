import axios from "axios";

const API_URL = "http://localhost:5080/api/MonAnManager";

export const getDishes = () => axios.get(API_URL);
export const addDish = (data) => axios.post(API_URL, data);
export const updateDish = (id, data) => axios.put(`${API_URL}`, data);
export const deleteDish = (id) => axios.delete(`${API_URL}/${id}`);
export const getCategories = () => axios.get(`${API_URL}/DanhMuc`);



