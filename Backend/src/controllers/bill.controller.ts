import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/db";
import { sendResponse } from "../utils/response";
import Logger from "../utils/logger";
//TO create Bill -> check if the ids are valid -> There should not be any duplicate values-> They should be friends and not blocked
// -> create the actual bill

export const createBill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
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
      Logger.error("Duplicate Participants ");
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        error: "Duplicate Participants",
      });
    }
    //user cannot participat in the bill split
    if (participantsIds.includes(userId)) {
      Logger.warn(`User ${userId} cannot participate`);
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
      Logger.error("Invalid Ids");
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
      Logger.warn(`Some participants are not friends`);
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
    Logger.info(`Bill with id ${bill.id} created`);
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

//controller to get bills created by the user
export const getBillCreate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const allBills = await prisma.bill.findMany({
      where: {
        createdById: userId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    if (allBills.length === 0) {
      Logger.warn(`No Bills created`);
      return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "No bills created",
      });
    }
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: allBills,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//controller to get bills user->as participants
export const getBills = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const billsParticipated = await prisma.billParticipant.findMany({
      where: {
        userId,
        isSettled: false, //  unsettled bills
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    if (billsParticipated.length === 0) {
      return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "No bills found",
      });
    }
    Logger.info(`Bills fetched`);
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: billsParticipated,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//controller to settle the bill
export const settleBill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const billId = parseInt(id);
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //check if the bill id exits
    const findBill = await prisma.billParticipant.findUnique({
      where: {
        userId_billId: {
          userId,
          billId,
        },
      },
    });
    if (!findBill) {
      Logger.warn(`BillId -${billId} not exists`);
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        error: "Bill not found",
      });
    }
    //if bill exits settle the bill
    const settleBill = await prisma.billParticipant.update({
      where: {
        userId_billId: {
          userId,
          billId,
        },
      },
      data: {
        isSettled: true,
      },
    });
    Logger.info(`Billid- ${billId} settled`);
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: settleBill,
      message: "Bill Settled",
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//controller to delete the bill
export const deleteBill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const billId = parseInt(id);
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //check if the bill exists and the onwership
    const findBill = await prisma.bill.findUnique({
      where: {
        createdById: userId,
        id: billId,
      },
    });
    if (!findBill) {
      Logger.error(`BIllId- ${billId} does not exists`);
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        error: "Bill not found",
      });
    }
    //now delete the bill
    const deleteBill = await prisma.bill.delete({
      where: {
        createdById: userId,
        id: billId,
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Bill deleted",
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//controller for the total unsettled amount of the bills
export const totalUnsettledAmount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //fisrt find all the bills created by the user and get all the ids
    const allBillsCreated = await prisma.bill.findMany({
      where: {
        createdById: userId,
      },
      select: {
        id: true,
      },
    });
    //once we get all the ids if no bills return response
    if (allBillsCreated.length === 0) {
      Logger.warn(`No bills created`);
      return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "No bills Found",
      });
    }
    const billIds = allBillsCreated.map((p) => p.id);
    const unsettledAmount = await prisma.billParticipant.aggregate({
      _sum: {
        amountOwed: true,
      },
      where: {
        billId: {
          in: billIds,
        },
        isSettled: false,
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        totalUnsettledAmount: unsettledAmount._sum.amountOwed ?? 0,
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

//controller to view the details of a single bill
export const viewBill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const billId = parseInt(id);
    if (typeof userId !== "number") {
      Logger.error(`userId is invalid `);
      return sendResponse(res, {
        success: false,
        error: "Invalid senderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //first find iof the bill exits and check ownership then only go forward
    const bill = await prisma.bill.findFirst({
      where: {
        id: billId,
        createdById: userId,
      },
    });
    if (!bill) {
      Logger.error(`BIll with ${billId} does not exist`);
      return sendResponse(res, {
        success: false,
        error: "Bill Invalid",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    // now find the details of the bils with the participants
    const billDetails = await prisma.billParticipant.findMany({
      where: {
        billId,
      },
    });
    Logger.info(`Bill details fetched- ${billId}`);
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        bill,
        details: billDetails,
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
