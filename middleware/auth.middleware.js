import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log("Extracted Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    console.log("Verified User:", user);
    req.user = user;
    next();
  });
};

export function isAdmin(req, res, next) {
  const role = req.user.role;

  if (role === "ADMIN") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Forbidden Access. You Do Not Have Access!" });
  }
}

export function isUser(req, res, next) {
  const role = req.user.role;

  if (role === "USER" || role === "ADMIN") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Forbidden Access. You Do Not Have Access!" });
  }
}

export async function checkBookOwnership(req, res, next) {
  const user = req.user; // req.user berisi { userId, username, role }
  const bookId = Number(req.params.id);

  console.log("User Data:", user.userId); // Gunakan user.userId
  console.log("Book ID:", bookId);

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { userId: true },
    });
    console.log("Logged User ID:", user.userId);
    console.log("Book Data:", book);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (user.role !== "ADMIN" && book.userId !== user.userId) {
      // Gunakan user.userId
      console.log("Condition Failed:");
      console.log("User Role:", user.role);
      console.log("Book Owner ID:", book.userId);
      console.log("Logged User ID:", user.userId);
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this book" });
    }

    req.book = book;
    next();
  } catch (error) {
    console.error("Error checking book ownership:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
