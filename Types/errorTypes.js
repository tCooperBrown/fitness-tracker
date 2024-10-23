class AppError extends Error {
  constructor(message, statusCode = 500, operational = true) {
    super(message);
    this.statusCode = statusCode;
    this.operational = operational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

// Used in errorLogger() & errorHandler() to ensure unexpected errors are still
// standardised & have operational flag set to false
const normaliseError = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  return new AppError(
    ["development", "test"].includes(process.env.NODE_ENV)
      ? err.message
      : "Something went wrong",
    500,
    false,
  );
};

export { AppError, normaliseError };
