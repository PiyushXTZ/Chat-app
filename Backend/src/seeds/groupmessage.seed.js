import mongoose from "mongoose";
import dotenv from "dotenv";
import Group from "../models/group.model.js"; // Adjust the path as needed

dotenv.config();

// MongoDB Connection
mongoose
  .connect("mongodb+srv://piyushnishadraj777:piyush777@cluster0.ntqry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.error("MongoDB Connection Error:", error));

// Seed Data
const seedGroups = async () => {
  try {
    await Group.deleteMany(); // Optional: Clears existing data

    const groups = [
      {
        _id: new mongoose.Types.ObjectId("67b7696590acd11acf2df8f1"),
        name: "test1",
        description: "test1",
        profilePic: "",
        members: [
          new mongoose.Types.ObjectId("67b7675812cd315f8a83d0b1"),
          new mongoose.Types.ObjectId("67b7674912cd315f8a83d0a6"),
        ],
        admin: new mongoose.Types.ObjectId("67b7674912cd315f8a83d0a6"),
        messages: [],
        createdAt: new Date("2025-02-20T17:41:57.561Z"),
      },
    ];

    await Group.insertMany(groups);
    console.log("Seed Data Inserted Successfully");
    process.exit();
  } catch (error) {
    console.error("Error Seeding Data:", error);
    process.exit(1);
  }
};

// Run Seeding
seedGroups();
