import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Group name
  description: { type: String }, // Optional group description
  profilePic: { type: String, default: "" }, // Group profile picture URL
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users in the group
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Group admin
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // Messages in the group
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Reference to the last message
  createdAt: { type: Date, default: Date.now },
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;