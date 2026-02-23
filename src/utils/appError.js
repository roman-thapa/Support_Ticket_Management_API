class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";

    this.isOperational = true; // distinguish operational vs programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;