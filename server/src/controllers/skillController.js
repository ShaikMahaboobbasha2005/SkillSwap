const skillService = require("../services/skillService");

const createSkill = async (req, res, next) => {
  try {
    const skill = await skillService.createSkill(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

const getOwnSkills = async (req, res, next) => {
  try {
    const result = await skillService.getSkills(
      { owner: req.user.id, ...req.query },
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: result.skills,
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

const getUserActiveSkills = async (req, res, next) => {
  try {
    const requestingUserId = req.user ? req.user.id : null;
    const result = await skillService.getSkills(
      { owner: req.params.userId, ...req.query },
      requestingUserId
    );
    res.status(200).json({
      success: true,
      data: result.skills,
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

const updateSkill = async (req, res, next) => {
  try {
    const updatedSkill = await skillService.updateSkill(
      req.user.id,
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const result = await skillService.deleteSkill(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSkill,
  getOwnSkills,
  getUserActiveSkills,
  getUserPublicSkills: getUserActiveSkills,
  updateSkill,
  deleteSkill,
};
