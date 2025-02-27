import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  selectedGroup: null, // ✅ Store selected group
  isUsersLoading: false,
  isMessagesLoading: false,

  // ✅ Fetch list of users for direct messages
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ✅ Fetch direct messages with a specific user
  getDirectMessages: async (userId, type = "dm") => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?type=dm`);
      // ✅ Set query param
      
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  

  

  // ✅ Fetch group messages
  // getGroupMessages: async (groupId) => {
  //   set({ isMessagesLoading: true });
  //   try {
  //     const res = await axiosInstance.get(`/messages/${groupId}?type=group`);

  //     set({ messages: res.data });
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to fetch group messages");
  //   } finally {
  //     set({ isMessagesLoading: false });
  //   }
  // },

  // ✅ Send message (Handles both DM & Group)
  sendMessage: async (messageData) => {
    const { selectedUser, selectedGroup, messages } = get();
    try {
      const payload = {
        text: messageData.text,
        image: messageData.image || null,
        messageType: selectedGroup ? "group" : "private",
        groupId: selectedGroup?._id || null,
        receiverId: selectedUser?._id || null,
      };
      
      const res = await axiosInstance.post(`/messages/send`, payload);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // ✅ Subscribe to real-time updates for DMs & Groups
  

  // ✅ Unsubscribe from messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("groupMessage");
  },

  getGroupMessages: (groupId) => {
    set({ isMessagesLoading: true });

    const socket = useAuthStore.getState().socket;

    // Emit event to request messages
    socket.emit("getGroupMessages", { groupId });

    // Listen for the response
    socket.on("receiveGroupMessages", ({ groupId, messages }) => {
      console.log("📩 Received group messages:");
      set({ messages, isMessagesLoading: false });
    });
  },
  subscribeToMessages: () => {
    const { selectedUser, selectedGroup } = get();
    const socket = useAuthStore.getState().socket;
    
    if (!socket) return;
    
    console.log("👂 Setting up socket listeners...");
  
    // Clear previous listeners before adding new ones
    socket.off("newMessage");
    socket.off("groupMessage");
  
    // ✅ Listen for direct messages
    socket.on("newMessage", (newMessage) => {
      console.log("📩 Received Direct Message:", newMessage);
      
      if (selectedUser && newMessage.senderId?._id === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  
    // ✅ Listen for group messages
    socket.on("groupMessage", (newGroupMessage) => {
      console.log("📢 Received Group Message:", newGroupMessage);
      
      if (selectedGroup && newGroupMessage.groupId === selectedGroup._id) {
        set({ messages: [...get().messages, newGroupMessage] });
      }
    });
  
    console.log("✅ Listeners are set!");
  },  
  
  // ✅ Subscribe to new messages in real-time
  subscribeToMessagesGroup: () => {
    const { selectedGroup } = get();
    const socket = useAuthStore.getState().socket;
  
    if (selectedGroup?._id) {
      // ✅ Join the group room
      socket.emit("joinGroup", selectedGroup._id);
  
      // ✅ Listen for real-time messages
      socket.on("receiveGroupMessage", (newMessage) => {
        console.log("📩 New Group Message:", newMessage);
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      });
    }
  },
  
  // ✅ Unsubscribe from messages
  unsubscribeFromMessagesGroup: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("receiveGroupMessages");
    socket.off("receiveGroupMessage");
  },

  // ✅ Select a group for group chat
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null, messages: [] }),


  // ✅ Select a user for DM
  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null, messages: [] }),

}));
