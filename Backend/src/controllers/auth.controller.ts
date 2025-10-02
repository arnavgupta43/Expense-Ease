import { Request, Response } from "express";
import prisma from "../config/db";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { StatusCodes } from "http-status-codes";
export const register = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User already exists" });
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashed,
      },
    });
    const token = signToken(user.id);
    res
      .status(StatusCodes.CREATED)
      .json({ token, id: user.name, name: user.name, email: user.email });
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
