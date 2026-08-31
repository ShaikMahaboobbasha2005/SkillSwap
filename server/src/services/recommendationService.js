const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const {
  normalizeSkillName,
  getCanonicalSkill,
} = require("../utils/skillNormalization");
const geminiMatchingService = require("./geminiMatchingService");

// Maximum candidate pool size evaluated with AI per request for efficiency and latency
const CANDIDATE_POOL_BOUND = 20;

/**
 * Fetches and groups active skills for a specific user into offering and learning sets
 * @param {string|mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<{ offering: Array, learning: Array }>}
 */
const getUserSkills = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { offering: [], learning: [] };
  }

  const skills = await Skill.find({
    owner: userId,
    status: "Active",
  })
    .select("_id name normalizedName category level type description yearsOfExperience")
    .lean();

  const offering = [];
  const learning = [];

  for (const s of skills) {
    const formattedSkill = {
      _id: s._id,
      name: s.name,
      normalizedName: s.normalizedName || normalizeSkillName(s.name),
      category: s.category,
      level: s.level,
      type: s.type,
      description: s.description || "",
      yearsOfExperience: s.yearsOfExperience || null,
    };

    if (s.type === "Offer") {
      offering.push(formattedSkill);
    } else if (s.type === "Learn") {
      learning.push(formattedSkill);
    }
  }

  return { offering, learning };
};

/**
 * Finds potential candidate users who own active skills, excluding self
 * @param {string|mongoose.Types.ObjectId} currentUserId - Authenticated user ID
 * @returns {Promise<Array<{ user: Object, offering: Array, learning: Array }>>}
 */
const findCandidates = async (currentUserId) => {
  const currentObjId = new mongoose.Types.ObjectId(currentUserId);

  // Fetch active skills for all candidate users (excluding authenticated user)
  const candidateSkills = await Skill.find({
    status: "Active",
    owner: { $ne: currentObjId },
  })
    .populate("owner", "name profilePicture profileBanner location avgRating completedSwaps")
    .select("_id name normalizedName category level type description yearsOfExperience owner")
    .lean();

  // Group skills by candidate user
  const candidateMap = new Map();

  for (const skill of candidateSkills) {
    if (!skill.owner || !skill.owner._id) continue;

    const candidateIdStr = skill.owner._id.toString();

    if (!candidateMap.has(candidateIdStr)) {
      candidateMap.set(candidateIdStr, {
        user: skill.owner,
        offering: [],
        learning: [],
      });
    }

    const candidateEntry = candidateMap.get(candidateIdStr);
    const formattedSkill = {
      _id: skill._id,
      name: skill.name,
      normalizedName: skill.normalizedName || normalizeSkillName(skill.name),
      category: skill.category,
      level: skill.level,
      type: skill.type,
      description: skill.description || "",
      yearsOfExperience: skill.yearsOfExperience || null,
    };

    if (skill.type === "Offer") {
      candidateEntry.offering.push(formattedSkill);
    } else if (skill.type === "Learn") {
      candidateEntry.learning.push(formattedSkill);
    }
  }

  return Array.from(candidateMap.values());
};

/**
 * Calculates skill compatibility between the current user and a candidate
 * @param {{ offering: Array, learning: Array }} currentUserSkills
 * @param {{ offering: Array, learning: Array }} candidateSkills
 * @returns {Object} Structured match details
 */
const calculateSkillCompatibility = (currentUserSkills, candidateSkills) => {
  const exactMatchesForYou = [];
  const exactMatchesForThem = [];
  const matchedUserLearnIds = new Set();
  const matchedCandOfferIds = new Set();
  const matchedCandLearnIds = new Set();
  const matchedUserOfferIds = new Set();

  // A. Exact matches for current user: Candidate offers a skill current user wants to learn
  for (const userLearn of currentUserSkills.learning || []) {
    const userNorm = normalizeSkillName(userLearn.normalizedName || userLearn.name);
    if (!userNorm) continue;

    for (const candOffer of candidateSkills.offering || []) {
      const candNorm = normalizeSkillName(candOffer.normalizedName || candOffer.name);
      if (candNorm && userNorm === candNorm) {
        exactMatchesForYou.push({
          id: candOffer._id,
          name: candOffer.name,
          category: candOffer.category,
          level: candOffer.level,
        });
        matchedUserLearnIds.add(userLearn._id.toString());
        matchedCandOfferIds.add(candOffer._id.toString());
        break; // Match found for this user learn skill
      }
    }
  }

  // B. Exact matches for candidate: Candidate wants a skill current user offers
  for (const candLearn of candidateSkills.learning || []) {
    const candNorm = normalizeSkillName(candLearn.normalizedName || candLearn.name);
    if (!candNorm) continue;

    for (const userOffer of currentUserSkills.offering || []) {
      const userNorm = normalizeSkillName(userOffer.normalizedName || userOffer.name);
      if (userNorm && candNorm === userNorm) {
        exactMatchesForThem.push({
          id: userOffer._id,
          name: userOffer.name,
          category: userOffer.category,
          level: userOffer.level,
        });
        matchedCandLearnIds.add(candLearn._id.toString());
        matchedUserOfferIds.add(userOffer._id.toString());
        break; // Match found for this candidate learn skill
      }
    }
  }

  // C. Mutual match detection
  const mutualMatch = exactMatchesForYou.length > 0 && exactMatchesForThem.length > 0;

  // D. Related/category matches: Same category overlap for non-exact matched skills
  const relatedMatches = [];
  const matchedCategoryPairs = new Set();

  for (const userLearn of currentUserSkills.learning || []) {
    if (matchedUserLearnIds.has(userLearn._id.toString())) continue;
    if (!userLearn.category || userLearn.category === "Other") continue;

    for (const candOffer of candidateSkills.offering || []) {
      if (matchedCandOfferIds.has(candOffer._id.toString())) continue;
      if (!candOffer.category || candOffer.category === "Other") continue;

      if (userLearn.category === candOffer.category) {
        const pairKey = `${userLearn._id}_${candOffer._id}`;
        if (!matchedCategoryPairs.has(pairKey)) {
          matchedCategoryPairs.add(pairKey);
          relatedMatches.push({
            userSkill: {
              id: userLearn._id,
              name: userLearn.name,
              category: userLearn.category,
            },
            candidateSkill: {
              id: candOffer._id,
              name: candOffer.name,
              category: candOffer.category,
            },
            category: userLearn.category,
          });
        }
      }
    }
  }

  const exactMatchCount = exactMatchesForYou.length + exactMatchesForThem.length;
  const relatedMatchCount = relatedMatches.length;

  return {
    exactMatchesForYou,
    exactMatchesForThem,
    relatedMatches,
    mutualMatch,
    exactMatchCount,
    relatedMatchCount,
  };
};

/**
 * Calculates directional exact match score with diminishing returns
 * @param {number} count - Number of exact matches in one direction
 * @returns {number} Directional score (0, 26, 36, 42, 45, 46)
 */
function getDirectionalScore(count) {
  if (count <= 0) return 0;
  if (count === 1) return 26;
  if (count === 2) return 36;
  if (count === 3) return 42;
  if (count === 4) return 45;
  return 46;
}

/**
 * Computes deterministic compatibility score bounded strictly between 0 and 100 with progressive diminishing returns
 * @param {Object} matchDetails
 * @returns {number} Score from 0 to 100
 */
const computeCompatibilityScore = (matchDetails) => {
  const { exactMatchesForYou = [], exactMatchesForThem = [], mutualMatch, relatedMatches = [] } = matchDetails;

  // Directional Exact Match Scores (diminishing returns per direction: 0->0, 1->26, 2->36, 3->42, 4->45, 5+->46)
  const forYouScore = getDirectionalScore(exactMatchesForYou.length);
  const forThemScore = getDirectionalScore(exactMatchesForThem.length);

  // Mutual Two-Way Exchange Bonus: +20
  const mutualBonus = mutualMatch ? 20 : 0;

  // Related/Category Matches: +8 per match, max 16
  const relatedScore = Math.min(16, relatedMatches.length * 8);

  const rawScore = forYouScore + forThemScore + mutualBonus + relatedScore;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
};

/**
 * Computes hybrid score combining deterministic traditional score (70%) and Gemini semantic score (30%)
 * @param {number} traditionalScore - Deterministic score (0-100)
 * @param {number|null} semanticScore - Gemini semantic score (0-100 or null)
 * @returns {number} Final hybrid score bounded strictly between 0 and 100
 */
const computeHybridScore = (traditionalScore, semanticScore) => {
  const clampedTraditional = Math.min(100, Math.max(0, Math.round(Number(traditionalScore) || 0)));

  if (semanticScore === null || semanticScore === undefined || isNaN(Number(semanticScore))) {
    return clampedTraditional;
  }

  const clampedSemantic = Math.min(100, Math.max(0, Math.round(Number(semanticScore) || 0)));
  const weighted = clampedTraditional * 0.70 + clampedSemantic * 0.30;

  return Math.min(100, Math.max(0, Math.round(weighted)));
};

/**
 * Generates human-readable, deterministic explanations based strictly on real match results
 * @param {Object} matchDetails
 * @returns {Array<string>} List of match reasons
 */
const generateMatchReasons = (matchDetails) => {
  const { exactMatchesForYou, exactMatchesForThem, mutualMatch, relatedMatches } = matchDetails;
  const reasons = [];

  if (mutualMatch) {
    reasons.push("You have a mutual skill match! You can exchange skills with each other.");
  }

  if (exactMatchesForYou.length > 0) {
    const skillNames = exactMatchesForYou.map((s) => s.name);
    if (skillNames.length === 1) {
      reasons.push(`They offer ${skillNames[0]}, which you want to learn.`);
    } else {
      reasons.push(`They offer ${skillNames.join(", ")}, which you want to learn.`);
    }
  }

  if (exactMatchesForThem.length > 0) {
    const skillNames = exactMatchesForThem.map((s) => s.name);
    if (skillNames.length === 1) {
      reasons.push(`They want to learn ${skillNames[0]}, which you can teach.`);
    } else {
      reasons.push(`They want to learn ${skillNames.join(", ")}, which you can teach.`);
    }
  }

  if (exactMatchesForYou.length === 0 && relatedMatches && relatedMatches.length > 0) {
    const categories = Array.from(new Set(relatedMatches.map((r) => r.category)));
    if (categories.length === 1) {
      reasons.push(
        `They offer skills in ${categories[0]}, which is related to what you want to learn.`
      );
    } else {
      reasons.push(
        `They offer skills in ${categories.join(", ")}, which are related to what you want to learn.`
      );
    }
  }

  return reasons;
};

/**
 * Main recommendation pipeline for an authenticated user
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user ID
 * @param {Object} queryParams - { page, limit }
 * @returns {Promise<{ recommendations: Array, meta: Object }>}
 */
const getRecommendations = async (userId, queryParams = {}) => {
  // 1. Validate and sanitize pagination parameters
  let pageNum = parseInt(queryParams.page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  let limitNum = parseInt(queryParams.limit, 10);
  if (isNaN(limitNum) || limitNum < 1) {
    limitNum = 10;
  } else if (limitNum > 50) {
    limitNum = 50;
  }

  // 2. Fetch authenticated user's active skills
  const currentUserSkills = await getUserSkills(userId);

  // If the user offers nothing and wants nothing, return empty recommendations list
  if (
    currentUserSkills.offering.length === 0 &&
    currentUserSkills.learning.length === 0
  ) {
    return {
      recommendations: [],
      meta: {
        page: pageNum,
        limit: limitNum,
        total: 0,
        totalPages: 1,
      },
    };
  }

  // 3. Find non-excluded candidates with active skills
  const candidates = await findCandidates(userId);

  // 4. Calculate deterministic compatibility, scores, and explanations for each candidate
  const scoredCandidates = [];

  for (const candidate of candidates) {
    const matchDetails = calculateSkillCompatibility(currentUserSkills, {
      offering: candidate.offering,
      learning: candidate.learning,
    });

    const traditionalScore = computeCompatibilityScore(matchDetails);

    // Only include candidates with a positive compatibility score (> 0)
    if (traditionalScore > 0) {
      const reasons = generateMatchReasons(matchDetails);

      scoredCandidates.push({
        candidateRaw: candidate,
        user: {
          _id: candidate.user._id,
          name: candidate.user.name || "Community Member",
          profilePicture: candidate.user.profilePicture || "",
          profileBanner: candidate.user.profileBanner || "",
          location: candidate.user.location || "",
          avgRating: candidate.user.avgRating || 0,
          completedSwaps: candidate.user.completedSwaps || 0,
        },
        traditionalScore,
        compatibilityScore: traditionalScore,
        semanticScore: null,
        matchDetails: {
          exactMatchesForYou: matchDetails.exactMatchesForYou,
          exactMatchesForThem: matchDetails.exactMatchesForThem,
          relatedMatches: matchDetails.relatedMatches,
          mutualMatch: matchDetails.mutualMatch,
          exactMatchCount: matchDetails.exactMatchCount,
          relatedMatchCount: matchDetails.relatedMatchCount,
        },
        reasons,
        aiMatchReasons: [],
      });
    }
  }

  // 5. Initial deterministic sorting to pick candidate pool
  scoredCandidates.sort((a, b) => {
    if (b.traditionalScore !== a.traditionalScore) {
      return b.traditionalScore - a.traditionalScore;
    }
    if (b.matchDetails.mutualMatch !== a.matchDetails.mutualMatch) {
      return (b.matchDetails.mutualMatch ? 1 : 0) - (a.matchDetails.mutualMatch ? 1 : 0);
    }
    if (b.matchDetails.exactMatchCount !== a.matchDetails.exactMatchCount) {
      return b.matchDetails.exactMatchCount - a.matchDetails.exactMatchCount;
    }
    if (b.matchDetails.relatedMatchCount !== a.matchDetails.relatedMatchCount) {
      return b.matchDetails.relatedMatchCount - a.matchDetails.relatedMatchCount;
    }
    return String(a.user._id).localeCompare(String(b.user._id));
  });

  // Check if AI-enhanced semantic ranking was explicitly requested by user
  const useAi = String(queryParams.ai).toLowerCase() === "true" || queryParams.ai === true;
  let isAiEnhanced = false;

  // 6. Gemini Semantic Layer: ONLY execute when explicitly requested via ai=true
  if (useAi && scoredCandidates.length > 0 && geminiMatchingService.isGeminiAvailable()) {
    try {
      const poolToEvaluate = scoredCandidates
        .slice(0, CANDIDATE_POOL_BOUND)
        .map((sc) => sc.candidateRaw);

      const semanticMap = await geminiMatchingService.evaluateSemanticMatches(
        currentUserSkills,
        poolToEvaluate
      );

      // Apply hybrid scoring and enrich reasons
      for (const candidate of scoredCandidates) {
        const candIdStr = String(candidate.user._id);
        const semanticInfo = semanticMap.get(candIdStr);

        if (semanticInfo && typeof semanticInfo.semanticScore === "number") {
          isAiEnhanced = true;
          const semanticScore = semanticInfo.semanticScore;
          const hybridScore = computeHybridScore(candidate.traditionalScore, semanticScore);

          candidate.semanticScore = semanticScore;
          candidate.compatibilityScore = hybridScore;

          if (Array.isArray(semanticInfo.semanticReasons) && semanticInfo.semanticReasons.length > 0) {
            candidate.aiMatchReasons = semanticInfo.semanticReasons;
            // Append non-duplicate AI reasons to match reasons array
            for (const aiReason of semanticInfo.semanticReasons) {
              if (!candidate.reasons.includes(aiReason)) {
                candidate.reasons.push(aiReason);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn(
        `[RecommendationService] Gemini evaluation error (${err.message}). Using deterministic scoring.`
      );
    }
  }

  // Clean up raw candidate internal references
  for (const candidate of scoredCandidates) {
    delete candidate.candidateRaw;
  }

  // 7. Final skill-compatibility sorting (hybrid if AI active, deterministic otherwise)
  // Priority:
  // 1. compatibilityScore DESC
  // 2. mutualMatch DESC
  // 3. exactMatchCount DESC
  // 4. relatedMatchCount DESC
  // 5. _id ASC (stable deterministic tie-breaker)
  scoredCandidates.sort((a, b) => {
    if (b.compatibilityScore !== a.compatibilityScore) {
      return b.compatibilityScore - a.compatibilityScore;
    }
    if (b.matchDetails.mutualMatch !== a.matchDetails.mutualMatch) {
      return (b.matchDetails.mutualMatch ? 1 : 0) - (a.matchDetails.mutualMatch ? 1 : 0);
    }
    if (b.matchDetails.exactMatchCount !== a.matchDetails.exactMatchCount) {
      return b.matchDetails.exactMatchCount - a.matchDetails.exactMatchCount;
    }
    if (b.matchDetails.relatedMatchCount !== a.matchDetails.relatedMatchCount) {
      return b.matchDetails.relatedMatchCount - a.matchDetails.relatedMatchCount;
    }
    return String(a.user._id).localeCompare(String(b.user._id));
  });

  // 8. Pagination slicing
  const total = scoredCandidates.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / limitNum);
  const skip = (pageNum - 1) * limitNum;
  const paginatedRecommendations = scoredCandidates.slice(skip, skip + limitNum);

  return {
    recommendations: paginatedRecommendations,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      isAiRequested: useAi,
      isAiEnhanced,
    },
  };
};

module.exports = {
  normalizeSkillName,
  getCanonicalSkill,
  getUserSkills,
  findCandidates,
  calculateSkillCompatibility,
  getDirectionalScore,
  computeCompatibilityScore,
  computeHybridScore,
  generateMatchReasons,
  getRecommendations,
  CANDIDATE_POOL_BOUND,
};

