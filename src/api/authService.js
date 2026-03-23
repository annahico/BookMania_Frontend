import axiosInstance from "./axiosInstance";

const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await axiosInstance.post("/api/auth/register", { name, email, password });
    return response.data;
  },
};

export default authService;