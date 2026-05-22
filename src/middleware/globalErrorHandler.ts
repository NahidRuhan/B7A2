import type { NextFunction, Request, Response } from "express";

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

const globalErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err,
  });
}

export default globalErrorHandler