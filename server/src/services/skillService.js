const Skill = require("../models/Skill");

const normalizeSkillName = (name) => {
  return name ? name.trim().replace(/\s+/g, " ").toLowerCase() : "";
};

const createSkill = async (userId, skillData) => {
  const targetType = skillData.type || "Offer";

  // 1. Enforce capacity limit (max 5 non-deleted skills per type per user)
  const existingCount = await Skill.countDocuments({
    owner: userId,
    type: targetType,
  });

  if (existingCount >= 5) {
    const error = new Error(
      targetType === "Offer"
        ? "You can have a maximum of 5 offering skills."
        : "You can have a maximum of 5 learning skills."
    );
    error.statusCode = 409;
    throw error;
  }

  // 2. Prevent duplicate skills for the same user with the same type (case & space insensitive)
  const normalized = normalizeSkillName(skillData.name);
  const existing = await Skill.findOne({
    owner: userId,
    type: targetType,
    normalizedName: normalized,
  });

  if (existing) {
    const error = new Error(
      `You have already added '${skillData.name.trim()}' to your ${
        targetType === "Offer" ? "Skills Offered" : "Skills Wanted"
      }`
    );
    error.statusCode = 400;
    throw error;
  }

  const newSkill = new Skill({
    ...skillData,
    owner: userId,
    name: skillData.name.trim().replace(/\s+/g, " "),
    normalizedName: normalized,
  });

  await newSkill.save();
  return newSkill;
};

const getSkills = async (queryParams = {}, requestingUserId = null) => {
  const {
    owner,
    type,
    category,
    level,
    status,
    search,
    sort = "displayOrder createdAt",
    page = 1,
    limit = 100,
  } = queryParams;

  const filter = {};

  if (owner) {
    filter.owner = owner;
  }

  if (type) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (level) {
    filter.level = level;
  }

  // Enforce Availability Rules: Only profile owner can see Inactive skills
  const isOwnerRequesting =
    requestingUserId && owner && String(requestingUserId) === String(owner);

  if (!isOwnerRequesting) {
    filter.status = "Active";
  } else if (status) {
    filter.status = status;
  }

  if (search) {
    const searchNormalized = normalizeSkillName(search);
    filter.normalizedName = { $regex: searchNormalized, $options: "i" };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 100));
  const skip = (pageNum - 1) * limitNum;

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Skill.countDocuments(filter),
  ]);

  return {
    skills,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

const updateSkill = async (userId, skillId, updateData) => {
  const skill = await Skill.findById(skillId);

  if (!skill) {
    const error = new Error("Skill not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(skill.owner) !== String(userId)) {
    const error = new Error("Not authorized to update this skill");
    error.statusCode = 403;
    throw error;
  }

  // If type is updated to a different type, verify target type capacity
  if (updateData.type && updateData.type !== skill.type) {
    const targetTypeCount = await Skill.countDocuments({
      owner: userId,
      type: updateData.type,
    });

    if (targetTypeCount >= 5) {
      const error = new Error(
        updateData.type === "Offer"
          ? "You can have a maximum of 5 offering skills."
          : "You can have a maximum of 5 learning skills."
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // If name or type is updated, verify duplicate normalization
  const newName = updateData.name ? updateData.name.trim().replace(/\s+/g, " ") : skill.name;
  const newType = updateData.type || skill.type;
  const newNormalized = normalizeSkillName(newName);

  if (newNormalized !== skill.normalizedName || newType !== skill.type) {
    const existing = await Skill.findOne({
      _id: { $ne: skillId },
      owner: userId,
      type: newType,
      normalizedName: newNormalized,
    });

    if (existing) {
      const error = new Error(
        `Another skill named '${newName}' already exists in your ${
          newType === "Offer" ? "Skills Offered" : "Skills Wanted"
        }`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (updateData.name !== undefined) {
    skill.name = newName;
    skill.normalizedName = newNormalized;
  }
  if (updateData.category !== undefined) skill.category = updateData.category;
  if (updateData.level !== undefined) skill.level = updateData.level;
  if (updateData.type !== undefined) skill.type = updateData.type;
  if (updateData.description !== undefined) skill.description = updateData.description;
  if (updateData.yearsOfExperience !== undefined) skill.yearsOfExperience = updateData.yearsOfExperience;
  if (updateData.status !== undefined) skill.status = updateData.status;
  if (updateData.displayOrder !== undefined) skill.displayOrder = updateData.displayOrder;

  await skill.save();
  return skill;
};

const deleteSkill = async (userId, skillId) => {
  const skill = await Skill.findById(skillId);

  if (!skill) {
    const error = new Error("Skill not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(skill.owner) !== String(userId)) {
    const error = new Error("Not authorized to delete this skill");
    error.statusCode = 403;
    throw error;
  }

  await Skill.findByIdAndDelete(skillId);
  return { id: skillId };
};

module.exports = {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
};
