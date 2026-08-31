const recommendationService = require("../services/recommendationService");

/**
 * GET /api/recommendations
 * Recommends top skill-swap candidates for the authenticated user based on deterministic skill compatibility
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await recommendationService.getRecommendations(userId, req.query);

    return res.status(200).json({
      success: true,
      data: {
        recommendations: result.recommendations,
      },
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
