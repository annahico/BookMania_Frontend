import axiosInstance from "./axiosInstance";

const loanService = {
  create: async (bookId) => {
    const response = await axiosInstance.post("/api/loans", { bookId });
    return response.data;
  },

  getMyLoans: async () => {
    const response = await axiosInstance.get("/api/loans/my");
    return response.data;
  },

  extend: async (loanId) => {
    const response = await axiosInstance.put(`/api/loans/${loanId}/extend`);
    return response.data;
  },

  returnBook: async (loanId) => {
    const response = await axiosInstance.put(`/api/loans/${loanId}/return`);
    return response.data;
  },
};

export default loanService;