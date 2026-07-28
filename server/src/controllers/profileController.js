const profileService = require("../services/profileService");
const { uploadToCloudinary } = require("../config/cloudinary");

const getMe = async (req, res, next) => {
  try {
    const user = await profileService.getOwnProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updatedUser = await profileService.updateOwnProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const user = await profileService.getUserPublicProfile(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  uploadImage,
  getPublicProfile,
};
