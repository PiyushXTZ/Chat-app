import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.models.js";
import Group from "../models/group.model.js";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Used to store online users
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  console.log("A user connected:", socket.id);

  
  // Join a group
  socket.on("joinGroup", async (groupId) => {
    socket.join(groupId); // Join the room for the group
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Leave a group
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId); // Leave the room for the group
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  // Send a group message
  socket.on("sendGroupMessage", async ({ groupId, senderId, text }) => {
    try {
      const message = new Message({
        senderId,
        groupId,
        text,
        messageType: "group",
      });
  
      await message.save();
  
      const populatedMessage = await Message.findById(message._id).populate(
        "senderId",
        "fullName profilePic"
      );
  
      await Group.findByIdAndUpdate(groupId, { lastMessage: message._id });
  
      // ✅ Emit message to all clients in the group
      io.to(groupId).emit("receiveGroupMessage", populatedMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
    }
  });
  

  socket.on("getGroupMessages", async ({ groupId }) => {
    try {
      // Fetch messages for the group
      const messages = await Message.find({ groupId })
        .populate("senderId", "fullName profilePic")
        .sort({ createdAt: 1 }); // Sort messages by oldest first
  
      console.log("📨 Sending group messages:", messages);
  
      // Send messages back to the requesting client
      socket.emit("receiveGroupMessages", { groupId, messages });
    } catch (error) {
      console.error("❌ Error fetching group messages:", error);
    }
  });
  socket.on("sendGroupMessage", async ({ groupId, senderId, text, image }) => {
    try {
      // Save the message
      const newMessage = new Message({ groupId, senderId, text, image });
      await newMessage.save();
  
      // Populate sender details before broadcasting
      const populatedMessage = await Message.findById(newMessage._id).populate(
        "senderId",
        "fullName profilePic"
      );
  
      console.log("📨 New group message:", populatedMessage);
  
      // Emit the message to all users in the group
      io.to(groupId).emit("receiveGroupMessage", { groupId, message: populatedMessage });
    } catch (error) {
      console.error("❌ Error sending group message:", error);
    }
  });
  
  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
