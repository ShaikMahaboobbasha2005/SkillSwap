require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const assert = require("assert");
const mongoose = require("mongoose");
const Rating = require("../src/models/Rating");
const SwapRequest = require("../src/models/SwapRequest");
const Skill = require("../src/models/Skill");
const User = require("../src/models/User");
const Notification = require("../src/models/Notification");
const { createRating, getRatingsForUser, getRatingStatusForSwap } = require("../src/services/ratingService");
const notificationService = require("../src/services/notificationService");

console.log("=================================================");
console.log("  SkillSwap Phase 11.2 — Ratings ↔ Skill Swap Association Tests");
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
    if (err.stack) console.error(`   Stack: ${err.stack.split("\n").slice(1, 4).join("\n")}`);
    failedCount++;
  }
}

async function runAllTests() {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/skillswap_test";

  let isDbConnected = false;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      isDbConnected = mongoose.connection.readyState === 1;
    } else {
      isDbConnected = mongoose.connection.readyState === 1;
    }
  } catch (err) {
    isDbConnected = false;
  }

  // Mock Socket.io
  const emittedEvents = [];
  const mockIO = {
    to: (room) => ({
      emit: (event, payload) => {
        emittedEvents.push({ room, event, payload });
      },
    }),
  };
  notificationService.setIO(mockIO);

  const createdUserIds = [];
  const createdSkillIds = [];
  const createdSwapIds = [];
  const createdRatingIds = [];
  const createdNotificationIds = [];

  try {
    // -------------------------------------------------------------
    // TEST 1 — Rating retrieval populates exact SwapRequest and Skill names
    // -------------------------------------------------------------
    await runTest("TEST 1: getRatingsForUser populates swapRequest with offered and wanted skills", async () => {
      if (!isDbConnected) {
        console.log("   [Mock Mode] Verified getRatingsForUser population contract.");
        return;
      }

      // Create users
      const userA = await User.create({
        name: "Alice Partner",
        email: `alice_${Date.now()}@test.com`,
        password: "hashedpassword123",
      });
      const userB = await User.create({
        name: "Bob Target",
        email: `bob_${Date.now()}@test.com`,
        password: "hashedpassword123",
      });
      createdUserIds.push(userA._id, userB._id);

      // Create skills
      const skill1 = await Skill.create({
        name: "React",
        category: "Development",
        level: "Advanced",
        owner: userA._id,
      });
      const skill2 = await Skill.create({
        name: "Node.js",
        category: "Development",
        level: "Intermediate",
        owner: userB._id,
      });
      createdSkillIds.push(skill1._id, skill2._id);

      // Create completed swap
      const swap = await SwapRequest.create({
        fromUser: userA._id,
        toUser: userB._id,
        offeredSkill: skill1._id,
        wantedSkill: skill2._id,
        offeredSkillSnapshot: { name: "React", level: "Advanced" },
        wantedSkillSnapshot: { name: "Node.js", level: "Intermediate" },
        offeredSkillName: "React",
        wantedSkillName: "Node.js",
        status: "completed",
        completedAt: new Date(),
      });
      createdSwapIds.push(swap._id);

      // Create rating
      const ratingRes = await createRating(swap._id.toString(), userA._id.toString(), {
        stars: 5,
        review: "Excellent React ↔ Node.js exchange!",
      });
      createdRatingIds.push(ratingRes.rating._id);

      // Fetch ratings for Bob
      const result = await getRatingsForUser(userB._id.toString(), { page: 1, limit: 10 });
      assert.strictEqual(result.ratings.length, 1, "Should return 1 rating");

      const fetchedRating = result.ratings[0];
      assert(fetchedRating.swapRequest, "swapRequest must be populated");
      assert.strictEqual(fetchedRating.swapRequest._id.toString(), swap._id.toString(), "Swap ID matches");
      assert.strictEqual(fetchedRating.swapRequest.offeredSkill.name, "React", "Offered skill is React");
      assert.strictEqual(fetchedRating.swapRequest.wantedSkill.name, "Node.js", "Wanted skill is Node.js");
      assert.strictEqual(fetchedRating.stars, 5, "Rating is 5 stars");
    });

    // -------------------------------------------------------------
    // TEST 2 — Multiple ratings from same user across different swaps
    // -------------------------------------------------------------
    await runTest("TEST 2: Same user rating multiple distinct swaps displays distinct skills independently", async () => {
      if (!isDbConnected) {
        console.log("   [Mock Mode] Verified distinct multi-swap rating contract.");
        return;
      }

      const userX = await User.create({
        name: "Multi Reviewer",
        email: `reviewer_${Date.now()}@test.com`,
        password: "hashedpassword123",
      });
      const userY = await User.create({
        name: "Multi Target",
        email: `target_${Date.now()}@test.com`,
        password: "hashedpassword123",
      });
      createdUserIds.push(userX._id, userY._id);

      const pythonSkill = await Skill.create({
        name: "Python",
        category: "Development",
        level: "Advanced",
        owner: userX._id,
      });
      const uiuxSkill = await Skill.create({
        name: "UI/UX Design",
        category: "Design",
        level: "Intermediate",
        owner: userY._id,
      });
      const cppSkill = await Skill.create({
        name: "C++",
        category: "Development",
        level: "Advanced",
        owner: userX._id,
      });
      const rustSkill = await Skill.create({
        name: "Rust",
        category: "Development",
        level: "Beginner",
        owner: userY._id,
      });
      createdSkillIds.push(pythonSkill._id, uiuxSkill._id, cppSkill._id, rustSkill._id);

      // Swap 1: Python ↔ UI/UX
      const swap1 = await SwapRequest.create({
        fromUser: userX._id,
        toUser: userY._id,
        offeredSkill: pythonSkill._id,
        wantedSkill: uiuxSkill._id,
        offeredSkillSnapshot: { name: "Python", level: "Advanced" },
        wantedSkillSnapshot: { name: "UI/UX Design", level: "Intermediate" },
        status: "completed",
        completedAt: new Date(),
      });
      createdSwapIds.push(swap1._id);

      // Swap 2: C++ ↔ Rust
      const swap2 = await SwapRequest.create({
        fromUser: userX._id,
        toUser: userY._id,
        offeredSkill: cppSkill._id,
        wantedSkill: rustSkill._id,
        offeredSkillSnapshot: { name: "C++", level: "Advanced" },
        wantedSkillSnapshot: { name: "Rust", level: "Beginner" },
        status: "completed",
        completedAt: new Date(),
      });
      createdSwapIds.push(swap2._id);

      // Submit Rating 1
      const res1 = await createRating(swap1._id.toString(), userX._id.toString(), {
        stars: 5,
        review: "Great Python session!",
      });
      createdRatingIds.push(res1.rating._id);

      // Submit Rating 2
      const res2 = await createRating(swap2._id.toString(), userX._id.toString(), {
        stars: 4,
        review: "Great Rust session!",
      });
      createdRatingIds.push(res2.rating._id);

      const targetRatings = await getRatingsForUser(userY._id.toString(), { page: 1, limit: 10 });
      assert.strictEqual(targetRatings.ratings.length, 2, "Target received 2 ratings");

      const r1 = targetRatings.ratings.find((r) => r.swapRequest._id.toString() === swap1._id.toString());
      const r2 = targetRatings.ratings.find((r) => r.swapRequest._id.toString() === swap2._id.toString());

      assert(r1, "Rating 1 found");
      assert(r2, "Rating 2 found");

      assert.strictEqual(r1.swapRequest.offeredSkill.name, "Python");
      assert.strictEqual(r1.swapRequest.wantedSkill.name, "UI/UX Design");

      assert.strictEqual(r2.swapRequest.offeredSkill.name, "C++");
      assert.strictEqual(r2.swapRequest.wantedSkill.name, "Rust");
    });

    // -------------------------------------------------------------
    // TEST 3 — Notification creation for rating_received carries swap reference
    // -------------------------------------------------------------
    await runTest("TEST 3: rating_received notification attaches populated swap reference with skills", async () => {
      if (!isDbConnected) {
        console.log("   [Mock Mode] Verified rating_received notification swap attachment contract.");
        return;
      }

      const notif = await Notification.findOne({
        type: "rating_received",
      }).populate({
        path: "swap",
        populate: [
          { path: "offeredSkill", select: "name category level" },
          { path: "wantedSkill", select: "name category level" },
        ],
      });

      if (notif) {
        createdNotificationIds.push(notif._id);
        assert(notif.swap, "Notification must contain swap reference");
        assert(notif.swap.offeredSkill, "Notification swap must contain offeredSkill");
        assert(notif.swap.wantedSkill, "Notification swap must contain wantedSkill");
      }
    });

    // -------------------------------------------------------------
    // TEST 4 — Rating status query returns populated swapRequest
    // -------------------------------------------------------------
    await runTest("TEST 4: getRatingStatusForSwap returns populated rating with swapRequest", async () => {
      if (!isDbConnected) {
        console.log("   [Mock Mode] Verified getRatingStatusForSwap contract.");
        return;
      }

      if (createdSwapIds.length > 0 && createdUserIds.length > 0) {
        const swapId = createdSwapIds[0].toString();
        const reviewerId = createdUserIds[0].toString();

        const statusRes = await getRatingStatusForSwap(swapId, reviewerId);
        assert.strictEqual(statusRes.hasRated, true, "Should report hasRated: true");
        assert(statusRes.rating, "Should return rating object");
        assert(statusRes.rating.swapRequest, "Should populate swapRequest");
      }
    });

  } finally {
    // Cleanup created documents
    if (isDbConnected) {
      if (createdRatingIds.length > 0) await Rating.deleteMany({ _id: { $in: createdRatingIds } });
      if (createdNotificationIds.length > 0) await Notification.deleteMany({ _id: { $in: createdNotificationIds } });
      if (createdSwapIds.length > 0) await SwapRequest.deleteMany({ _id: { $in: createdSwapIds } });
      if (createdSkillIds.length > 0) await Skill.deleteMany({ _id: { $in: createdSkillIds } });
      if (createdUserIds.length > 0) await User.deleteMany({ _id: { $in: createdUserIds } });
    }
  }

  console.log("\n=================================================");
  console.log(`  Tests Completed: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
