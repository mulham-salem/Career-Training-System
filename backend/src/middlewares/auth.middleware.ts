import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "skillway_secret";

interface CustomJwtPayload extends DefaultJwtPayload {
  userId: number;
  role: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decode = jwt.verify(token, SECRET) as unknown as CustomJwtPayload;

    // حفظ بيانات المستخدم داخل الطلب للوصول إليها لاحقًا
    (req as any).user = { id: decode.userId, role: decode.role };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Access denied: insufficient role" });
      return;
    }

    next();
  };
};
