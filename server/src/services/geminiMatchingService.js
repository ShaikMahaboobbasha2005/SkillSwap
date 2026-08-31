/**
 * geminiMatchingService.js — SkillSwap
 * Dedicated service for AI-powered semantic matching and ranking using Google Gemini.
 * 
 * Responsibilities:
 * - Gemini client initialization with @google/genai
 * - isGeminiAvailable() check
 * - Candidate skill payload sanitation (privacy-safe: only skill names, categories, levels)
 * - Batched candidate semantic evaluation prompt
 * - Structured JSON output parsing and validation (scores 0-100, max 2 reasons, verified candidateIds)
 * - Timeout handling (4000ms max)
 * - Graceful fallback on error/missing key/rate limit
 * - Mock injection hook for deterministic testing
 */

const { GoogleGenAI } = require("@google/genai");

// Current Gemini Flash models optimized for structured JSON, ultra-low latency, and free tier
const CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
];
const DEFAULT_GEMINI_MODEL = CANDIDATE_GEMINI_MODELS[0];
const REQUEST_TIMEOUT_MS = 6000;

// Test/Mock hook support
let mockHandler = null;

/**
 * Checks if Gemini AI service is available (API key configured or mock handler injected)
 * @returns {boolean}
 */
const isGeminiAvailable = () => {
  if (mockHandler !== null) return true;
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
};

/**
 * Injects a mock handler for testing (avoids live API calls and network dependency)
 * @param {Function|null} fn - Async or sync function (payload) => Array<{ candidateId, semanticScore, semanticReasons }>
 */
const setMockHandler = (fn) => {
  mockHandler = fn;
};

/**
 * Resets the mock handler to null
 */
const resetMockHandler = () => {
  mockHandler = null;
};

/**
 * Sanitizes and extracts only the minimal required skill information for semantic matching
 * @param {Object} currentUserSkills - { offering: Array, learning: Array }
 * @param {Array<Object>} candidates - Array of candidate objects with user and skill arrays
 * @returns {{ targetUser: Object, candidates: Array }}
 */
const preparePayload = (currentUserSkills, candidates) => {
  const targetUser = {
    learningSkills: (currentUserSkills.learning || []).map((s) => ({
      name: s.name,
      category: s.category || "Other",
      level: s.level || "Beginner",
    })),
    offeringSkills: (currentUserSkills.offering || []).map((s) => ({
      name: s.name,
      category: s.category || "Other",
      level: s.level || "Beginner",
    })),
  };

  const formattedCandidates = (candidates || []).map((c) => {
    const candidateId = String(c.user?._id || c.user?.id || c._id || "");
    return {
      candidateId,
      offeringSkills: (c.offering || []).map((s) => ({
        name: s.name,
        category: s.category || "Other",
        level: s.level || "Beginner",
      })),
      learningSkills: (c.learning || []).map((s) => ({
        name: s.name,
        category: s.category || "Other",
        level: s.level || "Beginner",
      })),
    };
  });

  return { targetUser, candidates: formattedCandidates };
};

/**
 * Builds the system prompt and instructions for Gemini semantic matching
 */
const buildPrompt = (payload) => {
  return `You are an expert AI skill-matching engine for SkillSwap.
Evaluate the semantic relevance between the Target User and each Candidate for a reciprocal skill exchange.

Target User Profile:
- Skills they want to learn: ${JSON.stringify(payload.targetUser.learningSkills)}
- Skills they can teach: ${JSON.stringify(payload.targetUser.offeringSkills)}

Candidates Pool:
${JSON.stringify(payload.candidates, null, 2)}

Instructions:
1. For each candidate, evaluate SEMANTIC skill compatibility:
   - High relevance (75–100): Candidate offers skills that strongly fulfill the target user's learning goal (e.g. Target wants "Web Development", Candidate offers "React", "Node.js", "Express"; or Target wants "Frontend", Candidate offers "React", "CSS") and/or Candidate wants what Target offers.
   - Moderate relevance (40–74): Candidate offers skills in a related or adjacent domain.
   - Low/Weak relevance (0–39): Candidate offers unrelated or superficial skills (e.g. Target wants "Video Editing", Candidate offers "Python" or "MongoDB").
2. Provide at most 2 concise, natural, human-readable reasons (e.g. "Their React and Node.js skills directly cover your Web Development learning goal.").
3. Return ONLY a valid JSON array containing one object per candidate matching this exact schema:
[
  {
    "candidateId": "exact string candidateId from input",
    "semanticScore": <integer between 0 and 100>,
    "semanticReasons": ["reason 1", "reason 2"]
  }
]
Do NOT invent candidate IDs. Do not return any extra commentary outside the JSON array.`;
};

/**
 * Validates and normalizes the parsed Gemini output
 * @param {any} rawResults - Parsed JSON from Gemini
 * @param {Set<string>} validCandidateIds - Set of valid candidate IDs
 * @returns {Map<string, { semanticScore: number, semanticReasons: Array<string> }>}
 */
const validateSemanticResults = (rawResults, validCandidateIds) => {
  const resultMap = new Map();

  if (!Array.isArray(rawResults)) {
    return resultMap;
  }

  for (const item of rawResults) {
    if (!item || typeof item !== "object") continue;

    const candidateId = String(item.candidateId || "");
    if (!validCandidateIds.has(candidateId)) {
      // Reject fabricated / unknown candidate IDs
      continue;
    }

    let score = Number(item.semanticScore);
    if (isNaN(score)) {
      score = 0;
    }
    // Clamp score to integer between 0 and 100
    score = Math.min(100, Math.max(0, Math.round(score)));

    let reasons = [];
    if (Array.isArray(item.semanticReasons)) {
      reasons = item.semanticReasons
        .filter((r) => typeof r === "string" && r.trim().length > 0)
        .map((r) => r.trim().slice(0, 200))
        .slice(0, 2);
    }

    resultMap.set(candidateId, {
      semanticScore: score,
      semanticReasons: reasons,
    });
  }

  return resultMap;
};

/**
 * Evaluates semantic match scores for a bounded candidate pool
 * @param {Object} currentUserSkills - { offering: Array, learning: Array }
 * @param {Array<Object>} candidates - Candidate objects from findCandidates / compatibility filtering
 * @returns {Promise<Map<string, { semanticScore: number|null, semanticReasons: Array<string> }>>}
 */
const evaluateSemanticMatches = async (currentUserSkills, candidates) => {
  const fallbackMap = new Map();
  if (!candidates || candidates.length === 0) {
    return fallbackMap;
  }

  const validCandidateIds = new Set();
  for (const c of candidates) {
    const id = String(c.user?._id || c.user?.id || c._id || "");
    if (id) {
      validCandidateIds.add(id);
      fallbackMap.set(id, { semanticScore: null, semanticReasons: [] });
    }
  }

  if (!isGeminiAvailable()) {
    return fallbackMap;
  }

  const payload = preparePayload(currentUserSkills, candidates);

  try {
    let rawOutputText = "";

    if (mockHandler !== null) {
      const mockResult = await mockHandler(payload);
      if (typeof mockResult === "string") {
        rawOutputText = mockResult;
      } else if (Array.isArray(mockResult)) {
        rawOutputText = JSON.stringify(mockResult);
      } else {
        rawOutputText = JSON.stringify(mockResult);
      }
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildPrompt(payload);

      let lastError = null;
      for (const modelName of CANDIDATE_GEMINI_MODELS) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("GEMINI_REQUEST_TIMEOUT")), REQUEST_TIMEOUT_MS)
          );

          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const response = await Promise.race([generatePromise, timeoutPromise]);
          rawOutputText = response?.text || "";
          if (rawOutputText) break;
        } catch (mErr) {
          lastError = mErr;
          continue;
        }
      }

      if (!rawOutputText && lastError) {
        throw lastError;
      }
    }

    if (!rawOutputText) {
      return fallbackMap;
    }

    // Safe JSON parsing (stripping markdown code fences if any)
    let cleanedJson = rawOutputText.trim();
    if (cleanedJson.startsWith("```json")) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsedJson = JSON.parse(cleanedJson);
    const validatedMap = validateSemanticResults(parsedJson, validCandidateIds);

    // Merge validated results into fallback map
    for (const [candId, data] of validatedMap.entries()) {
      fallbackMap.set(candId, data);
    }

    return fallbackMap;
  } catch (error) {
    // Log sanitized warning (never log api key or full error stack to client)
    console.warn(
      `[GeminiMatchingService] Semantic ranking unavailable (${error.message || "Unknown error"}). Falling back to deterministic scoring.`
    );
    return fallbackMap;
  }
};

module.exports = {
  isGeminiAvailable,
  evaluateSemanticMatches,
  setMockHandler,
  resetMockHandler,
  preparePayload,
  buildPrompt,
  validateSemanticResults,
  DEFAULT_GEMINI_MODEL,
  REQUEST_TIMEOUT_MS,
};
