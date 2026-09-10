import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/apiResponse.js';
import { config } from '../config/index.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
  } else if (err.name === 'PrismaClientInitializationError') {
    statusCode = 503;
    message = 'Database connection unavailable';
  } else if (config.nodeEnv === 'development' && err.message) {
    message = err.message;
  }

  // Consistent response format without exposing stack traces or DB credentials
  res.status(statusCode).json({
    success: false,
    message,
  });
};

