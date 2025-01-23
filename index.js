import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

// Inisialisasi Prisma dan Express
const prisma = new PrismaClient();
const app = express();

// Gunakan Middleware CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi multer untuk menyimpan gambar di folder 'uploads'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Simpan semua file di folder 'uploads'
  },
  filename: (req, file, cb) => {
    const { judul } = req.body; // Ambil nama buku dari body request
    const sanitizedJudul = judul.replace(/[^a-zA-Z0-9-_]/g, "_"); // Hindari karakter ilegal di nama file
    const extension = path.extname(file.originalname); // Ekstensi file (misal .jpg, .png, atau .pdf)

    // Nama file = judul yang sudah disanitasi + ekstensi
    cb(null, `${sanitizedJudul}${extension}`);
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

// Middleware untuk melayani file statis dari folder 'uploads'
app.use("/uploads", express.static("uploads"));

// Endpoint untuk mendapatkan semua buku
app.get("/books", async (req, res) => {
  const books = await prisma.books.findMany();
  res.json({ data: books });
});

// Endpoint untuk menambahkan buku beserta gambar
app.post(
  "/books/add",
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

// Endpoint untuk mengupdate buku beserta gambar (opsional)
app.put("/books/:id/update", upload.single("gambar"), async (req, res) => {
  const { judul, penulis, penerbit, tahun_terbit } = req.body;
  const gambarPath = req.file ? `/uploads/${req.file.filename}` : null;

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
});

// Endpoint untuk menghapus buku
app.delete("/books/:id/delete", async (req, res) => {
  try {
    // Cari buku berdasarkan ID
    const book = await prisma.books.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    // Hapus file gambar jika ada
    if (book.gambar) {
      const filePath = `.${book.gambar}`; // Path file dari gambar
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted:", filePath);
        }
      });
    }

    // Hapus buku dari database
    const result = await prisma.books.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Book deleted!", deleted: result });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error });
  }
});

// Menjalankan server
app.listen(3030, () => {
  console.log("App listening on port: http://localhost:3030");
});
