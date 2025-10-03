import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { StatusCodes } from "http-status-codes";
import { Jwt } from "jsonwebtoken";

//Extending the request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "failed",
      msg: "Authentication Error",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    if (typeof payload === "object" && payload != null) {
      req.user = {
        username: payload.username,
        id: payload.userId,
        email: payload.email,
      };
    }
    return next();
  } catch (error) {
    console.error("JWT error:", error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "failed", msg: "Invalid or expired token" });
  }
};
