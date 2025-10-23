import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/db";
import { sendResponse } from "../utils/response";
import { error } from "console";

//TO craete Bill -> check if the ids are valid -> There should not be any duplicate values-> They should be friends and not blocked
// -> create the actual bill

export const createBill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const { title, totalAmount, participants } = req.body;
    const participantList = Array.isArray(participants) ? participants : [];
    if (
      !title ||
      typeof totalAmount !== "number" ||
      totalAmount <= 0 ||
      participantList.length === 0
    ) {
      return sendResponse(res, {
        success: false,
        error: "Title and amount are required.",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    if (participantList.length > 0) {
      const totalSplit = participantList.reduce(
        (sum: number, p: any) => sum + p.amountOwed,
        0
      );
      if (totalSplit > totalAmount) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          error: "Sum of split amounts exceeds total bill amount",
        });
      }
    }
    const participantsIds = participantList.map((p: any) => p.userId);
    const uniqueIds = new Set(participantsIds);
    if (uniqueIds.size !== participantsIds.length) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        error: "Duplicate Participants",
      });
    }
    //user cannot participat in the bill split
    if (participantsIds.includes(userId)) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        error: "User is not allowed",
      });
    }
    const existingUsers = await prisma.user.findMany({
      where: {
        id: {
          in: participantsIds,
        },
      },
    });
    if (existingUsers.length !== participantsIds.length) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        error: "Invalid participants IDs",
      });
    }

    //valid if the participants are the friends of the user
    const validFriends = await prisma.friend.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            status: "ACCEPTED",
            receiverId: { in: participantsIds },
          },
          {
            receiverId: userId,
            status: "ACCEPTED",
            senderId: { in: participantsIds },
          },
        ],
      },
    });
    if (validFriends.length !== participantsIds.length) {
      return sendResponse(res, {
        success: false,
        error: "Some participants are not your friends.",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const bill = await prisma.bill.create({
      data: {
        title,
        totalAmount,
        createdById: userId,
        participants: participantList.length
          ? {
              create: participantList.map((p: any) => ({
                userId: p.userId,
                amountOwed: p.amountOwed,
              })),
            }
          : undefined,
      },
      include: {
        participants: true,
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      data: bill,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};
