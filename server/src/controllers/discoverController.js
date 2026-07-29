const discoverService = require("../services/discoverService");

/**
 * GET /api/discover
 * Discovery API for authenticated users (excludes requesting user's own profile and skills)
 */
const discover = async (req, res, next) => {
  try {
    const requestingUserId = req.user?.id || req.user?._id;
    const result = await discoverService.discoverSkills(req.query, requestingUserId);
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  discover,
};
