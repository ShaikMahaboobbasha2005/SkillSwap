const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mime)) {
    cb(null, true);
  } else {
    const error = new Error("Invalid file format. Allowed formats: jpg, jpeg, png, webp");
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// Wrapper middleware to catch Multer errors cleanly and return 400 status codes
const handleUploadMiddleware = (singleFieldName) => {
  const uploadSingle = upload.single(singleFieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: "File size exceeds the 5 MB limit.",
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }
        return res.status(err.statusCode || 400).json({
          success: false,
          message: err.message || "Invalid file upload",
        });
      }
      next();
    });
  };
};

module.exports = {
  upload,
  handleUploadMiddleware,
};
