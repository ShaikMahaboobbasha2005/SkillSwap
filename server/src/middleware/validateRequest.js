const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const errorMessage = issue ? issue.message : "Validation failed";
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
};

module.exports = validateRequest;
