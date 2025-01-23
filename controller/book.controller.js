import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
router.get("/", async (req, res) => {
  try {
    const books = await prisma.books.findMany();
    res.json({ data: books });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error });
  }
});

// Endpoint untuk menambahkan buku beserta gambar
router.post(
  "/add",
  upload.fields([
    { name: "gambar", maxCount: 1 }, // Untuk gambar
    { name: "pdf", maxCount: 1 }, // Untuk PDF
  ]),
  async (req, res) => {
    const { judul, penulis, penerbit, tahun_terbit } = req.body;
    const gambarPath = req.files?.gambar
      ? `/uploads/${req.files.gambar[0].filename}`
      : null;
    const pdfPath = req.files?.pdf
      ? `/uploads/${req.files.pdf[0].filename}`
      : null;

    try {
      const result = await prisma.books.create({
        data: {
          judul,
          penulis,
          penerbit,
          tahun_terbit: Number(tahun_terbit),
          gambar: gambarPath, // Path gambar
          pdf: pdfPath, // Path PDF
        },
      });

      res.json({ message: "New book added!", data: result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to add book", error: error.message });
    }
  }
);

// Endpoint untuk mengupdate buku beserta gambar
router.put("/:id/update", upload.single("gambar"), async (req, res) => {
  const { judul, penulis, penerbit, tahun_terbit } = req.body;
  const gambarPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await prisma.books.update({
      data: {
        judul,
        penulis,
        penerbit,
        tahun_terbit: Number(tahun_terbit),
        gambar: gambarPath, // Menyimpan path gambar baru jika diupload
      },
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Book updated!", data: result });
  } catch (error) {
    res.status(500).json({ message: "Failed to update book", error });
  }
});

// Endpoint untuk menghapus buku
router.delete("/:id/delete", async (req, res) => {
  try {
    const book = await prisma.books.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    if (book.gambar) {
      const filePath = `.${book.gambar}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted:", filePath);
        }
      });
    }

    const result = await prisma.books.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Book deleted!", deleted: result });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error });
  }
});

export default router;
