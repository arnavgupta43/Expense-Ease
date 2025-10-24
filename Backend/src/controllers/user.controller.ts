import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/response";
export const searchUser = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.username as string;
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (!searchTerm || searchTerm.length < 3) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Search is too short",
      });
    }
    //search for the users with the given string
    const matchedUsers = await prisma.user.findMany({
      where: {
        username: {
          contains: searchTerm,
          mode: "insensitive",
        },
        NOT: {
          id: currentUserId,
        },
      },
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
      },
    });
    //search the users whom the user has alreadt sent request and get all the id of the reciever
    const send = await prisma.friend.findMany({
      where: {
        senderId: currentUserId,
        status: {
          not: "BLOCKED",
        },
      },
      select: {
        receiverId: true,
      },
    });
    // we will do the same thing  from the opposite side
    const received = await prisma.friend.findMany({
      where: {
        receiverId: currentUserId,
        status: {
          not: "BLOCKED",
        },
      },
      select: {
        senderId: true,
      },
    });
    //now exclude the ids like total-sent-recieve and sent the rest as response
    const excludeId = new Set<Number>([
      ...send.map((f) => f.receiverId),
      ...received.map((f) => f.senderId),
    ]);
    const filteredUser = matchedUsers.filter((user) => !excludeId.has(user.id));
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        users: filteredUser,
      },
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};
