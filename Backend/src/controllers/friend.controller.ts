import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/db";
import { sendResponse } from "../utils/response";
import Logger from "../utils/logger";
export const sentRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;
    //adding a check for senderId to be a number for typescript checking
    if (typeof senderId !== "number") {
      Logger.error(`userId is invalid `);
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
      Logger.error(`userId is invalid `);
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

// function to fetch all the current friend request
// added pagination for more pending request
export const allPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) ?? 10;
    const skip = (page - 1) * limit;

    //adding a check for userId to be a number for typescript checking
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //check the databse for the requests
    const pendingRequests = await prisma.friend.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      skip,
      take: limit,
    });
    return sendResponse(res, {
      success: true,
      data: {
        pendingRequests,
        pagination: { page, limit },
      },
      statusCode: StatusCodes.OK,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Failed to load request",
    });
  }
};

//contoller to reject the friend request the user will be blocked
export const blockFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const senderId = req.body.senderId;
    const request = await prisma.friend.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: userId,
          senderId: senderId,
        },
      },
    });
    if (!request) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        error: "Request Not Found",
      });
    }
    const updateRequest = await prisma.friend.update({
      where: {
        senderId_receiverId: {
          receiverId: userId,
          senderId: senderId,
        },
      },
      data: {
        status: "BLOCKED",
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User Blocked",
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Failed to load request",
    });
  }
};

// reject the friend request but not block the user
export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const senderId = req.body.senderId;
    const request = await prisma.friend.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: userId,
          senderId: senderId,
        },
      },
    });
    if (!request) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        error: "Request Not Found",
      });
    }
    // delete the request from the table
    const deleteRequest = await prisma.friend.delete({
      where: {
        senderId_receiverId: {
          senderId: senderId,
          receiverId: userId,
        },
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Request Rejected",
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Failed to load request",
    });
  }
};

// contoller to see all the friends of a user
export const allFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //extract the rows of the friends
    const relations = await prisma.friend.findMany({
      where: {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
    });
    // reduce only the other ids other than user
    const friendIds = relations.map((relation) => {
      return relation.senderId == userId
        ? relation.receiverId
        : relation.senderId;
    });
    if (friendIds.length === 0) {
      return sendResponse(res, {
        success: true,
        data: [],
        statusCode: StatusCodes.OK,
      });
    }
    //now find the user with the ids reduced
    const friends = await prisma.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
      },
      select: {
        username: true,
        name: true,
        id: true,
      },
    });
    return sendResponse(res, {
      success: true,
      data: friends,
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
// controller for the count of pending friend request
export const countPendingRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const requests = await prisma.friend.aggregate({
      _count: {
        id: true,
      },
      where: {
        senderId: userId,
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        requests: requests._count.id,
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
