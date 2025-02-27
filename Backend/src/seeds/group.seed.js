import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

dotenv.config(); // Load environment variables

const seedMessages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://piyushnishadraj777:piyush777@cluster0.ntqry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Fetch a group and users
    const group = await Group.findOne(); // Get any existing group
    const users = await User.find();
console.log({group});

    if (!group || users.length < 2) {
      console.log("⚠️ No group or insufficient users found. Seeding aborted.");
      await mongoose.connection.close();
      return;
    }

    // Sample messages
    const messages = [
      {
        senderId: users[0]._id,
        text: "Hello everyone, welcome to the group!",
        image: "",
        createdAt: new Date(),
      },
      {
        senderId: users[1]._id,
        text: "Hey! Glad to be here 🚀",
        image: "",
        createdAt: new Date(),
      },
      {
        senderId: users[0]._id,
        text: "Check out this cool image!",
        image: "https://res.cloudinary.com/duxtbttze/image/upload/v1739881586/gczvalwkr8wt0fsxaran.jpg",
        createdAt: new Date(),
      },
    ];

    // Insert messages into the database
    const insertedMessages = await Message.insertMany(messages);
    console.log("✅ Messages seeded successfully!");

    // Update the group with message references
    group.messages.push(...insertedMessages.map((msg) => msg._id));
    await group.save();
    console.log("✅ Messages linked to the group!");

    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
  } catch (error) {
    console.error("❌ Error seeding messages:", error);
    await mongoose.connection.close();
  }
};

seedMessages();
