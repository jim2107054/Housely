import { error } from '../utils/response.js';

export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return error(res, `A record with this ${field} already exists`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return error(res, 'Record not found', 404);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return error(res, 'Validation failed', 400, err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'File too large (max 10MB)', 400);
  }

  return error(res, err.message || 'Internal Server Error', err.statusCode || 500);
};
