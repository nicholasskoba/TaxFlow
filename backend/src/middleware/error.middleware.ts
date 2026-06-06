import { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {})
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error"
  });
};
