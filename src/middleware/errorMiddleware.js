import AppError from '../utils/appError.js';

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  let err = error;

  if (!(err instanceof AppError)) {
    if (err.name === 'CastError') {
      err = new AppError(`Invalid resource id: ${err.value}`, 400);
    } else if (err.name === 'ValidationError') {
      err = new AppError(
        'Validation failed',
        400,
        Object.values(err.errors).map((item) => item.message)
      );
    } else if (err.code === 11000) {
      err = new AppError('Duplicate resource value', 409, err.keyValue);
    } else {
      err = new AppError(err.message || 'Internal server error', 500);
    }
  }

  const response = {
    success: false,
    message: err.message,
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(response);
};
