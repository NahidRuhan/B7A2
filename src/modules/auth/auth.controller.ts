import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";
import type { AuthUser, IUser } from "./auth.interface";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const body: IUser = req.body;
  try {

    // stops from posting invalid roles into DB
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
  const body: AuthUser = req.body;
  try {
    const result = await authService.loginUserIntoDB(body)
    
    if (result === "invalid_credentials") {
      return sendResponse(res, {
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Unauthorized",
        errors: "Invalid email or password",
      });
    }

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
