import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class AuthController {
  // Fungsi untuk login
  static async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Cek apakah password cocok
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || "your-secret-key", // Ganti dengan secret key yang lebih aman
        { expiresIn: "1h" } // Token expired dalam 1 jam
      );
      console.log("Generated Token:", token);
      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "Failed to login", error });
    }
  }
}

export default AuthController;
