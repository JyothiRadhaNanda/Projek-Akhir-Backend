import express, { request } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

// const books = ["banana", "apple", "melon", "durian"];

app.get("/books", async (req, res) => {
  const books = await prisma.books.findMany();
  res.json({ data: books });
});
app.post("/books/add", async (req, res) => {
  const result = await prisma.books.create({
    data: {
      judul: req.body.judul,
      penulis: req.body.penulis,
      penerbit: req.body.penerbit,
      tahun_terbit: req.body.tahun_terbit,
    },
  });
  res.json({ message: `new books added!`, data: result });
});
app.put("/books/:id/update", async (req, res) => {
  const result = await prisma.books.update({
    data: {
      judul: req.body.judul,
      penulis: req.body.penulis,
      penerbit: req.body.penerbit,
      tahun_terbit: req.body.tahun_terbit,
    },
    where: { id: Number(req.params.id) },
  });
  res.json({ message: `books updated!`, data: result });
});
app.delete("/books/:id/delete", async (req, res) => {
  const result = await prisma.books.delete({
    where: { id: Number(req.params.id) },
  });
  res.json({ message: `books deleted!`, deleted: result });
});

app.listen(3000, () => {
  console.log(`App listening on port: http://localhost:3000`);
});
