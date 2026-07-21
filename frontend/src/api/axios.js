import axios from "axios";

const api = axios.create({
  baseURL: "import.meta.env.VITE_API_BASE_URL", // match your backend's base URL
  withCredentials: true, // important if your backend uses cookies for JWT
});

export default api;