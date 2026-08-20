const portfolioService = require("../services/portfolioService");

/**
 * Create a new portfolio item
 * POST /api/portfolio
 */
const createPortfolioItem = async (req, res, next) => {
  try {
    const portfolioItem = await portfolioService.createPortfolioItem(
      req.user.id,
      req.file,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Portfolio item created successfully",
      data: portfolioItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active portfolio items for a user
 * GET /api/portfolio/user/:userId
 */
const getUserPortfolio = async (req, res, next) => {
  try {
    const result = await portfolioService.getUserPortfolio(
      req.params.userId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single portfolio item by ID
 * GET /api/portfolio/:id
 */
const getPortfolioItemById = async (req, res, next) => {
  try {
    const portfolioItem = await portfolioService.getPortfolioItemById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: portfolioItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update portfolio item (caption, skillId)
 * PATCH /api/portfolio/:id
 */
const updatePortfolioItem = async (req, res, next) => {
  try {
    const updatedItem = await portfolioService.updatePortfolioItem(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Portfolio item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete portfolio item permanently
 * DELETE /api/portfolio/:id
 */
const deletePortfolioItem = async (req, res, next) => {
  try {
    const result = await portfolioService.deletePortfolioItem(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: result.message || "Portfolio item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPortfolioItem,
  getUserPortfolio,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
};
