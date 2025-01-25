import { PrismaClient } from "@prisma/client";
import fs from "fs";
const prisma = new PrismaClient();

// Controller untuk mendapatkan semua buku
export const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json({ data: books });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error });
  }
};

// Controller untuk menambahkan buku beserta gambar
export const addBook = async (req, res) => {
  const { judul, penulis, penerbit, tahun_terbit } = req.body;
  const gambarPath = req.files?.gambar
    ? `/uploads/${req.files.gambar[0].filename}`
    : null;
  const pdfPath = req.files?.pdf
    ? `/uploads/${req.files.pdf[0].filename}`
    : null;

  try {
    const result = await prisma.book.create({
      data: {
        judul,
        penulis,
        penerbit,
        tahun_terbit: Number(tahun_terbit),
        gambar: gambarPath, // Path gambar
        pdf: pdfPath, // Path PDF
        userId: req.user.userId,
      },
    });

    res.json({ message: "New book added!", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add book", error: error.message });
  }
};

// Controller untuk mengupdate buku beserta gambar
export const updateBook = async (req, res) => {
  const { judul, penulis, penerbit, tahun_terbit } = req.body;
  const gambarPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await prisma.book.update({
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
};

// Controller untuk menghapus buku
export const deleteBook = async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
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

    const result = await prisma.book.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Book deleted!", deleted: result });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error });
  }
};
