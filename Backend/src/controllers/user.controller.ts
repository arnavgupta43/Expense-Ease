import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { StatusCodes } from "http-status-codes";

export const searchUser = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.username as string;
    const currentUserId = req.user?.id;
    if (!searchTerm || searchTerm.length < 3) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Search is too short" });
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
      },
      select: {
        receiverId: true,
      },
    });
    // we will do the same thing  from the opposite side
    const received = await prisma.friend.findMany({
      where: {
        receiverId: currentUserId,
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
    return res.status(StatusCodes.OK).json({ users: filteredUser });
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error?.message });
  }
};
