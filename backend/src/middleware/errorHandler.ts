import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    message: err.message,
    statusCode,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    error: true,
    message: err.message,
    ...(isDevelopment && { stack: err.stack }),
    ...(statusCode >= 500 && { details: 'Internal server error' })
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.path} not found`
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
