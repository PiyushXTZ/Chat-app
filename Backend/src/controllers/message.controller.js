import User from "../models/user.model.js";
import Message from "../models/message.models.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getMessages = async (req, res) => {
//   try {
//     const chatId = req.params.userId || req.params.groupId;
//  // Can be userId or groupId
//     const myId = req.user._id;
//     const { type } = req.query; // Extract type from query params
//     console.log(type,chatId);
    
//     if (!type || !chatId) {
//       return res.status(400).json({ error: "Missing required parameters" });
//     }

//     console.log("Received query type:", type); // ✅ Debugging

//     let messages = [];

//     if (type === "group") {
//       // ✅ Fetch group messages only
//       messages = await Message.find({ groupId: chatId })
//         .populate("senderId", "fullName profilePic")
//         .sort({ createdAt: 1 }); // Sort messages in order
//     } else if (type === "dm") {
//       // ✅ Fetch only direct messages
//       messages = await Message.find({
//         $or: [
//           { senderId: myId, receiverId: chatId },
//           { senderId: chatId, receiverId: myId },
//         ],
//       })
//         .populate("senderId", "fullName profilePic")
//         .sort({ createdAt: 1 }); // Sort messages chronologically
//     } else {
//       return res.status(400).json({ error: "Invalid message type" });
//     }

//     return res.status(200).json(messages);
//   } catch (error) {
//     console.error("❌ Error in getMessages controller:", error.message);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params; // ✅ Now this will work correctly
    const myId = req.user._id;
    const { type } = req.query;

    console.log("Type:", type, "Chat ID:", chatId); // Debugging

    if (!type || !chatId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let messages = [];

    if (type === "group") {
      messages = await Message.find({ groupId: chatId })
        .populate("senderId", "fullName profilePic")
        .sort({ createdAt: 1 });
    } else if (type === "dm") {
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: chatId },
          { senderId: chatId, receiverId: myId },
        ],
      })
        .populate("senderId", "fullName profilePic")
        .sort({ createdAt: 1 });
    } else {
      return res.status(400).json({ error: "Invalid message type" });
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error in getMessages controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    console.log("📩 sendMessage triggered once");
    
    const { text, image, groupId, messageType, receiverId } = req.body;
    const senderId = req.user._id;

    if (!groupId && !receiverId) {
      return res.status(400).json({ error: "Either groupId or receiverId is required." });
    }

    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Save new message
    const newMessage = await new Message({
      senderId,
      receiverId: groupId ? null : receiverId || null,
      groupId: groupId || null,
      text,
      image: imageUrl || null,
      messageType,
    }).save();

    // Populate sender details
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic"
    );

    // Emit message only once
    if (groupId) {
      console.log("📢 Emitting group message");
      io.to(groupId).emit("groupMessage", populatedMessage);
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        console.log("📢 Emitting direct message");
        io.to(receiverSocketId).emit("newMessage", populatedMessage);
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const sendMessage = async (req, res) => {
//   try {
//     console.log("📩 sendMessage triggered once");
    
//     const { text, image, groupId, messageType, receiverId } = req.body;
//     const senderId = req.user._id;

//     if (!groupId && !receiverId) {
//       return res.status(400).json({ error: "Either groupId or receiverId is required." });
//     }

//     let imageUrl = null;
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     let newMessage = new Message({
//       senderId,
//       receiverId: groupId ? null : receiverId || null, // ✅ Ensure receiverId is explicitly set to null
//       groupId: groupId || null, // ✅ Ensure groupId is explicitly set to null
//       text,
//       image: imageUrl || null, // ✅ Ensure image is explicitly set to null
//       messageType,
//     });

//     await newMessage.save();

//     // ✅ Populate sender details before sending response
//     newMessage = await newMessage.populate("senderId", "fullName profilePic");

//     // Emit message only once
//     if (groupId) {
//       console.log("📢 Emitting group message");
//       io.to(groupId).emit("groupMessage", newMessage);
//     } else {
//       const receiverSocketId = getReceiverSocketId(receiverId);
//       if (receiverSocketId) {
//         console.log("📢 Emitting direct message");
//         io.to(receiverSocketId).emit("newMessage", newMessage);
//       }
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error("❌ Error in sendMessage:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
