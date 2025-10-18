import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/db";
import { sendResponse } from "../utils/response";
export const sentRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;
    //adding a check for senderId to be a number for typescript checking
    if (typeof senderId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const receiverId = parseInt(req.params.receiverId);
    if (!receiverId || isNaN(receiverId)) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        error: "Receiver ID must be a valid number",
      });
    }
    // we cannot send the request to ourselves
    if (receiverId == senderId) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        error: "Cannot send request to yourself",
      });
    }
    const friend = await prisma.user.findFirst({ where: { id: receiverId } });
    //lets find the user are already friends

    if (!friend) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        error: "Friend Not Found",
      });
    }
    //check if the users are existing friends
    const existingFriends = await prisma.friend.findFirst({
      where: { senderId, receiverId },
    });
    if (existingFriends) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.CONFLICT,
        message: "Already Friend",
      });
    }
    //Finally create the friend request
    const request = await prisma.friend.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Friend Request Sent",
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

// function to accept friend request
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    //adding a check for userId to be a number for typescript checking
    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const requesterId = parseInt(req.params.requesterId);
    if (!requesterId || isNaN(requesterId)) {
      return sendResponse(res, {
        success: false,
        error: "Invalid request",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    // we cannot send the request to ourselves
    if (requesterId == userId) {
      return sendResponse(res, {
        success: false,
        error: "Invalid request",
        statusCode: StatusCodes.BAD_REQUEST,
      });
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
      return sendResponse(res, {
        success: false,
        error: "Request does not exists",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    if (request.status === "ACCEPTED") {
      return sendResponse(res, {
        success: false,
        message: "Request already accepted",
        statusCode: StatusCodes.BAD_REQUEST,
      });
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
    return sendResponse(res, {
      success: true,
      message: "Friend Added",
      statusCode: StatusCodes.OK,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      error: error?.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
