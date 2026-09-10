export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function successResponse<T>(data?: T, message?: string): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return response;
}

export function errorResponse(message: string): ApiResponse {
  return {
    success: false,
    message,
  };
}

