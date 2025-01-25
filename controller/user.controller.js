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
