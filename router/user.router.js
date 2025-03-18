import express from "express";
import {
  deleteUserController,
  getAllUser,
  registerAdminController,
  registerController,
} from "../controller/user.controller.js";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware.js";
const router = express.Router();

// router.post("/login", loginController);
router.get("/get", authenticateToken, isAdmin, getAllUser);
router.post("/register", registerController);
router.post("/registerAdmin", registerAdminController);
router.delete("/delete", deleteUserController);
export default router;
