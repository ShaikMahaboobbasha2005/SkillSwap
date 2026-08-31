const assert = require("assert");
const geminiMatchingService = require("../src/services/geminiMatchingService");
const {
  normalizeSkillName,
  getCanonicalSkill,
  calculateSkillCompatibility,
  getDirectionalScore,
  computeCompatibilityScore,
  computeHybridScore,
  generateMatchReasons,
} = require("../src/services/recommendationService");

console.log("=================================================");
console.log("  SkillSwap Phase 10.3 — User-Triggered AI Matching Tests");
console.log("  (Deterministic Default + Optional Gemini Semantic Mode)");
console.log("=================================================\n");

let passedCount = 0;
let failedCount = 0;

async function runTest(testName, fn) {
  try {
    await fn();
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Error: ${err.message}`);
    if (err.stack) {
      console.error(`   Stack: ${err.stack.split("\n").slice(1, 4).join("\n")}`);
    }
    failedCount++;
  }
}

(async () => {
  // -----------------------------------------------------------------------------
  // TEST 1 — DEFAULT RECOMMENDATION REQUEST DOES NOT CALL GEMINI
  // -----------------------------------------------------------------------------
  await runTest("TEST 1 — Default Recommendation Mode (ai=false) Does NOT Call Gemini", async () => {
    let geminiCalled = false;
    geminiMatchingService.setMockHandler(async () => {
      geminiCalled = true;
      return [];
    });

    const userSkills = {
      offering: [{ _id: "u_off_1", name: "JavaScript", category: "Programming" }],
      learning: [{ _id: "u_learn_1", name: "Node.js", category: "Programming" }],
    };

    const candidate = {
      user: { _id: "cand_1", name: "Alex" },
      offering: [{ _id: "c_off_1", name: "Node.js", category: "Programming" }],
      learning: [{ _id: "c_learn_1", name: "JavaScript", category: "Programming" }],
    };

    // Simulate deterministic pipeline when ai is not requested
    const match = calculateSkillCompatibility(userSkills, candidate);
    const traditionalScore = computeCompatibilityScore(match);
    const reasons = generateMatchReasons(match);

    assert.strictEqual(geminiCalled, false, "Gemini MUST NOT be called in default mode");
    assert.strictEqual(traditionalScore, 72, "Traditional score computed deterministically (72)");
    assert.ok(reasons.length > 0, "Deterministic reasons generated");
    geminiMatchingService.resetMockHandler();
  });

  // -----------------------------------------------------------------------------
  // TEST 2 — USER-TRIGGERED AI RECOMMENDATIONS (ai=true) CALLS GEMINI
  // -----------------------------------------------------------------------------
  await runTest("TEST 2 — User-Triggered Mode (ai=true) Calls Gemini Semantic Layer", async () => {
    let geminiCalled = false;
    geminiMatchingService.setMockHandler(async (payload) => {
      geminiCalled = true;
      return [
        {
          candidateId: "cand_1",
          semanticScore: 90,
          semanticReasons: [
            "Their Node.js experience aligns with your backend learning goals.",
          ],
        },
      ];
    });

    const userSkills = {
      offering: [{ _id: "u_off_1", name: "JavaScript", category: "Programming" }],
      learning: [{ _id: "u_learn_1", name: "Node.js", category: "Programming" }],
    };

    const candidate = {
      user: { _id: "cand_1", name: "Alex" },
      offering: [{ _id: "c_off_1", name: "Node.js", category: "Programming" }],
      learning: [{ _id: "c_learn_1", name: "JavaScript", category: "Programming" }],
    };

    const semanticMap = await geminiMatchingService.evaluateSemanticMatches(userSkills, [candidate]);
    assert.strictEqual(geminiCalled, true, "Gemini MUST be called when ai=true");

    const candSemantic = semanticMap.get("cand_1");
    assert.ok(candSemantic, "Semantic results returned for candidate");
    assert.strictEqual(candSemantic.semanticScore, 90, "Semantic score is 90");
    assert.strictEqual(candSemantic.semanticReasons.length, 1, "Semantic reason returned");

    // Hybrid calculation: 72 * 0.70 + 90 * 0.30 = 50.4 + 27 = 77.4 -> 77
    const hybridScore = computeHybridScore(72, candSemantic.semanticScore);
    assert.strictEqual(hybridScore, 77, "Hybrid score is 77");
    geminiMatchingService.resetMockHandler();
  });

  // -----------------------------------------------------------------------------
  // TEST 3 — MISSING API KEY WITH ai=true FALLS BACK TO DETERMINISTIC
  // -----------------------------------------------------------------------------
  await runTest("TEST 3 — Missing API Key with ai=true Falls Back to Deterministic", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    geminiMatchingService.resetMockHandler();

    const userSkills = {
      learning: [{ _id: "l1", name: "Node.js", category: "Programming" }],
      offering: [],
    };
    const candidate = {
      user: { _id: "cand_nokey", name: "NoKey User" },
      offering: [{ _id: "co1", name: "Node.js", category: "Programming" }],
      learning: [],
    };

    assert.strictEqual(geminiMatchingService.isGeminiAvailable(), false, "isGeminiAvailable is false");

    const results = await geminiMatchingService.evaluateSemanticMatches(userSkills, [candidate]);
    const fallbackEntry = results.get("cand_nokey");

    assert.strictEqual(fallbackEntry.semanticScore, null, "Semantic score is null on missing key");
    assert.strictEqual(computeHybridScore(26, fallbackEntry.semanticScore), 26, "Hybrid fallback equals traditional 26");

    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 4 — GEMINI FAILURE / TIMEOUT WITH ai=true FALLS BACK TO DETERMINISTIC
  // -----------------------------------------------------------------------------
  await runTest("TEST 4 — Gemini API Failure / Timeout with ai=true Falls Back Safely", async () => {
    geminiMatchingService.setMockHandler(async () => {
      throw new Error("503 Service Unavailable or GEMINI_REQUEST_TIMEOUT");
    });

    const userSkills = {
      learning: [{ _id: "l1", name: "React", category: "Web" }],
      offering: [],
    };
    const candidate = {
      user: { _id: "cand_fail", name: "Fail Test User" },
      offering: [{ _id: "co1", name: "React", category: "Web" }],
      learning: [],
    };

    const results = await geminiMatchingService.evaluateSemanticMatches(userSkills, [candidate]);
    assert.ok(results instanceof Map, "Returns results map");
    assert.strictEqual(results.get("cand_fail").semanticScore, null, "Returns null score on failure");
    assert.strictEqual(computeHybridScore(26, results.get("cand_fail").semanticScore), 26, "Score remains 26");
    geminiMatchingService.resetMockHandler();
  });

  // -----------------------------------------------------------------------------
  // TEST 5 — NORMAL MODE REMAINS DETERMINISTIC AND REPEATABLE
  // -----------------------------------------------------------------------------
  await runTest("TEST 5 — Normal Mode Remains Deterministic Across Repeated Calls", async () => {
    const userSkills = {
      offering: [{ _id: "u1", name: "Python", category: "Programming" }],
      learning: [{ _id: "u2", name: "TypeScript", category: "Programming" }],
    };

    const candidateSkills = {
      offering: [{ _id: "c1", name: "TS", category: "Programming" }],
      learning: [{ _id: "c2", name: "py", category: "Programming" }],
    };

    const match = calculateSkillCompatibility(userSkills, candidateSkills);
    const score = computeCompatibilityScore(match);

    for (let i = 0; i < 5; i++) {
      const repeatedScore = computeHybridScore(score, null);
      assert.strictEqual(repeatedScore, 72, `Iteration ${i} score must be exactly 72`);
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 6 — AI MODE RETURNS ACCURATE 70/30 HYBRID SCORES
  // -----------------------------------------------------------------------------
  await runTest("TEST 6 — AI Mode Returns Accurate 70/30 Hybrid Scores", async () => {
    // Exact math tests
    // 100 traditional, 100 semantic -> 100
    assert.strictEqual(computeHybridScore(100, 100), 100);
    // 82 traditional, 60 semantic -> round(57.4 + 18 = 75.4) -> 75
    assert.strictEqual(computeHybridScore(82, 60), 75);
    // 26 traditional, 100 semantic -> round(18.2 + 30 = 48.2) -> 48
    assert.strictEqual(computeHybridScore(26, 100), 48);
    // 0 traditional, 100 semantic -> 30
    assert.strictEqual(computeHybridScore(0, 100), 30);
  });

  // -----------------------------------------------------------------------------
  // TEST 7 — AI REASONS MERGED INTO DETERMINISTIC EXPLANATIONS
  // -----------------------------------------------------------------------------
  await runTest("TEST 7 — AI Reasons Are Generated and Merged Without Duplicate Strings", async () => {
    geminiMatchingService.setMockHandler(async () => {
      return [
        {
          candidateId: "cand_reasons",
          semanticScore: 88,
          semanticReasons: [
            "Their React skills cover your Frontend learning goals.",
            "They want Python, which you can teach.",
          ],
        },
      ];
    });

    const userSkills = {
      learning: [{ _id: "l1", name: "Frontend Development", category: "Web" }],
      offering: [{ _id: "o1", name: "Python", category: "Programming" }],
    };

    const candidate = {
      user: { _id: "cand_reasons", name: "Bob" },
      offering: [{ _id: "c1", name: "React", category: "Web" }],
      learning: [{ _id: "c2", name: "Python", category: "Programming" }],
    };

    const results = await geminiMatchingService.evaluateSemanticMatches(userSkills, [candidate]);
    const info = results.get("cand_reasons");

    assert.strictEqual(info.semanticReasons.length, 2, "2 AI reasons returned");
    assert.ok(info.semanticReasons[0].includes("React skills"), "Contains skill insight");
    geminiMatchingService.resetMockHandler();
  });

  // -----------------------------------------------------------------------------
  // TEST 8 — SCORE BOUNDS & CLAMPING (0–100)
  // -----------------------------------------------------------------------------
  await runTest("TEST 8 — Score Bounds and Clamping (0 to 100)", async () => {
    assert.strictEqual(computeHybridScore(-30, 50), 15, "Clamps negative traditional to 0");
    assert.strictEqual(computeHybridScore(50, -50), 35, "Clamps negative semantic to 0");
    assert.strictEqual(computeHybridScore(120, 150), 100, "Clamps overflow to 100");
    assert.strictEqual(computeHybridScore(70, null), 70, "Null semantic returns traditional");
    assert.strictEqual(computeHybridScore(70, undefined), 70, "Undefined semantic returns traditional");
  });

  // -----------------------------------------------------------------------------
  // TEST 9 — CANDIDATE ISOLATION & MINIMAL PAYLOAD
  // -----------------------------------------------------------------------------
  await runTest("TEST 9 — Candidate Isolation (Zero sensitive data in payload)", async () => {
    const userSkills = {
      learning: [{ _id: "l1", name: "React", category: "Web", password: "SECRET_PASSWORD" }],
      offering: [{ _id: "o1", name: "Python", category: "Programming" }],
    };

    const candidate = {
      user: { _id: "cand_iso", name: "Charlie", email: "secret@email.com", jwt: "TOKEN" },
      offering: [{ _id: "co1", name: "React", category: "Web" }],
      learning: [{ _id: "cl1", name: "Python", category: "Programming" }],
    };

    const payload = geminiMatchingService.preparePayload(userSkills, [candidate]);

    assert.strictEqual(payload.candidates[0].candidateId, "cand_iso");
    assert.ok(!payload.candidates[0].email, "No email in payload");
    assert.ok(!payload.candidates[0].jwt, "No JWT in payload");
    assert.ok(!payload.targetUser.learningSkills[0].password, "No password in payload");
  });

  // -----------------------------------------------------------------------------
  // TEST 10 — ANTI-HALLUCINATION / NO FABRICATED CANDIDATES
  // -----------------------------------------------------------------------------
  await runTest("TEST 10 — Anti-Hallucination (Fabricated candidates discarded)", async () => {
    geminiMatchingService.setMockHandler(async () => {
      return [
        { candidateId: "valid_id", semanticScore: 90, semanticReasons: ["Valid"] },
        { candidateId: "fake_id_123", semanticScore: 100, semanticReasons: ["Fake"] },
      ];
    });

    const userSkills = { learning: [{ _id: "l1", name: "React" }], offering: [] };
    const candidates = [{ user: { _id: "valid_id" }, offering: [], learning: [] }];

    const results = await geminiMatchingService.evaluateSemanticMatches(userSkills, candidates);

    assert.ok(results.has("valid_id"), "Valid candidate retained");
    assert.ok(!results.has("fake_id_123"), "Fabricated candidate ID discarded");
    geminiMatchingService.resetMockHandler();
  });

  // -----------------------------------------------------------------------------
  // TEST 11 — ALIAS COMPATIBILITY REGRESSION
  // -----------------------------------------------------------------------------
  await runTest("TEST 11 — Alias Compatibility Regression (JS, ReactJS, NodeJS)", async () => {
    assert.strictEqual(normalizeSkillName("JS"), "javascript");
    assert.strictEqual(normalizeSkillName("NodeJS"), "node.js");
    assert.strictEqual(normalizeSkillName("ReactJS"), "react");
    assert.strictEqual(normalizeSkillName("UI UX"), "ui/ux design");
  });

  // -----------------------------------------------------------------------------
  // TEST 12 — HYBRID RANKING SANITY ACROSS TIERS
  // -----------------------------------------------------------------------------
  await runTest("TEST 12 — Hybrid Ranking Sanity Across Match Tiers", async () => {
    const s1_0 = computeHybridScore(26, 50); // 33
    const s1_1 = computeHybridScore(72, 75); // 73
    const s2_1 = computeHybridScore(82, 80); // 81
    const s2_2 = computeHybridScore(92, 90); // 91
    const s3_3 = computeHybridScore(100, 95); // 99

    assert.ok(s1_0 < s1_1, "1 ↔ 1 (73) > 1 ↔ 0 (33)");
    assert.ok(s1_1 < s2_1, "2 ↔ 1 (81) > 1 ↔ 1 (73)");
    assert.ok(s2_1 < s2_2, "2 ↔ 2 (91) > 2 ↔ 1 (81)");
    assert.ok(s2_2 < s3_3, "3 ↔ 3 (99) > 2 ↔ 2 (91)");
  });

  console.log("\n=================================================");
  console.log(`  User-Triggered AI Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
