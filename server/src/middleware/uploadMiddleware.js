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

const portfolioFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isImage = ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mime);
  const isVideo = (ext === ".mp4" || ext === ".webm") && (mime === "video/mp4" || mime === "video/webm");

  if (isImage || isVideo) {
    file.mediaType = isVideo ? "video" : "image";
    cb(null, true);
  } else {
    const error = new Error("Invalid file format. Allowed formats: jpg, jpeg, png, webp for images; mp4, webm for videos");
    error.statusCode = 400;
    cb(error, false);
  }
};

const portfolioUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB maximum for videos
  },
  fileFilter: portfolioFileFilter,
});

// Specialized middleware for portfolio uploads (images ≤ 10MB, videos ≤ 50MB)
const handlePortfolioUploadMiddleware = (req, res, next) => {
  const uploadSingle = portfolioUpload.single("media");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds the allowed limit (10 MB for images, 50 MB for videos).",
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

    // Specific size checks for images vs videos
    if (req.file) {
      const isImage = req.file.mediaType === "image" || req.file.mimetype.startsWith("image/");
      const isVideo = req.file.mediaType === "video" || req.file.mimetype.startsWith("video/");

      if (isImage && req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Image size cannot exceed 10 MB.",
        });
      }

      if (isVideo && req.file.size > 50 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Video size cannot exceed 50 MB.",
        });
      }
    }

    next();
  });
};

module.exports = {
  upload,
  handleUploadMiddleware,
  handlePortfolioUploadMiddleware,
};

