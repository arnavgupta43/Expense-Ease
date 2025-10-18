import { Request, Response } from "express";
import prisma from "../config/db";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/response";
export const register = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Users already exits",
      });
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
    const token = signToken(user.id, user.username, user.email);
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      data: {
        token,
        user: {
          id: user.name,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      error: error?.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } }); //fields should be a object
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Incorrect Password",
      });
    }
    const token = signToken(user.id, user.username, user.email);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error?.message,
    });
  }
};