const errorHandler = (err, req, res, next) => {
  console.error("Error handler caught:", err);

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || "Internal server error";

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    success: false,
    message: message,
  });
};

module.exports = errorHandler;
