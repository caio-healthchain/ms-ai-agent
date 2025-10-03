import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ApiResponse } from '@/types';
import { errorMessage, asError } from '../utils/error-utils';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  const response: ApiResponse = {
    success: false,
    message,
    // CORREÇÃO: Converter Date para string usando .toISOString()
    timestamp: new Date().toISOString(),
    ...(code && { 
      error: { 
        code,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } 
    }),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(asError(error));
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (errors: any[]): AppError => {
  const message = errors.map(error => error.msg || error.message).join(', ');
  return new AppError(`Validation failed: ${message}`, 400, 'VALIDATION_ERROR');
};

// Database error handler
export const handleDatabaseError = (error: any): AppError => {
  if (error.code === 'P2002') {
    // Prisma unique constraint violation
    return new AppError('Duplicate entry found', 409, 'DUPLICATE_ENTRY');
  }
  
  if (error.code === 'P2025') {
    // Prisma record not found
    return new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
  }

  if (error.code === 11000) {
    // MongoDB duplicate key error
    return new AppError('Duplicate entry found', 409, 'DUPLICATE_ENTRY');
  }

  return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};