import express from "express";
import cors from "cors";
import router from "./router/index.js"; // Mengimpor router utama
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Melayani file statis
app.use("/uploads", express.static("uploads"));

// Gunakan router dari router/index.js (router utama)
app.use(router); // Semua route dari router akan dimulai dengan '/api'

// Jalankan server
app.listen(3030, () => {
  console.log("App listening on port: http://localhost:3030");
});
