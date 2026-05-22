import e from "cors";
import type { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    errors: error,
  });
};
