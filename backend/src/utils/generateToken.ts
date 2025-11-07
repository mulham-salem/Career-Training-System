import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET = process.env.JWT_SECRET || "skillway_secret";

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: "7d" });
};
