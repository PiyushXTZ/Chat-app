import express from "express";
import protectRoute from "../middleware/auth.middleware.js" 
import {
  createGroup,
  getUserGroups,
  getGroupById,
  addUserToGroup,
  removeUserFromGroup,
  deleteGroup,
  // sendGroupMessage,
  getGroupMessages,
} from "../controllers/group.controller.js"
import Group from "../models/group.model.js";
const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/usergroups", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupById);
router.put("/:groupId/add", protectRoute, addUserToGroup);
router.put("/:groupId/remove", protectRoute, removeUserFromGroup);
router.delete("/:groupId", protectRoute, deleteGroup);
// router.post("/:groupId/messages", protectRoute, sendGroupMessage);
router.get("/:groupId/messages", protectRoute, getGroupMessages);

router.get("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group and populate members
    const group = await Group.findById(groupId).populate(
      "members",
      "fullName profilePic",
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({
      name: group.name,
      description: group.description, // Access description directly
      members: group.members,
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ message: "Failed to fetch group members" });
  }
});

export default router;
