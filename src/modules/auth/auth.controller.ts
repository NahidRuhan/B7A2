import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  try {

    if (body.role && !['contributor', 'maintainer'].includes(body.role)) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Bad Request",
        errors: "Invalid role. Allowed roles are 'contributor' and 'maintainer'.",
      });
    }

    const result = await authService.createUserIntoDB(body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body
  try {
    const result = await authService.loginUserIntoDB(body)
        sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export const authController = {
  createUser, loginUser
};
