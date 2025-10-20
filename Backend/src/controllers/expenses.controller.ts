import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/response";
import prisma from "../config/db";

export const createExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid SenderId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const { title, amount, category, note, date } = req.body;
    if (amount <= 0) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        error: "Amount cannot be zero",
      });
    }
    const expense = await prisma.personalExpense.create({
      data: {
        title,
        amount,
        category,
        note,
        date: date ? new Date(date) : new Date(),
        userId,
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      data: expense,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};
// delete the expenses find and then delete
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { expenseid } = req.body;
    const userId = req.user?.id;
    if (typeof userId !== "number" || typeof expenseid !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid Request",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //check ownership and find expense
    const expense = await prisma.personalExpense.findFirst({
      where: {
        id: expenseid,
        userId,
      },
    });
    if (!expense) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_IMPLEMENTED,
        error: "Expense not Found",
      });
    }
    //if the expense is found then delete it
    const deleteExpense = await prisma.personalExpense.delete({
      where: {
        id: expenseid,
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: { message: "Expense deleted successfully" },
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//controller for updating a expense
export const upadteExpense = async (req: Request, res: Response) => {
  try {
    const { expenseid, amount, title, category, date, note } = req.body;
    const userId = req.user?.id;
    if (typeof userId !== "number" || typeof expenseid !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid Request",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    //check ownership and find expense
    const expense = await prisma.personalExpense.findFirst({
      where: {
        id: expenseid,
        userId,
      },
    });
    if (!expense) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_IMPLEMENTED,
        error: "Expense not Found",
      });
    }
    const updateData: Record<string, any> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (amount !== undefined) updateData.amount = amount;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (note !== undefined) updateData.note = note;
    //create a dynamic object for the upadte query
    const updatedExpense = await prisma.personalExpense.update({
      where: {
        id: expenseid,
      },
      data: updateData,
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: updateData,
      message: "Expense updated",
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//controller to get all the expense with pagination included with the newest first
export const getAllExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) ?? 10;
    const skip = (page - 1) * limit;

    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid UserId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const allExpenses = await prisma.personalExpense.findMany({
      where: {
        userId,
      },
      skip,
      take: limit,
      orderBy: {
        date: "asc",
      },
    });
    if (allExpenses.length == 0) {
      return sendResponse(res, {
        success: true,
        message: "No expenses found",
        statusCode: StatusCodes.OK,
      });
    }
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: {
        allExpenses,
        page,
        limit,
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

//conttoller to get expense by catregory with pagination witht the newest expense first
export const expensBycategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid UserId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};
