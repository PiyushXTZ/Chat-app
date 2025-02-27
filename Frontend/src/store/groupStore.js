import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  messages: [],
  isLoading: false,
  error: null,

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set((state) => ({
        groups: [...state.groups, res.data.group],
      }));
      return res.data.group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  fetchUserGroups: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.get(`/groups/usergroups`);
      set({ groups: res.data.groups, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to fetch groups", isLoading: false });
    }
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group });
  },

  getGroupMessages: async (groupId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.get(`/messages/${groupId}?type=group`);
      console.log("Fetched Messages:", res.data); // ✅ Debugging Line
  
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: Array.isArray(res.data) ? res.data : [], // ✅ Store full message objects
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ error: error.response?.data?.error || "Failed to fetch messages", isLoading: false });
    }
  },
    

  addMessage: (groupId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), message],
      },
    }));
  },

  subscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket; // Get socket instance
    if (!socket || !groupId) return;
  
    socket.on("newGroupMessage", (newMessage) => {
      console.log("Received new message:", newMessage); // ✅ Debugging Line
  
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), newMessage], // ✅ Append new messages properly
        },
      }));
    });
  },
  
  //This will stop the user to chat, ie when the user is logged out
    unsubscribeFromGroupMessages: (groupId) => {
  const socket = useAuthStore.getState().socket; // Get the socket instance
  if (!socket || !groupId) return;

  // Remove the event listener
  socket.off("newGroupMessage");
},
}));

export default useGroupStore;