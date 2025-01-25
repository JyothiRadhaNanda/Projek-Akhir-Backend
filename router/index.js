import express from "express";
import bookRouter from "./book.router.js"; // Mengimpor router buku
import authRouter from "./auth.router.js";
import userRouter from "./user.router.js";

const router = express.Router();

// Menambahkan router buku ke router utama
router.use("/books", bookRouter);
router.use("/login", authRouter);
router.use("/user", userRouter);

export default router;
