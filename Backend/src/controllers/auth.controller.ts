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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } }); //fields should be a object
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not Found" });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Incorrect Password" });
    }
    const token = signToken(user.id);
    return res.status(StatusCodes.OK).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
