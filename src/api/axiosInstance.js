import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only the login/register screens themselves don't need this warning
      // (a 401 there just means "wrong password", handled inline) — anywhere
      // else it means the session expired mid-use, which is worth explaining
      // instead of silently bouncing to the login screen.
      const onAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
      const hadSession = !!localStorage.getItem("token");
      if (hadSession && !onAuthPage) {
        sessionStorage.setItem("session_expired", "1");
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!onAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;