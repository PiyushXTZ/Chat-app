import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // ✅ Ensure receiverId is always present
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null, // ✅ Ensure groupId is always present
    },
    text: {
      type: String,
      required: true, // ✅ Ensure a message contains text
    },
    image: {
      type: String,
      default: null, // ✅ Ensure image is always stored (even if null)
    },
    messageType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
