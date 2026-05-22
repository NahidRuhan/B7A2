import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  try {

    if (body.role && !['contributor', 'maintainer'].includes(body.role)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid role. Allowed roles are 'contributor' and 'maintainer'.",
      });
    }

    const result = await authService.createUserIntoDB(body);
    sendResponse(res, {
      statusCode: 201,
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
      statusCode: 200,
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
