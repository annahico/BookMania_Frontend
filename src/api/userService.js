import axiosInstance from "./axiosInstance";

const userService = {
  changePassword: async (currentPassword, newPassword) => {
    await axiosInstance.put("/api/users/me/password", { currentPassword, newPassword });
  },
};

export default userService;
