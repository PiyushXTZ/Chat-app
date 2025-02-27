import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/message.models.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
dotenv.config(); // Load environment variables

const GROUP_ID = "67b5c6ac981485e9e97e2dec"; // Target group ID

const seedMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Fetch the group
    const group = await Group.findById(GROUP_ID).populate("members");
    if (!group) {
      console.log("Group not found!");
      return;
    }

    const members = group.members;
    if (members.length === 0) {
      console.log("No members in the group. Add users first.");
      return;
    }

    // Sample messages
    const messages = [
      { text: "Hello everyone!", senderId: members[0]._id, groupId: GROUP_ID },
      { text: "What's up?", senderId: members[1]?._id, groupId: GROUP_ID },
      { text: "Let's plan something fun!", senderId: members[2]?._id, groupId: GROUP_ID },
    ].filter(msg => msg.senderId); // Remove undefined senders

    // Insert messages
    const createdMessages = await Message.insertMany(messages);

    // Update the group with message IDs
    await Group.findByIdAndUpdate(GROUP_ID, {
      $push: { messages: { $each: createdMessages.map(msg => msg._id) } },
      lastMessage: createdMessages[createdMessages.length - 1].text, // Update last message
    });

    console.log("Messages seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding messages:", error);
    mongoose.connection.close();
  }
};

seedMessages();
