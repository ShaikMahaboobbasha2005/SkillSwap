const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(
    name &&
    key &&
    secret &&
    name !== "your_cloudinary_cloud_name" &&
    key !== "your_cloudinary_api_key" &&
    secret !== "your_cloudinary_api_secret"
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload buffer directly to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {String} mimeType
 * @returns {Promise<String>} Cloudinary secure URL
 */
const uploadToCloudinary = (fileBuffer, mimeType = "image/jpeg") => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      const err = new Error(
        "Cloudinary is not configured on the server. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
      );
      err.statusCode = 500;
      return reject(err);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "skillswap/profiles",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          const uploadErr = new Error("Failed to upload image to Cloudinary: " + error.message);
          uploadErr.statusCode = 500;
          return reject(uploadErr);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
};
