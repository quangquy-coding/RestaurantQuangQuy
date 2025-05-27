import axios from "axios"

const API_URL = "http://localhost:5080/api/DatMon"

export const getAll = () => axios.get(`${API_URL}/GetAll`)

export const createOrderFood = (data) => {
  return axios.post(`${API_URL}/CreateDatMonc`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
