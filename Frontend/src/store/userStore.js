import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const useUserStore = create((set) => ({
  users: [],
  fetchUsers: async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },
}));

export default useUserStore;
