import express from "express";
import { registerController } from "../controller/user.controller.js";
const router = express.Router();

// router.post("/login", loginController);
router.post("/register", registerController);

export default router;
