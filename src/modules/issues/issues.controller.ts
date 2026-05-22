import type { Request, Response, NextFunction } from "express";
import { issueService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const userID = req.user?.id as number;
  try {
    // Validate type (must be provided and strictly match one of the allowed values)
    if (!body.type || !["bug", "feature_request"].includes(body.type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type. Must be either 'bug' or 'feature_request'.",
      });
    }

    // Validate status (optional, but if provided, must strictly match one of the allowed values)
    if (
      body.status &&
      !["open", "in_progress", "resolved"].includes(body.status)
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          "Invalid status. Must be 'open', 'in_progress', or 'resolved'.",
      });
    }

    const result = await issueService.createIssueIntoDB(body, userID);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sort, type, status } = req.query;

    const result = await issueService.getAllIssueFromDB({
      sort: sort as string,
      type: type as string,
      status: status as string,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(id as string);
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await issueService.deleteIssueFromDB(id as string);
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  deleteIssue,
};
