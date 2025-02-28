import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.models.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const admin = req.user.id;

    const group = new Group({
      name,
      description,
      profilePic: "",
      members: [...members],
      admin,
      messages: [],
    });

    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all groups for a user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId }).populate("admin", "fullName");
    res.status(200).json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get group details
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate("members", "fullName profilePic")
      .populate("admin", "fullName profilePic");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a user to a group
export const addUserToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "User added to group", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a user from a group
export const removeUserFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "User removed from group", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    await Group.findByIdAndDelete(groupId);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a message in a group

// export const sendGroupMessage = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const { groupId } = req.params;
//     const senderId = req.user.id;

//     const message = await Message.create({
//       senderId,
//       text,
//       groupId, // Match schema
//     });

//     await Group.findByIdAndUpdate(
//       groupId,
//       {
//         $push: { messages: message._id },
//         lastMessage: text, // Store last message in group
//       },
//       { new: true }
//     );
//     console.log("Send group message is actuve");
    
//     res.status(201).json({ message: "Message sent", data: message });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Get messages of a group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    
    const messages = await Message.find({ groupId }) // Use groupId (not group)
      .populate("senderId", "fullName profilePic");

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found for this group." });
    }

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
