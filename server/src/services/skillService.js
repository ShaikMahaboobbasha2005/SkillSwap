const Skill = require("../models/Skill");

const normalizeSkillName = (name) => {
  return name ? name.trim().replace(/\s+/g, " ").toLowerCase() : "";
};

const createSkill = async (userId, skillData) => {
  const normalized = normalizeSkillName(skillData.name);

  // Prevent duplicate skills for the same user with the same type (case & space insensitive)
  const existing = await Skill.findOne({
    owner: userId,
    type: skillData.type,
    normalizedName: normalized,
  });

  if (existing) {
    const error = new Error(
      `You have already added '${skillData.name.trim()}' to your ${
        skillData.type === "Offer" ? "Skills Offered" : "Skills Wanted"
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
    visibility,
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

  // Enforce Visibility Rules: Only profile owner can see Private skills
  const isOwnerRequesting =
    requestingUserId && owner && String(requestingUserId) === String(owner);

  if (!isOwnerRequesting) {
    filter.visibility = "Public";
  } else if (visibility) {
    filter.visibility = visibility;
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
  if (updateData.visibility !== undefined) skill.visibility = updateData.visibility;
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
