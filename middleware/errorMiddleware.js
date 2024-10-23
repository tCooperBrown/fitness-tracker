import { AppError, normaliseError } from "../Types/errorTypes.js";

const errorLogger = (err, req, res, next) => {
  const normalisedError = normaliseError(err);

  console.error({
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    normalisedErrorMessage: normalisedError.message,
    originalError: err.message,
    stackTrace: err.stack,
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
    operational: normalisedError.operational,
  });

  next(normalisedError);
};

const errorHandler = (err, req, res, next) => {
  // err should already be normalised by errorLogger(). Keeping the ternary as precaution.
  const error = err instanceof AppError ? err : normaliseError(err);

  if (["development", "test"].includes(process.env.NODE_ENV)) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      operational: error.operational,
      stack: error.stack,
      error: error,
    });
  } else {
    // Don't send sensitive information in production
    res.status(error.statusCode).json({
      status: error.status,
      message: error.operational ? error.message : "Something went wrong",
    });
  }
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { errorLogger, errorHandler, asyncHandler };
