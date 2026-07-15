import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1", // match your backend's base URL
  withCredentials: true, // important if your backend uses cookies for JWT
});

export default api;