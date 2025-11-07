import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/generateToken";
import { sendWelcomeEmail } from "../services/email/sendWelcomeEmail";

const prisma = new PrismaClient();

/**
 * @desc Register a new user
 * @route POST /api/auth/signup
 * @access Private
 * @role (JOB_SEEKER - EMPLOYER)
 * @param req
 * @param res
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // 🔎 Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // 🔒 Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧱 Create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // 🎟️ Generate JWT Token
    const token = generateToken(newUser.id.toString(), newUser.role);

    // Send welcome message to user's email
    await sendWelcomeEmail(newUser.id, newUser.name);

    res.status(201).json({
      message: "User successfully registered",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      token,
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Authenticate user and return JWT token
 * @route POST /api/auth/signIn
 * @access Public
 * @role (JOB_SEEKER - EMPLOYER - ADMIN)
 * @param req
 * @param res
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 🔎 تحقق إذا المستخدم موجود
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // 🔒 تحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // 🎟️ توليد توكن JWT
    const token = generateToken(user.id.toString(), user.role);

    res.status(200).json({
      message: "User successfully logged in",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};