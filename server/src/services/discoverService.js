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

  // 5. Sorting Validation (default = newest, invalid sort falls back to newest)
  const sortStage = {};
  const normalizedSort = typeof sort === "string" ? sort.trim().toLowerCase() : "newest";

  switch (normalizedSort) {
    case "oldest":
      sortStage.createdAt = 1;
      break;
    case "alpha_asc":
    case "a-z":
    case "name_asc":
      sortStage.name = 1;
      break;
    case "alpha_desc":
    case "z-a":
    case "name_desc":
      sortStage.name = -1;
      break;
    case "newest":
    default:
      sortStage.createdAt = -1;
      break;
  }

  pipeline.push({ $sort: sortStage });

  // 6. Final Facet Stage for total count metadata & explicit field projection
  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalResults" }],
      results: [
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 0,
            userId: "$ownerDoc._id",
            skillId: "$_id",
            name: "$ownerDoc.name",
            avatar: "$ownerDoc.profilePicture",
            banner: "$ownerDoc.profileBanner",
            location: "$ownerDoc.location",
            skill: "$name",
            category: "$category",
            type: "$type",
            level: "$level",
            description: "$description",
            yearsOfExperience: "$yearsOfExperience",
            rating: "$ownerDoc.avgRating",
            completedSwaps: "$ownerDoc.completedSwaps",
            createdAt: "$createdAt",
          },
        },
      ],
    },
  });

  const aggregateResult = await Skill.aggregate(pipeline);

  const metadata = aggregateResult[0]?.metadata[0] || { totalResults: 0 };
  const totalResults = metadata.totalResults || 0;
  const results = aggregateResult[0]?.results || [];

  // Ensure totalPages is at least 1 when totalResults is 0 to avoid empty pagination edge cases
  const totalPages = totalResults === 0 ? 1 : Math.ceil(totalResults / limitNum);

  return {
    data: results,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalResults,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};

module.exports = {
  discoverSkills,
};
