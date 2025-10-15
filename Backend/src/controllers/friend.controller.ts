import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/db";

export const sentRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;
    //adding a check for senderId to be a number for typescript checking
    if (typeof senderId !== "number") {
      return res.status(400).json({ error: "Invalid senderId" });
    }
    const receiverId = parseInt(req.params.receiverId);
    if (!receiverId || isNaN(receiverId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid request" });
    }
    // we cannot send the request to ourselves
    if (receiverId == senderId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid request" });
    }
    const friend = await prisma.user.findFirst({ where: { id: receiverId } });
    //lets find the user are already friends

    if (!friend) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Friend not Found" });
    }
    //check if the users are existing friends
    const existingFriends = await prisma.friend.findFirst({
      where: { senderId, receiverId },
    });
    if (existingFriends) {
      return res.status(StatusCodes.CONFLICT).json({ msg: "Already Friend" });
    }
    //Finally create the friend request
    const request = await prisma.friend.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Friend Request Sent", request });
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error?.message });
  }
};

// function to accept friend request
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    //adding a check for userId to be a number for typescript checking
    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Invalid senderId" });
    }
    const requesterId = parseInt(req.params.requesterId);
    if (!requesterId || isNaN(requesterId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid request" });
    }
    // we cannot send the request to ourselves
    if (requesterId == userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid request" });
    }
    //search if the friendrequest exits in the database
    const request = await prisma.friend.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: userId,
          senderId: requesterId,
        },
      },
    });
    if (!request) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Request does not exists" });
    }
    if (request.status === "ACCEPTED") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Request already accepted" });
    }

    await prisma.friend.update({
      where: {
        senderId_receiverId: {
          receiverId: userId,
          senderId: requesterId,
        },
      },
      data: {
        status: "ACCEPTED",
      },
    });
    return res.status(StatusCodes.OK).json({ msg: "Friend Added" });
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error?.message });
  }
};
