export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ path: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
