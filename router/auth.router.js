import express from "express";
import AuthController from "../controller/auth.controller.js";

const router = express.Router();

router.post("/", AuthController.login);

export default router;
