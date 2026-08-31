const assert = require("assert");
const {
  cleanSkillText,
  normalizeSkillName,
  getCanonicalSkill,
  calculateSkillCompatibility,
  getDirectionalScore,
  computeCompatibilityScore,
  generateMatchReasons,
} = require("../src/services/recommendationService");

console.log("=================================================");
console.log("  SkillSwap Phase 10.1 — Recommendation Engine Tests");
console.log("  (Progressive Diminishing-Returns Compatibility Scoring)");
console.log("=================================================\n");

let passedCount = 0;
let failedCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Error: ${err.message}`);
    if (err.stack) console.error(`   Stack: ${err.stack.split("\n").slice(1, 4).join("\n")}`);
    failedCount++;
  }
}

// -----------------------------------------------------------------------------
// TEST 1 — JAVASCRIPT VS JS (EXACT ALIAS MATCH)
// -----------------------------------------------------------------------------
runTest("TEST 1 — JavaScript vs JS Exact Alias Match", () => {
  const userA = {
    offering: [],
    learning: [{ _id: "u_learn_js", name: "JavaScript", category: "Programming" }],
  };

  const userB = {
    offering: [{ _id: "c_offer_js", name: "JS", category: "Web Development" }],
    learning: [],
  };

  const match = calculateSkillCompatibility(userA, userB);
  const score = computeCompatibilityScore(match);
  const reasons = generateMatchReasons(match);

  assert.strictEqual(match.exactMatchesForYou.length, 1, "Should have 1 exact match for user A");
  assert.strictEqual(match.exactMatchesForYou[0].name, "JS", "Original candidate skill name 'JS' preserved");
  assert.strictEqual(score, 26, "Score should be 26 for single one-way exact match (getDirectionalScore(1) = 26)");
  assert.ok(reasons.some((r) => r.includes("They offer JS")), "Reason preserves original name 'JS'");
});

// -----------------------------------------------------------------------------
// TEST 2 — NODE.JS VS NODEJS (EXACT ALIAS MATCH)
// -----------------------------------------------------------------------------
runTest("TEST 2 — Node.js vs NodeJS Exact Alias Match", () => {
  const userA = {
    offering: [],
    learning: [{ _id: "u_learn_node", name: "Node.js", category: "Programming" }],
  };

  const userB = {
    offering: [{ _id: "c_offer_node", name: "NodeJS", category: "Programming" }],
    learning: [],
  };

  const match = calculateSkillCompatibility(userA, userB);
  const score = computeCompatibilityScore(match);

  assert.strictEqual(match.exactMatchesForYou.length, 1, "Should match Node.js to NodeJS");
  assert.strictEqual(match.exactMatchesForYou[0].name, "NodeJS", "Preserves candidate skill name 'NodeJS'");
  assert.strictEqual(score, 26, "Score should be 26");
});

// -----------------------------------------------------------------------------
// TEST 3 — REACT VS REACTJS (EXACT ALIAS MATCH)
// -----------------------------------------------------------------------------
runTest("TEST 3 — React vs ReactJS Exact Alias Match", () => {
  const userA = {
    offering: [],
    learning: [{ _id: "u_learn_react", name: "React", category: "Web Development" }],
  };

  const userB = {
    offering: [{ _id: "c_offer_react", name: "ReactJS", category: "Web Development" }],
    learning: [],
  };

  const match = calculateSkillCompatibility(userA, userB);
  const score = computeCompatibilityScore(match);

  assert.strictEqual(match.exactMatchesForYou.length, 1, "Should match React to ReactJS");
  assert.strictEqual(match.exactMatchesForYou[0].name, "ReactJS");
  assert.strictEqual(score, 26, "Score should be 26");
});

// -----------------------------------------------------------------------------
// TEST 4 — UI/UX DESIGN VS UI UX (EXACT ALIAS MATCH)
// -----------------------------------------------------------------------------
runTest("TEST 4 — UI/UX Design vs UI UX Exact Alias Match", () => {
  const userA = {
    offering: [],
    learning: [{ _id: "u_learn_uiux", name: "UI/UX Design", category: "Design" }],
  };

  const userB = {
    offering: [{ _id: "c_offer_uiux", name: "UI UX", category: "Design" }],
    learning: [],
  };

  const match = calculateSkillCompatibility(userA, userB);
  const score = computeCompatibilityScore(match);

  assert.strictEqual(match.exactMatchesForYou.length, 1, "Should match UI/UX Design to UI UX");
  assert.strictEqual(match.exactMatchesForYou[0].name, "UI UX");
  assert.strictEqual(score, 26, "Score should be 26");
});

// -----------------------------------------------------------------------------
// TEST 5 — CASE AND WHITESPACE NORMALIZATION
// -----------------------------------------------------------------------------
runTest("TEST 5 — Case, Spacing, and Punctuation Normalization", () => {
  // JavaScript variations
  assert.strictEqual(normalizeSkillName(" javascript "), "javascript");
  assert.strictEqual(normalizeSkillName("JAVASCRIPT"), "javascript");
  assert.strictEqual(normalizeSkillName("Java Script"), "javascript");
  assert.strictEqual(normalizeSkillName("java-script"), "javascript");
  assert.strictEqual(normalizeSkillName("JS"), "javascript");
  assert.strictEqual(normalizeSkillName("js"), "javascript");

  // Node variations
  assert.strictEqual(normalizeSkillName("NodeJS"), "node.js");
  assert.strictEqual(normalizeSkillName("node js"), "node.js");
  assert.strictEqual(normalizeSkillName("Node.js"), "node.js");
  assert.strictEqual(normalizeSkillName("  node-js  "), "node.js");

  // React variations
  assert.strictEqual(normalizeSkillName("ReactJS"), "react");
  assert.strictEqual(normalizeSkillName("React.js"), "react");
  assert.strictEqual(normalizeSkillName("react js"), "react");

  // UI/UX variations
  assert.strictEqual(normalizeSkillName("UI UX"), "ui/ux design");
  assert.strictEqual(normalizeSkillName("UI/UX"), "ui/ux design");
  assert.strictEqual(normalizeSkillName("UI UX Design"), "ui/ux design");
  assert.strictEqual(normalizeSkillName("UX/UI"), "ui/ux design");
  assert.strictEqual(normalizeSkillName("ui-ux"), "ui/ux design");

  // Unknown skill preservation (clean lowercase without loss)
  assert.strictEqual(normalizeSkillName("  Blender  3D  "), "blender 3d");
  assert.strictEqual(normalizeSkillName("Photoshop"), "photoshop");
});

// -----------------------------------------------------------------------------
// TEST 6 — FALSE EQUIVALENCE PROTECTION
// -----------------------------------------------------------------------------
runTest("TEST 6 — False Equivalence Protection", () => {
  assert.notStrictEqual(normalizeSkillName("Java"), normalizeSkillName("JavaScript"), "Java must NOT equal JavaScript");
  assert.notStrictEqual(normalizeSkillName("React"), normalizeSkillName("React Native"), "React must NOT equal React Native");
  assert.notStrictEqual(normalizeSkillName("Python"), normalizeSkillName("Django"), "Python must NOT equal Django");
  assert.notStrictEqual(normalizeSkillName("Figma"), normalizeSkillName("UI/UX Design"), "Figma must NOT equal UI/UX Design");
  assert.notStrictEqual(normalizeSkillName("Frontend"), normalizeSkillName("React"), "Frontend must NOT equal React");
  assert.notStrictEqual(normalizeSkillName("Backend"), normalizeSkillName("Node.js"), "Backend must NOT equal Node.js");
  assert.notStrictEqual(normalizeSkillName("HTML"), normalizeSkillName("CSS"), "HTML must NOT equal CSS");
  assert.notStrictEqual(normalizeSkillName("MongoDB"), normalizeSkillName("SQL"), "MongoDB must NOT equal SQL");
  assert.notStrictEqual(normalizeSkillName("C"), normalizeSkillName("C++"), "C must NOT equal C++");
  assert.notStrictEqual(normalizeSkillName("C++"), normalizeSkillName("C#"), "C++ must NOT equal C#");
});

// -----------------------------------------------------------------------------
// TEST 7 — ONE-WAY ALIAS MATCH
// -----------------------------------------------------------------------------
runTest("TEST 7 — One-Way Alias Match", () => {
  const userA = {
    offering: [{ _id: "u_off_python", name: "Python", category: "Programming" }],
    learning: [{ _id: "u_learn_js", name: "JavaScript", category: "Programming" }],
  };

  const userB = {
    offering: [{ _id: "b_off_js", name: "JS", category: "Programming" }],
    learning: [{ _id: "b_learn_rust", name: "Rust", category: "Programming" }],
  };

  const match = calculateSkillCompatibility(userA, userB);
  const score = computeCompatibilityScore(match);
  const reasons = generateMatchReasons(match);

  assert.strictEqual(match.exactMatchesForYou.length, 1, "Should detect exact match for user A");
  assert.strictEqual(match.exactMatchesForThem.length, 0, "No exact match for candidate B");
  assert.strictEqual(match.mutualMatch, false, "mutualMatch must be false");
  assert.strictEqual(score, 26, "Score should be 26");
  assert.ok(score > 0, "Candidate must receive a positive score");
  assert.ok(reasons.some((r) => r.includes("offer JS")), "Reason explains they offer JS");
  assert.strictEqual(reasons.some((r) => r.includes("mutual skill match")), false, "No false mutual match reason");
});

// -----------------------------------------------------------------------------
// TEST 8 — MUTUAL ALIAS MATCH (1 ↔ 1)
// -----------------------------------------------------------------------------
runTest("TEST 8 — Mutual Two-Way Alias Match (1 ↔ 1)", () => {
  const userA = {
    offering: [{ _id: "u_off_node", name: "NodeJS", category: "Programming" }],
    learning: [{ _id: "u_learn_react", name: "React", category: "Web Development" }],
  };

  const userB = {
    offering: [{ _id: "b_off_react", name: "ReactJS", category: "Web Development" }],
    learning: [{ _id: "b_learn_node", name: "Node.js", category: "Programming" }],
  };

  const match = calculateSkillCompatibility(userA, userB);
  const score = computeCompatibilityScore(match);
  const reasons = generateMatchReasons(match);

  assert.strictEqual(match.mutualMatch, true, "Must be recognized as mutual match");
  assert.strictEqual(match.exactMatchesForYou.length, 1, "ReactJS matches React");
  assert.strictEqual(match.exactMatchesForThem.length, 1, "NodeJS matches Node.js");
  assert.strictEqual(match.exactMatchesForYou[0].name, "ReactJS", "Preserves candidate's 'ReactJS'");
  assert.strictEqual(match.exactMatchesForThem[0].name, "NodeJS", "Preserves user's 'NodeJS'");
  
  // Progressive Score: 26 (for you) + 26 (for them) + 20 (mutual bonus) = 72
  assert.strictEqual(score, 72, "Score should be 72 for 1 ↔ 1 mutual match");
  assert.ok(reasons.some((r) => r.includes("mutual skill match")), "Contains mutual exchange reason");
  assert.ok(reasons.some((r) => r.includes("offer ReactJS")), "Explains candidate offers ReactJS");
  assert.ok(reasons.some((r) => r.includes("learn NodeJS")), "Explains candidate wants NodeJS");
});

// -----------------------------------------------------------------------------
// TEST 9 — CANDIDATE VISIBILITY REGRESSION (USER 1, USER 2, USER 3 SCENARIO)
// -----------------------------------------------------------------------------
runTest("TEST 9 — Candidate Visibility Regression Scenario (User 1 vs User 2 & User 3)", () => {
  // User 1
  const user1 = {
    offering: [
      { _id: "u1_js", name: "JavaScript", category: "Programming" },
      { _id: "u1_react", name: "React", category: "Web Development" },
    ],
    learning: [
      { _id: "u1_node", name: "Node.js", category: "Programming" },
      { _id: "u1_uiux", name: "UI/UX Design", category: "Design" },
    ],
  };

  // User 2: Offers NodeJS & Python, Wants JS & ReactJS
  const user2 = {
    offering: [
      { _id: "u2_node", name: "NodeJS", category: "Programming" },
      { _id: "u2_python", name: "Python", category: "Programming" },
    ],
    learning: [
      { _id: "u2_js", name: "JS", category: "Programming" },
      { _id: "u2_react", name: "ReactJS", category: "Web Development" },
    ],
  };

  // User 3: Offers Node.js & UI UX, Wants JavaScript & Figma
  const user3 = {
    offering: [
      { _id: "u3_node", name: "Node.js", category: "Programming" },
      { _id: "u3_uiux", name: "UI UX", category: "Design" },
    ],
    learning: [
      { _id: "u3_js", name: "JavaScript", category: "Programming" },
      { _id: "u3_figma", name: "Figma", category: "Design" },
    ],
  };

  // Evaluate User 1 vs User 2
  const match1_2 = calculateSkillCompatibility(user1, user2);
  const score1_2 = computeCompatibilityScore(match1_2);

  // User 1 wants Node.js (matches User 2's NodeJS) -> 1 exact match for you (26)
  // User 2 wants JS (matches User 1's JavaScript) & ReactJS (matches User 1's React) -> 2 exact matches for them (36)
  // Mutual bonus: +20
  // Score: 26 + 36 + 20 = 82
  assert.strictEqual(match1_2.mutualMatch, true, "User 2 should be mutual match for User 1");
  assert.strictEqual(match1_2.exactMatchesForYou.length, 1, "NodeJS matches Node.js");
  assert.strictEqual(match1_2.exactMatchesForThem.length, 2, "JS and ReactJS match JavaScript and React");
  assert.strictEqual(score1_2, 82, "User 2 score should be 82 (2 ↔ 1 mutual match)");
  assert.ok(score1_2 > 0, "User 2 must be included in recommendations");

  // Evaluate User 1 vs User 3
  const match1_3 = calculateSkillCompatibility(user1, user3);
  const score1_3 = computeCompatibilityScore(match1_3);

  // User 1 wants Node.js (matches User 3's Node.js) & UI/UX Design (matches User 3's UI UX) -> 2 exact matches for you (36)
  // User 3 wants JavaScript (matches User 1's JavaScript) -> 1 exact match for them (26)
  // Figma does NOT equal UI/UX Design (safe separation)
  // Mutual bonus: +20
  // Score: 36 + 26 + 20 = 82
  assert.strictEqual(match1_3.mutualMatch, true, "User 3 should be mutual match for User 1");
  assert.strictEqual(match1_3.exactMatchesForYou.length, 2, "Node.js and UI UX match Node.js and UI/UX Design");
  assert.strictEqual(match1_3.exactMatchesForThem.length, 1, "JavaScript matches JavaScript");
  assert.strictEqual(score1_3, 82, "User 3 score should be 82 (2 ↔ 1 mutual match)");
  assert.ok(score1_3 > 0, "User 3 must be included in recommendations");

  // Ensure both candidates appear in candidate filtering (> 0 check)
  const candidateScores = [
    { name: "User 2", score: score1_2 },
    { name: "User 3", score: score1_3 },
  ];
  const visibleCandidates = candidateScores.filter((c) => c.score > 0);
  assert.strictEqual(visibleCandidates.length, 2, "Both User 2 and User 3 must appear for User 1");
});

// -----------------------------------------------------------------------------
// TEST 9B — ACTIVE OFFERS VS INACTIVE WANTS REGRESSION SCENARIO
// -----------------------------------------------------------------------------
runTest("TEST 9B — User 1 (wants Nodejs) vs User 3 (active offer Node.js, inactive wants JS/Java)", () => {
  // User 1: Active offers React, Java Script; Active wants Nodejs, UI/UX Designing
  const user1 = {
    offering: [
      { _id: "u1_react", name: "React", category: "Programming" },
      { _id: "u1_js", name: "Java Script", category: "Programming" },
    ],
    learning: [
      { _id: "u1_node", name: "Nodejs", category: "Programming" },
      { _id: "u1_uiux", name: "UI/UX Designing", category: "UI/UX Design" },
    ],
  };

  // User 3: Active offers Node.js, React.js; Inactive wants JS, Java (filtered out by status: "Active")
  const user3 = {
    offering: [
      { _id: "u3_node", name: "Node.js", category: "Music", level: "Intermediate" },
      { _id: "u3_react", name: "React.js", category: "Programming", level: "Intermediate" },
    ],
    learning: [], // Inactive wants JS & Java do not enter active learning array
  };

  const match = calculateSkillCompatibility(user1, user3);
  const score = computeCompatibilityScore(match);
  const reasons = generateMatchReasons(match);

  // Exact match: "Nodejs" normalized is "node.js", "Node.js" normalized is "node.js"
  assert.strictEqual(match.exactMatchesForYou.length, 1, "Should have 1 exact match for User 1 (Node.js)");
  assert.strictEqual(match.exactMatchesForYou[0].name, "Node.js", "Preserves candidate skill name 'Node.js'");
  assert.strictEqual(match.exactMatchesForThem.length, 0, "No exact matches for User 3 because wants are inactive");
  assert.strictEqual(match.mutualMatch, false, "mutualMatch must be false when counterpart has no matching active wants");
  assert.strictEqual(score, 26, "Score must be 26 for 1 exact match");
  assert.ok(score > 0, "User 3 must have positive compatibility score");
  assert.ok(reasons.some((r) => r.includes("They offer Node.js")), "Reason indicates candidate offers Node.js");
});

// -----------------------------------------------------------------------------
// TEST 10 — DETERMINISM & REPEATABILITY
// -----------------------------------------------------------------------------
runTest("TEST 10 — Determinism and Repeatability", () => {
  const userSkills = {
    offering: [{ _id: "u1", name: "Python", category: "Programming" }],
    learning: [{ _id: "u2", name: "TypeScript", category: "Programming" }],
  };

  const candidateSkills = {
    offering: [{ _id: "c1", name: "TS", category: "Programming" }],
    learning: [{ _id: "c2", name: "py", category: "Programming" }],
  };

  let firstScore = null;
  let firstReasons = null;

  for (let i = 0; i < 5; i++) {
    const match = calculateSkillCompatibility(userSkills, candidateSkills);
    const score = computeCompatibilityScore(match);
    const reasons = generateMatchReasons(match);

    if (i === 0) {
      firstScore = score;
      firstReasons = reasons;
    } else {
      assert.strictEqual(score, firstScore, `Iteration ${i} score mismatch`);
      assert.deepStrictEqual(reasons, firstReasons, `Iteration ${i} reasons mismatch`);
    }
  }

  assert.strictEqual(firstScore, 72, "Deterministic mutual alias score is 72 (26 + 26 + 20)");
});

// -----------------------------------------------------------------------------
// TEST 11 — SCORE BOUNDS (0 <= score <= 100)
// -----------------------------------------------------------------------------
runTest("TEST 11 — Strict Score Boundary Clamping (0 to 100)", () => {
  const scoreEmpty = computeCompatibilityScore({
    exactMatchesForYou: [],
    exactMatchesForThem: [],
    mutualMatch: false,
    relatedMatches: [],
  });
  assert.strictEqual(scoreEmpty, 0, "Empty match score is 0");

  const scoreMassive = computeCompatibilityScore({
    exactMatchesForYou: new Array(10).fill({ name: "Skill" }),
    exactMatchesForThem: new Array(10).fill({ name: "Skill" }),
    mutualMatch: true,
    relatedMatches: new Array(10).fill({ category: "Cat" }),
  });
  // 46 + 46 + 20 + 16 = 128 -> clamped to 100
  assert.strictEqual(scoreMassive, 100, "Massive match score must be strictly clamped to 100");
});

// -----------------------------------------------------------------------------
// TEST 12 — PURE COMPATIBILITY SORTING (NO REPUTATION INFLUENCE)
// -----------------------------------------------------------------------------
runTest("TEST 12 — Purely Skill-Compatibility Sorting (Zero reputation influence)", () => {
  const candidateA = {
    user: { _id: "user_a", name: "Alice", avgRating: 1.0, completedSwaps: 0 },
    compatibilityScore: 72,
    matchDetails: { mutualMatch: true, exactMatchCount: 2, relatedMatchCount: 0 },
  };

  const candidateB = {
    user: { _id: "user_b", name: "Bob", avgRating: 5.0, completedSwaps: 100 },
    compatibilityScore: 26,
    matchDetails: { mutualMatch: false, exactMatchCount: 1, relatedMatchCount: 0 },
  };

  const list = [candidateB, candidateA];

  list.sort((a, b) => {
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

  assert.strictEqual(list[0].user.name, "Alice", "Alice with higher skill compatibility must rank #1");
  assert.strictEqual(list[1].user.name, "Bob", "Bob with lower skill compatibility must rank #2");
});

// -----------------------------------------------------------------------------
// TEST 13 — DIRECTIONAL SCORE MAPPING FUNCTION
// -----------------------------------------------------------------------------
runTest("TEST 13 — getDirectionalScore Mapping Verification", () => {
  assert.strictEqual(getDirectionalScore(-1), 0, "Count <= 0 must be 0");
  assert.strictEqual(getDirectionalScore(0), 0, "Count 0 must be 0");
  assert.strictEqual(getDirectionalScore(1), 26, "Count 1 must be 26");
  assert.strictEqual(getDirectionalScore(2), 36, "Count 2 must be 36");
  assert.strictEqual(getDirectionalScore(3), 42, "Count 3 must be 42");
  assert.strictEqual(getDirectionalScore(4), 45, "Count 4 must be 45");
  assert.strictEqual(getDirectionalScore(5), 46, "Count 5 must be 46");
  assert.strictEqual(getDirectionalScore(10), 46, "Count 10 must be 46 (5 or more)");
});

// -----------------------------------------------------------------------------
// TEST 14 — PROGRESSIVE DIMINISHING RETURNS SCORING CURVE
// -----------------------------------------------------------------------------
runTest("TEST 14 — Progressive Diminishing Returns Scoring Curve Verification", () => {
  // Helper to test exact match scenarios without related matches
  const testScenario = (forYouCount, forThemCount) => {
    return computeCompatibilityScore({
      exactMatchesForYou: new Array(forYouCount).fill({ name: "Skill" }),
      exactMatchesForThem: new Array(forThemCount).fill({ name: "Skill" }),
      mutualMatch: forYouCount > 0 && forThemCount > 0,
      relatedMatches: [],
    });
  };

  // One-way matches
  assert.strictEqual(testScenario(1, 0), 26, "1 ↔ 0 match = 26%");
  assert.strictEqual(testScenario(2, 0), 36, "2 ↔ 0 match = 36%");
  assert.strictEqual(testScenario(3, 0), 42, "3 ↔ 0 match = 42%");
  assert.strictEqual(testScenario(4, 0), 45, "4 ↔ 0 match = 45%");
  assert.strictEqual(testScenario(5, 0), 46, "5 ↔ 0 match = 46%");

  // Mutual matches with progressive curve
  assert.strictEqual(testScenario(1, 1), 72, "1 ↔ 1 mutual match = 26 + 26 + 20 = 72%");
  assert.strictEqual(testScenario(2, 1), 82, "2 ↔ 1 mutual match = 36 + 26 + 20 = 82%");
  assert.strictEqual(testScenario(2, 2), 92, "2 ↔ 2 mutual match = 36 + 36 + 20 = 92%");
  assert.strictEqual(testScenario(3, 2), 98, "3 ↔ 2 mutual match = 42 + 36 + 20 = 98%");
  assert.strictEqual(testScenario(3, 3), 100, "3 ↔ 3 mutual match = 42 + 42 + 20 = 104 -> clamped to 100%");
  assert.strictEqual(testScenario(4, 4), 100, "4 ↔ 4 mutual match = 45 + 45 + 20 = 110 -> clamped to 100%");

  // Progressive order guarantees distinct ranking without premature saturation
  const s1_1 = testScenario(1, 1);
  const s2_1 = testScenario(2, 1);
  const s2_2 = testScenario(2, 2);
  const s3_2 = testScenario(3, 2);
  const s3_3 = testScenario(3, 3);

  assert.ok(s1_1 < s2_1, "2 ↔ 1 (82%) must rank strictly higher than 1 ↔ 1 (72%)");
  assert.ok(s2_1 < s2_2, "2 ↔ 2 (92%) must rank strictly higher than 2 ↔ 1 (82%)");
  assert.ok(s2_2 < s3_2, "3 ↔ 2 (98%) must rank strictly higher than 2 ↔ 2 (92%)");
  assert.ok(s3_2 <= s3_3, "3 ↔ 3 (100%) must rank at or above 3 ↔ 2 (98%)");
});

console.log("\n=================================================");
console.log(`  Test Results: ${passedCount} Passed, ${failedCount} Failed`);
console.log("=================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
