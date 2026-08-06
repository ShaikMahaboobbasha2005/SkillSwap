const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_TYPES,
} = require("../constants/skillConstants");

/**
 * Escapes regex special characters to prevent ReDoS attacks and invalid pattern errors
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * @typedef {Object} DiscoveryItem
 * @property {string} userId - Owner User ObjectId
 * @property {string} skillId - Skill ObjectId
 * @property {string} name - User display name
 * @property {string} avatar - User profile picture URL
 * @property {string} banner - User profile banner URL
 * @property {string} location - User location string
 * @property {string} skill - Skill title/name
 * @property {string} category - Skill category
 * @property {string} type - "Offer" | "Learn"
 * @property {string} level - "Beginner" | "Intermediate" | "Advanced" | "Expert"
 * @property {string} description - Short skill description
 * @property {number|null} yearsOfExperience - Years of experience. Note: null is expected when unspecified by user (frontend displays "Not specified" or "—")
 * @property {number} rating - User average rating
 * @property {number} completedSwaps - Number of completed swaps
 * @property {string} createdAt - Skill creation timestamp
 */

/**
 * Perform discovery search across public skills and user profiles
 * Excludes the requesting authenticated user's own profile and skills
 */
const discoverSkills = async (queryParams = {}, requestingUserId = null) => {
  const {
    search,
    category,
    type,
    level,
    page,
    limit,
    sort,
  } = queryParams;

  // 1. Pagination Parameters Validation & Bounds
  let pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  let limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1) {
    limitNum = 12;
  } else if (limitNum > 50) {
    limitNum = 50;
  }

  const skip = (pageNum - 1) * limitNum;

  // 2. Initial Match Filter - Strictly enforce Active status
  const matchStage = {
    status: "Active",
  };

  // Exclude authenticated user's own skills from discovery
  if (requestingUserId) {
    matchStage.owner = {
      $ne: mongoose.Types.ObjectId.isValid(requestingUserId)
        ? new mongoose.Types.ObjectId(requestingUserId)
        : requestingUserId,
    };
  }

  // Category Filter
  if (category && typeof category === "string" && SKILL_CATEGORIES.includes(category.trim())) {
    matchStage.category = category.trim();
  }

  // Skill Type Filter (Offer / Learn) - Case insensitive lookup
  if (type && typeof type === "string") {
    const rawType = type.trim();
    const formattedType = SKILL_TYPES.find(
      (t) => t.toLowerCase() === rawType.toLowerCase()
    );
    if (formattedType) {
      matchStage.type = formattedType;
    }
  }

  // Proficiency Level Filter (Beginner / Intermediate / Advanced / Expert)
  if (level && typeof level === "string") {
    const rawLevel = level.trim();
    const formattedLevel = SKILL_LEVELS.find(
      (l) => l.toLowerCase() === rawLevel.toLowerCase()
    );
    if (formattedLevel) {
      matchStage.level = formattedLevel;
    }
  }

  // 3. Build Aggregation Pipeline
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDoc",
      },
    },
    { $unwind: "$ownerDoc" },
  ];

  // 4. Search Filter (partial, case-insensitive match across Skill name OR User name)
  if (search && typeof search === "string" && search.trim().length > 0) {
    const sanitizedSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(sanitizedSearch, "i");

    pipeline.push({
      $match: {
        $or: [
          { name: searchRegex },
          { "ownerDoc.name": searchRegex },
        ],
      },
    });
  }

  // 5. Group by Owner (Unique User) - Identifies qualifying unique users and tracks matched skill IDs
  pipeline.push({
    $group: {
      _id: "$ownerDoc._id",
      ownerDoc: { $first: "$ownerDoc" },
      matchedSkillIds: { $addToSet: "$_id" },
      latestSkillCreatedAt: { $max: "$createdAt" },
    },
  });

  // 6. Lookup ALL active skills for qualifying users to preserve full active skill sets
  pipeline.push({
    $lookup: {
      from: "skills",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$owner", "$$userId"] },
                { $eq: ["$status", "Active"] },
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      as: "allActiveSkills",
    },
  });

  // 7. Deterministic Unique User Sorting
  const sortStage = {};
  const normalizedSort = typeof sort === "string" ? sort.trim().toLowerCase() : "newest";

  switch (normalizedSort) {
    case "oldest":
      sortStage.latestSkillCreatedAt = 1;
      sortStage._id = 1;
      break;
    case "alpha_asc":
    case "a-z":
    case "name_asc":
      sortStage["ownerDoc.name"] = 1;
      sortStage._id = 1;
      break;
    case "alpha_desc":
    case "z-a":
    case "name_desc":
      sortStage["ownerDoc.name"] = -1;
      sortStage._id = -1;
      break;
    case "newest":
    default:
      sortStage.latestSkillCreatedAt = -1;
      sortStage._id = -1;
      break;
  }

  pipeline.push({ $sort: sortStage });

  // 8. Final Facet Stage for unique user total count & paginated user results
  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalUsers" }],
      results: [
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$ownerDoc.name",
            avatar: "$ownerDoc.profilePicture",
            banner: "$ownerDoc.profileBanner",
            location: "$ownerDoc.location",
            rating: "$ownerDoc.avgRating",
            completedSwaps: "$ownerDoc.completedSwaps",
            matchedSkillIds: 1,
            allActiveSkills: 1,
          },
        },
      ],
    },
  });

  const aggregateResult = await Skill.aggregate(pipeline);

  const metadata = aggregateResult[0]?.metadata[0] || { totalUsers: 0 };
  const totalUsers = metadata.totalUsers || 0;
  const rawUserResults = aggregateResult[0]?.results || [];

  // 9. Format User Cards with Authoritative Match Metadata and Partitioned Skills
  const hasSearch = Boolean(search && typeof search === "string" && search.trim().length > 0);
  const searchRegex = hasSearch ? new RegExp(escapeRegex(search.trim()), "i") : null;
  const hasCategory = Boolean(category && typeof category === "string" && SKILL_CATEGORIES.includes(category.trim()));
  const formattedCategory = hasCategory ? category.trim() : null;
  const formattedType = type && typeof type === "string"
    ? SKILL_TYPES.find((t) => t.toLowerCase() === type.trim().toLowerCase())
    : null;
  const formattedLevel = level && typeof level === "string"
    ? SKILL_LEVELS.find((l) => l.toLowerCase() === level.trim().toLowerCase())
    : null;

  const hasSkillFilter = Boolean(hasSearch || formattedCategory || formattedType || formattedLevel);

  const formattedResults = rawUserResults.map((user) => {
    const offeringSkills = [];
    const learningSkills = [];
    const matchedSkillIds = [];

    (user.allActiveSkills || []).forEach((s) => {
      const sIdStr = String(s._id);
      const skillObj = {
        skillId: s._id,
        name: s.name,
        category: s.category,
        type: s.type,
        level: s.level,
        description: s.description,
        yearsOfExperience: s.yearsOfExperience,
        createdAt: s.createdAt,
      };

      if (s.type === "Offer") {
        offeringSkills.push(skillObj);
      } else if (s.type === "Learn") {
        learningSkills.push(skillObj);
      }

      // Check if skill satisfies active search/filter criteria
      if (hasSkillFilter) {
        const matchesSearch = !hasSearch || searchRegex.test(s.name);
        const matchesCategory = !formattedCategory || s.category === formattedCategory;
        const matchesType = !formattedType || s.type === formattedType;
        const matchesLevel = !formattedLevel || s.level === formattedLevel;

        if (matchesSearch && matchesCategory && matchesType && matchesLevel) {
          matchedSkillIds.push(sIdStr);
        }
      }
    });

    return {
      userId: user.userId,
      name: user.name || "Community Member",
      avatar: user.avatar || "",
      banner: user.banner || "",
      location: user.location || "",
      rating: user.rating || 0,
      completedSwaps: user.completedSwaps || 0,
      offeringSkills,
      learningSkills,
      matchedSkillIds,
    };
  });

  // Ensure totalPages is at least 1 when totalUsers is 0 to avoid empty pagination edge cases
  const totalPages = totalUsers === 0 ? 1 : Math.ceil(totalUsers / limitNum);

  return {
    data: formattedResults,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalResults: totalUsers,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};

module.exports = {
  discoverSkills,
};
