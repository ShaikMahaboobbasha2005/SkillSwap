const errorHandler = (err, req, res, next) => {
  console.error("Error handler caught:", err);

  const statusCode = err.statusCode || (res.statusCode >= 400 && res.statusCode < 600 ? res.statusCode : 500);
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

module.exports = errorHandler;
