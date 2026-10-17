
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.API_URL || "https://snapzy-backend-4jqw.onrender.com/api",
    withCredentials: true,
});

export default api;
