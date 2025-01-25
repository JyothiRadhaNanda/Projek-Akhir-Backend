import express from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../middleware/auth.middleware.js";
import * as BookController from "../controller/book.controller.js"; // Import controller

const router = express.Router();

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Simpan semua file di folder 'uploads'
  },
  filename: (req, file, cb) => {
    const { judul } = req.body; // Ambil nama buku dari body request
    const sanitizedJudul = judul.replace(/[^a-zA-Z0-9-_]/g, "_"); // Hindari karakter ilegal di nama file
    const extension = path.extname(file.originalname); // Ekstensi file (misal .jpg, .png, atau .pdf)
    cb(null, `${sanitizedJudul}${extension}`); // Nama file = judul yang sudah disanitasi + ekstensi
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // File diizinkan
  } else {
    cb(new Error("Only images and PDF files are allowed!"), false); // Menolak file dengan tipe lain
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Endpoint untuk mendapatkan semua buku
router.get("/", BookController.getAllBooks);

// Endpoint untuk menambahkan buku beserta gambar
router.post(
  "/add",
  authenticateToken,
  upload.fields([
    { name: "gambar", maxCount: 1 }, // Untuk gambar
    { name: "pdf", maxCount: 1 }, // Untuk PDF
  ]),
  BookController.addBook
);

// Endpoint untuk mengupdate buku beserta gambar
router.put("/:id/update", upload.single("gambar"), BookController.updateBook);

// Endpoint untuk menghapus buku
router.delete("/:id/delete", BookController.deleteBook);

export default router;
