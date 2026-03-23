import axiosInstance from "./axiosInstance";

const bookService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get("/api/books", { params });
    return response.data; // devuelve el objeto completo con content, totalPages, etc.
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/books/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosInstance.get("/api/categories");
    return response.data;
  },
};

export default bookService;