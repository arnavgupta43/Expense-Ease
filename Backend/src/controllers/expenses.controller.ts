import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/response";
import prisma from "../config/db";
import { ExpenseCategory } from "@prisma/client";

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
    const { id } = req.params;
    const expenseid = parseInt(id);
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
        statusCode: StatusCodes.NOT_FOUND,
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
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { expenseid, amount, title, category, date, note } = req.body;
    const userId = req.user?.id;
    if (typeof userId !== "number" || typeof expenseid !== "number") {
      console.log(userId);
      console.log(expenseid);
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
        statusCode: StatusCodes.NOT_FOUND,
        error: "Expense not Found",
      });
    }
    const updateData: Record<string, any> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (note !== undefined) updateData.note = note;
    const dataLength = Object.keys(updateData).length;
    if (dataLength <= 1) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        error: "Not enough data to update",
      });
    }
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
      data: updatedExpense,
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
    const limit = parseInt(req.query.limit as string) || 10;
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
        date: "desc", //sort by most recent
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
export const expenseBycategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid UserId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const categoryExpense = await prisma.personalExpense.findMany({
      where: {
        userId,
        category: {
          equals: req.query.category as ExpenseCategory,
        },
      },
      skip,
      take: limit,
      orderBy: {
        date: "desc",
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: categoryExpense,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};

//get the totalExpense for  the particular month
export const monthExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { month } = req.query;
    if (typeof userId !== "number") {
      return sendResponse(res, {
        success: false,
        error: "Invalid UserId",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const now = new Date();
    const targetMonth = month
      ? new Date(`${month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfMonth = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    //get expense on the current month
    const currentExpense = await prisma.personalExpense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: currentExpense,
    });
  } catch (error: any) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error?.message,
    });
  }
};
