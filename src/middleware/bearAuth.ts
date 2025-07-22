import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { roleEnum } from "../drizzle/schema";

dotenv.config();

// JWT payload type
type DecodedToken = {
  userId: number;
  email: string;
  role: typeof roleEnum.enumValues[number]; // 'user' | 'admin'
  fullName: string;
  exp: number;
};

// Extend Express Request with user payload
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Token verification helper
export const verifyToken = async (
  token: string,
  secret: string
): Promise<DecodedToken | null> => {
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Auth middleware factory with correct return type
export const authMiddleware = (
  requiredRole: typeof roleEnum.enumValues[number] | "any"
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Authorization header is missing" });
      return;
    }

    const decodedToken = await verifyToken(
      token,
      process.env.JWT_SECRET as string
    );

    if (!decodedToken) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const userType = decodedToken.role;

    if (requiredRole === "any" || userType === requiredRole) {
      req.user = decodedToken;
      next();
    } else {
      res.status(403).json({
        error: "Forbidden: You do not have permission to access this resource",
      });
    }
  };
};

// Role-based middleware exports
export const adminAuth= authMiddleware("admin");
export const userAuth= authMiddleware("user");
export const anyAuthenticatedUser = authMiddleware("any");
