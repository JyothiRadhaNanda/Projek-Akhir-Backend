import express from "express";
import cors from "cors";
import bookController from "./controller/book.controller.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis
app.use("/uploads", express.static("uploads"));

// Gunakan router dari bookController
app.use("/books", bookController);

// Jalankan server
app.listen(3030, () => {
  console.log("App listening on port: http://localhost:3030");
});
