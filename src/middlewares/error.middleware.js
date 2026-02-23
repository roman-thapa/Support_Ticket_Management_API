const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  // Default values for unknown errors
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Check if error is operational (AppError)
  const isOperational = err.isOperational;

  // Development Mode
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  // Production Mode
  if (isOperational) {
    // Known / expected error
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Unknown / programming error
  console.error("🔥 UNEXPECTED ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

module.exports = errorHandler;