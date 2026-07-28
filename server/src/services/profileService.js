const mongoose = require("mongoose");
const User = require("../models/User");

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
  // Explicitly extract ONLY editable fields (name, profilePicture, location)
  const allowedFields = {};
  if (updateData.name !== undefined) allowedFields.name = updateData.name;
  if (updateData.profilePicture !== undefined) allowedFields.profilePicture = updateData.profilePicture;
  if (updateData.location !== undefined) allowedFields.location = updateData.location;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: allowedFields },
    { new: true, runValidators: true }
  ).select("-passwordHash");

  if (!updatedUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
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
    "name profilePicture location avgRating completedSwaps skillsOffered skillsWanted portfolio createdAt"
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
