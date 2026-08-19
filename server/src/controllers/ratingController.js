const ratingService = require("../services/ratingService");

const createRating = async (req, res, next) => {
  try {
    const result = await ratingService.createRating(req.params.swapId, req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        rating: result.rating,
        updatedAvgRating: result.updatedAvgRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRatingsForUser = async (req, res, next) => {
  try {
    const result = await ratingService.getRatingsForUser(req.params.userId, req.query);
    res.status(200).json({
      success: true,
      data: result.ratings,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRatingStatusForSwap = async (req, res, next) => {
  try {
    const result = await ratingService.getRatingStatusForSwap(req.params.swapId, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  getRatingsForUser,
  getRatingStatusForSwap,
};
