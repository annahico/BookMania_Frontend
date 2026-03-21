import axiosInstance from "./axiosInstance";

const reservationService = {
  create: async (bookId) => {
    const response = await axiosInstance.post("/api/reservations", { bookId });
    return response.data;
  },

  getMyReservations: async () => {
    const response = await axiosInstance.get("/api/reservations/my");
    return response.data;
  },

  cancel: async (reservationId) => {
    const response = await axiosInstance.delete(`/api/reservations/${reservationId}`);
    return response.data;
  },
};

export default reservationService;