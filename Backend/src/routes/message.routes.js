import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

// ✅ Separate route for fetching **group** messages
// router.get("/group/:groupId", protectRoute, getMessages); 

// // ✅ Separate route for fetching **direct** messages
// router.get("/dm/:userId", protectRoute, (req, res) => {
//     req.query.type = "dm"; 
//     console.log(req.query.type);
//      // ✅ Force type to "dm"
//     getMessages(req, res);
//   });
  

router.get("/:id", protectRoute, getMessages);

// ✅ Modify send message route to support both DM & Group messages
router.post("/send", protectRoute, sendMessage);

export default router;
