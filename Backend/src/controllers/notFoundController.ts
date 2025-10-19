import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../utils/response";

export const notFoundRoute = async (req: Request, res: Response) => {
  return sendResponse(res, {
    success: false,
    statusCode: StatusCodes.NOT_FOUND,
    error: "PAGE NOT FOUND",
  });
};
