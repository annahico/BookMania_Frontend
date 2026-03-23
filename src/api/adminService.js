import axiosInstance from "./axiosInstance";

const adminService = {
    getAllLoans: async () => {
        const response = await axiosInstance.get("/api/loans");
        return response.data;
    },

    getAllFines: async () => {
        const response = await axiosInstance.get("/api/fines");
        return response.data;
    },

    getAllReservations: async () => {
        const response = await axiosInstance.get("/api/reservations");
        return response.data;
    },

    createBook: async (bookData) => {
        const response = await axiosInstance.post("/api/books", bookData);
        return response.data;
    },

    updateBook: async (id, bookData) => {
        const response = await axiosInstance.put(`/api/books/${id}`, bookData);
        return response.data;
    },

    deleteBook: async (id) => {
        await axiosInstance.delete(`/api/books/${id}`);
    },

    createCategory: async (categoryData) => {
        const response = await axiosInstance.post("/api/categories", categoryData);
        return response.data;
    },

    updateCategory: async (id, categoryData) => {
        const response = await axiosInstance.put(`/api/categories/${id}`, categoryData);
        return response.data;
    },

    deleteCategory: async (id) => {
        await axiosInstance.delete(`/api/categories/${id}`);
    },

    deleteFine: async (id) => {
        await axiosInstance.delete(`/api/fines/${id}`);
    },
};

export default adminService;