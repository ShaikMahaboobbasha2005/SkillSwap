const mongoose = require("mongoose");
const User = require("../models/User");
const { deleteFromCloudinary, extractPublicIdFromUrl } = require("../config/cloudinary");

const getOwnProfile = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    const error = new Error("User profile not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateOwnProfile = async (userId, updateData) => {
  // Explicitly extract ONLY editable fields
  const allowedFields = {};
  if (updateData.name !== undefined) allowedFields.name = updateData.name;
  if (updateData.profilePicture !== undefined) allowedFields.profilePicture = updateData.profilePicture;
  if (updateData.profilePicturePublicId !== undefined) allowedFields.profilePicturePublicId = updateData.profilePicturePublicId;
  if (updateData.profileBanner !== undefined) allowedFields.profileBanner = updateData.profileBanner;
  if (updateData.profileBannerPublicId !== undefined) allowedFields.profileBannerPublicId = updateData.profileBannerPublicId;
  if (updateData.location !== undefined) allowedFields.location = updateData.location;

  // Pre-fetch existing user state to capture current profile image assets
  const existingUser = await User.findById(userId).select(
    "profilePicture profilePicturePublicId profileBanner profileBannerPublicId"
  );

  if (!existingUser) {
    // New-upload orphan cleanup if user is not found
    if (updateData.profilePicturePublicId) {
      deleteFromCloudinary(updateData.profilePicturePublicId);
    }
    if (updateData.profileBannerPublicId) {
      deleteFromCloudinary(updateData.profileBannerPublicId);
    }
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Identify old publicIds to clean up after successful DB update
  let oldPfpPublicId = null;
  if (
    updateData.profilePicture !== undefined &&
    updateData.profilePicture !== existingUser.profilePicture
  ) {
    oldPfpPublicId =
      existingUser.profilePicturePublicId || extractPublicIdFromUrl(existingUser.profilePicture);
  }

  let oldBannerPublicId = null;
  if (
    updateData.profileBanner !== undefined &&
    updateData.profileBanner !== existingUser.profileBanner
  ) {
    oldBannerPublicId =
      existingUser.profileBannerPublicId || extractPublicIdFromUrl(existingUser.profileBanner);
  }

  let updatedUser;
  try {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).select("-passwordHash");
  } catch (dbError) {
    // Safety Rule 3: New-upload orphan cleanup if MongoDB update fails
    if (updateData.profilePicturePublicId) {
      deleteFromCloudinary(updateData.profilePicturePublicId).catch((err) => {
        console.error("[Orphan Cleanup Error] Failed to delete newly uploaded PFP:", err.message);
      });
    }
    if (updateData.profileBannerPublicId) {
      deleteFromCloudinary(updateData.profileBannerPublicId).catch((err) => {
        console.error("[Orphan Cleanup Error] Failed to delete newly uploaded banner:", err.message);
      });
    }
    throw dbError;
  }

  if (!updatedUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Safety Rules 2 & 4: Non-blocking post-update Cloudinary cleanup with concurrent safety check
  if (oldPfpPublicId || oldBannerPublicId) {
    (async () => {
      try {
        // Safety Rule 2: Re-read latest User document before destroying assets
        const latestUser = await User.findById(userId).select(
          "profilePicture profilePicturePublicId profileBanner profileBannerPublicId"
        );
        if (!latestUser) return;

        const currentPfpPublicId =
          latestUser.profilePicturePublicId || extractPublicIdFromUrl(latestUser.profilePicture);
        const currentBannerPublicId =
          latestUser.profileBannerPublicId || extractPublicIdFromUrl(latestUser.profileBanner);

        // Clean up old PFP if no longer referenced in either field
        if (
          oldPfpPublicId &&
          oldPfpPublicId !== currentPfpPublicId &&
          oldPfpPublicId !== currentBannerPublicId
        ) {
          await deleteFromCloudinary(oldPfpPublicId);
        }

        // Clean up old Banner if no longer referenced in either field
        if (
          oldBannerPublicId &&
          oldBannerPublicId !== currentBannerPublicId &&
          oldBannerPublicId !== currentPfpPublicId
        ) {
          await deleteFromCloudinary(oldBannerPublicId);
        }
      } catch (cleanupErr) {
        // Safety Rule 4: Log cleanup failure silently without failing or rolling back DB update
        console.error("[Cloudinary Cleanup Error] Non-blocking post-update cleanup failed:", cleanupErr.message);
      }
    })();
  }

  return updatedUser;
};

const getUserPublicProfile = async (targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const error = new Error("Invalid User ID");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(targetUserId).select(
    "name email profilePicture profileBanner location avgRating completedSwaps portfolio createdAt"
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getOwnProfile,
  updateOwnProfile,
  getUserPublicProfile,
};
