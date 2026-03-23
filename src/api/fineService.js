import axiosInstance from "./axiosInstance";

const fineService = {
  getMyFines: async () => {
    const response = await axiosInstance.get("/api/fines/my");
    return response.data;
  },
};

export default fineService;