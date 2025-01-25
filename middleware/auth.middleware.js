import jwt from "jsonwebtoken";

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
