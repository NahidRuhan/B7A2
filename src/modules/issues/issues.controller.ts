import type { Request, Response, NextFunction } from "express";
import { issueService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";

const createIssue = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const userID = req.user?.id as number;
  try {
    if (!body.type || !["bug", "feature_request"].includes(body.type)) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Bad Request",
        errors: "Invalid type. Must be either 'bug' or 'feature_request'.",
      });
    }

    if (
      body.status &&
      !["open", "in_progress", "resolved"].includes(body.status)
    ) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Bad Request",
        errors: "Invalid status. Must be 'open', 'in_progress', or 'resolved'.",
      });
    }

    const result = await issueService.createIssueIntoDB(body, userID);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
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
    const { sort = "newest", type, status } = req.query;

    const result = await issueService.getAllIssueFromDB({
      sort: sort as string,
      type: type as string,
      status: status as string,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issues retrieved successfully",
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
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Not Found",
        errors: "Requested resource does not exist",
      });
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateIssue = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const { id } = req.params;
  const role = req.user?.role;
  const userID = req.user?.id;
  try {
    if (body.type && !["bug", "feature_request"].includes(body.type)) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Bad Request",
        errors: "Invalid type. Must be either 'bug' or 'feature_request'.",
      });
    }

    if (
      body.status &&
      !["open", "in_progress", "resolved"].includes(body.status)
    ) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Bad Request",
        errors: "Invalid status. Must be 'open', 'in_progress', or 'resolved'.",
      });
    }

    const result = await issueService.updateIssueIntoDB(
      body,
      id as string,
      role,
      userID as number,
    );

    if (result === "not_found") {
      return sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Not Found",
        errors: "Requested resource does not exist",
      });
    }

    if (result === "forbidden") {
      return sendResponse(res, {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "Forbidden",
        errors:
          "Valid token but insufficient role/permissions to update this issue",
      });
    }

    if (result === "forbidden_status") {
      return sendResponse(res, {
        statusCode: StatusCodes.CONFLICT,
        success: false,
        message: "Conflict",
        errors: "Contributors can only update open issues",
      });
    }

    if (result === "forbidden_status_update") {
      return sendResponse(res, {
        statusCode: StatusCodes.FORBIDDEN,
        success: false,
        message: "Forbidden",
        errors:
          "Valid token but insufficient role/permissions to update issue status",
      });
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue updated successfully",
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
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Not Found",
        errors: "Requested resource does not exist",
      });
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
