import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Secret Key untuk JWT
const JWT_SECRET = "your_secret_key";

// Controller untuk registrasi
export const registerController = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    console.log("Mencari user dengan email:", email);
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Registration successful!", token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error during registration", error });
  }
};

export const registerAdminController = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    console.log("Mencari user dengan email:", email);
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: "ADMIN",
      },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Registration successful!", token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error during registration", error });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      include: { books: true },
    });

    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error });
  }
};

export const deleteUserController = async (req, res) => {
  const { id } = req.params; // Mengambil `id` dari parameter URL

  try {
    console.log("Mencoba menghapus user dengan ID:", id);

    // Cek apakah user ada di database
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Hapus user
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).json({ message: "Error during user deletion", error });
  }
};
