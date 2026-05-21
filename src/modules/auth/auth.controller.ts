import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    // Validate role if it is provided
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
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req:Request,res:Response) => {
  const body = req.body
  try {
    const result = await authService.loginUserIntoDB(body)
        sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
}

export const authController = {
  createUser, loginUser
};
