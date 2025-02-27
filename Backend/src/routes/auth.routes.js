import express from "express";
import { login,signup,logout,updateProfile,checkAuth,getAllUsers,updateUserProfile  } from "../controllers/auth.controllers.js";
import  protectRoute  from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/signup", signup);

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.get("/users",protectRoute,getAllUsers) // get all users4

router.put("/profile", protectRoute, updateUserProfile);
export default router;
