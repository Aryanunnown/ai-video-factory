import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { ApiError } from "../types/api";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (err as ApiError).statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";

  logger.error(message, { path: req.path, stack: err.stack });

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
