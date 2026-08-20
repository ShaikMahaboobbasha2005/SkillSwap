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
 * @returns {Promise<{url: String, publicId: String}>} Cloudinary secure URL and public_id
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
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload portfolio media (image or video) directly to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {String} mimeType
 * @param {"image"|"video"} mediaType
 * @returns {Promise<{url: String, publicId: String, duration: Number|null, thumbnailUrl: String}>}
 */
const uploadPortfolioToCloudinary = (fileBuffer, mimeType, mediaType = "image") => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      const err = new Error(
        "Cloudinary is not configured on the server. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
      );
      err.statusCode = 500;
      return reject(err);
    }

    const isVideo = mediaType === "video" || mimeType.startsWith("video/");
    const folder = isVideo ? "skillswap/portfolio/videos" : "skillswap/portfolio/images";
    const resourceType = isVideo ? "video" : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Portfolio Upload Error:", error);
          const uploadErr = new Error("Failed to upload portfolio media to Cloudinary: " + error.message);
          uploadErr.statusCode = 500;
          return reject(uploadErr);
        }

        let thumbnailUrl = "";
        if (isVideo) {
          try {
            thumbnailUrl = cloudinary.url(result.public_id, {
              resource_type: "video",
              format: "jpg",
              transformation: [{ width: 600, crop: "limit" }],
            });
          } catch (e) {
            thumbnailUrl = result.secure_url.replace(/\.[^/.]+$/, ".jpg");
          }
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration ? Math.round(result.duration * 100) / 100 : null,
          thumbnailUrl,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Safely delete an asset from Cloudinary using its public_id.
 * Non-blocking, returns success status object.
 *
 * @param {String} publicId
 * @param {Object} options
 * @returns {Promise<{success: boolean, result?: any, error?: any}>}
 */
const deleteFromCloudinary = (publicId, options = {}) => {
  return new Promise((resolve) => {
    if (!publicId || typeof publicId !== "string" || !isCloudinaryConfigured()) {
      return resolve({ success: false, message: "Cloudinary not configured or invalid publicId" });
    }

    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image", invalidate: true, ...options },
      (error, result) => {
        if (error) {
          console.error(`[Cloudinary Cleanup Error] Failed to destroy publicId '${publicId}':`, error.message);
          return resolve({ success: false, error });
        }
        if (result?.result !== "ok") {
          console.warn(`[Cloudinary Cleanup Warning] Destroy '${publicId}' returned result:`, result?.result);
        } else {
          console.log(`[Cloudinary Cleanup Success] Destroyed asset '${publicId}'`);
        }
        resolve({ success: true, result });
      }
    );
  });
};

/**
 * Safely extracts public_id from a Cloudinary URL for legacy records.
 * Returns null if the URL is non-Cloudinary, shared default, or ambiguous.
 *
 * @param {String} url
 * @returns {String|null}
 */
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const lowerUrl = url.toLowerCase();

  // Never attempt deletion on static, default, or placeholder assets
  if (
    lowerUrl.includes("default") ||
    lowerUrl.includes("placeholder") ||
    lowerUrl.includes("ui-avatars")
  ) {
    return null;
  }

  // Must unambiguously belong to Cloudinary and the skillswap/profiles/ folder
  if (!lowerUrl.includes("cloudinary.com") || !lowerUrl.includes("skillswap/profiles/")) {
    return null;
  }

  try {
    const profileIdx = url.indexOf("skillswap/profiles/");
    if (profileIdx === -1) return null;

    const pathAfterFolder = url.substring(profileIdx);
    const cleanPath = pathAfterFolder.split("?")[0].split("#")[0];
    const lastDotIdx = cleanPath.lastIndexOf(".");
    if (lastDotIdx === -1) return null;

    const publicId = cleanPath.substring(0, lastDotIdx);
    return publicId || null;
  } catch (err) {
    return null;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  uploadPortfolioToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
};
