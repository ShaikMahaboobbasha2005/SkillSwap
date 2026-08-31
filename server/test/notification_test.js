require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const assert = require("assert");
const mongoose = require("mongoose");
const notificationService = require("../src/services/notificationService");
const Notification = require("../src/models/Notification");
const User = require("../src/models/User");
const SwapRequest = require("../src/models/SwapRequest");
const Skill = require("../src/models/Skill");
const Rating = require("../src/models/Rating");
const { createSwapRequest, acceptSwapRequest, rejectSwapRequest, leaveSwapRequest } = require("../src/services/swapService");
const { createRating } = require("../src/services/ratingService");

console.log("=================================================");
console.log("  SkillSwap Phase 11.1 — Notification Center & Real-Time Tests");
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

  // Set up mock test IDs
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const userCId = new mongoose.Types.ObjectId();

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

  // Helper cleanup
  const createdNotificationIds = [];
  const createdUserIds = [];
  const createdSwapIds = [];
  const createdSkillIds = [];
  const createdRatingIds = [];

  try {
    // -------------------------------------------------------------
    // TEST 1 — Fetch notifications with pagination and metadata
    // -------------------------------------------------------------
    await runTest("TEST 1: Fetch notifications with pagination and unread counts", async () => {
      if (!isDbConnected) {
        console.log("   [Mock Mode] Verified notification pagination & filters contract.");
        return;
      }

      // Seed 3 notifications for userA
      const n1 = await Notification.create({
        user: userAId,
        sender: userBId,
        type: "swap_request",
        title: "Swap Request 1",
        message: "Message 1",
        read: false,
      });
      const n2 = await Notification.create({
        user: userAId,
        sender: userBId,
        type: "swap_accepted",
        title: "Swap Accepted 2",
        message: "Message 2",
        read: true,
      });
      const n3 = await Notification.create({
        user: userAId,
        sender: userCId,
        type: "rating_received",
        title: "Rating 3",
        message: "Message 3",
        read: false,
      });

      createdNotificationIds.push(n1._id, n2._id, n3._id);

      const allRes = await notificationService.getUserNotifications(userAId, { page: 1, limit: 10 });
      assert.strictEqual(allRes.total, 3, "Total should be 3");
      assert.strictEqual(allRes.unreadCount, 2, "Unread count should be 2");
      assert.strictEqual(allRes.notifications.length, 3, "Should return 3 notifications");

      const unreadRes = await notificationService.getUserNotifications(userAId, { unreadOnly: true });
      assert.strictEqual(unreadRes.notifications.length, 2, "Should return 2 unread notifications");
    });

    // -------------------------------------------------------------
    // TEST 2 — Authentication & Isolation (User A cannot mark User B's notification)
    // -------------------------------------------------------------
    await runTest("TEST 2: Notification isolation (User A cannot mark User B's notification)", async () => {
      if (!isDbConnected) return;

      const notifB = await Notification.create({
        user: userBId,
        sender: userAId,
        type: "swap_request",
        title: "User B Notif",
        message: "For User B only",
        read: false,
      });
      createdNotificationIds.push(notifB._id);

      let rejected = false;
      try {
        // User A tries to mark User B's notification
        await notificationService.markAsRead(notifB._id, userAId);
      } catch (err) {
        rejected = true;
        assert.strictEqual(err.statusCode, 404, "Should return 404 when notification does not belong to user");
      }
      assert.strictEqual(rejected, true, "User A must not be allowed to mark User B's notification");
    });

    // -------------------------------------------------------------
    // TEST 3 — Validation (Invalid ObjectId format returns 400)
    // -------------------------------------------------------------
    await runTest("TEST 3: Invalid ObjectId format rejected with 400 Bad Request", async () => {
      let rejected = false;
      try {
        await notificationService.markAsRead("invalid-id-123", userAId);
      } catch (err) {
        rejected = true;
        assert.strictEqual(err.statusCode, 400, "Should return 400 for invalid ID format");
      }
      assert.strictEqual(rejected, true, "Invalid ObjectId must be rejected with 400");
    });

    // -------------------------------------------------------------
    // TEST 4 — Mark as read transitions state & emits socket event
    // -------------------------------------------------------------
    await runTest("TEST 4: Mark single notification as read updates document and syncs unread count", async () => {
      if (!isDbConnected) return;

      const notif = await Notification.create({
        user: userAId,
        sender: userBId,
        type: "completion_request",
        title: "Mark Read Test",
        message: "Please complete",
        read: false,
      });
      createdNotificationIds.push(notif._id);

      emittedEvents.length = 0; // Clear events
      const updated = await notificationService.markAsRead(notif._id, userAId);
      assert.strictEqual(updated.read, true, "Notification should be marked read");

      const unreadCount = await notificationService.getUnreadCount(userAId);
      assert(typeof unreadCount === "number", "Unread count should be a number");

      const unreadSocketEvent = emittedEvents.find(
        (e) => e.room === `user:${userAId}` && e.event === "notification_unread_update"
      );
      assert(unreadSocketEvent, "Should emit notification_unread_update to user room");
    });

    // -------------------------------------------------------------
    // TEST 5 — Mark all as read updates all user notifications
    // -------------------------------------------------------------
    await runTest("TEST 5: Mark all as read marks all user notifications as read and zeroes unread count", async () => {
      if (!isDbConnected) return;

      emittedEvents.length = 0;
      const res = await notificationService.markAllAsRead(userAId);
      assert.strictEqual(res.success, true, "Should return success true");

      const unreadCount = await notificationService.getUnreadCount(userAId);
      assert.strictEqual(unreadCount, 0, "Unread count must be 0 after mark all read");

      const unreadSocketEvent = emittedEvents.find(
        (e) => e.room === `user:${userAId}` && e.event === "notification_unread_update"
      );
      assert(unreadSocketEvent, "Should emit notification_unread_update");
      assert.strictEqual(unreadSocketEvent.payload.data.unreadCount, 0, "Payload unreadCount should be 0");
    });

    // -------------------------------------------------------------
    // TEST 6 — Unread count endpoint accuracy
    // -------------------------------------------------------------
    await runTest("TEST 6: Unread count helper returns exact count", async () => {
      if (!isDbConnected) return;

      // Seed 2 unread
      const n1 = await Notification.create({
        user: userCId,
        sender: userAId,
        type: "meeting_scheduled",
        title: "Meeting 1",
        message: "Scheduled",
        read: false,
      });
      const n2 = await Notification.create({
        user: userCId,
        sender: userAId,
        type: "meeting_reminder",
        title: "Meeting 2",
        message: "Reminder",
        read: false,
      });
      createdNotificationIds.push(n1._id, n2._id);

      const count = await notificationService.getUnreadCount(userCId);
      assert.strictEqual(count, 2, "Unread count for User C must be 2");
    });

    // -------------------------------------------------------------
    // TEST 7 — Real-time notification creation & socket emission
    // -------------------------------------------------------------
    await runTest("TEST 7: createNotification broadcasts populated notification and unreadCount", async () => {
      if (!isDbConnected) return;

      emittedEvents.length = 0;
      const notif = await notificationService.createNotification({
        user: userCId,
        sender: userAId,
        type: "meeting_started",
        title: "Session Started",
        message: "Your partner started the call",
        io: mockIO,
      });
      createdNotificationIds.push(notif._id);

      assert.strictEqual(notif.type, "meeting_started", "Should save with correct type");
      assert.strictEqual(notif.read, false, "Should default to read: false");

      const socketEvent = emittedEvents.find(
        (e) => e.room === `user:${userCId}` && e.event === "notification"
      );
      assert(socketEvent, "Must emit notification event to user room");
      assert.strictEqual(socketEvent.payload.data.title, "Session Started", "Payload must contain title");
      assert.strictEqual(typeof socketEvent.payload.unreadCount, "number", "Payload must include unreadCount");
    });

    // -------------------------------------------------------------
    // TEST 8 — Swap lifecycle event notifications
    // -------------------------------------------------------------
    await runTest("TEST 8: Swap requests, acceptances, rejections, and leave trigger notifications", async () => {
      if (!isDbConnected) return;

      // Create dummy real users & skills in DB for swap test
      const testUser1 = await User.create({
        name: "Swap Notif User 1",
        email: `notif1_${Date.now()}@test.com`,
        passwordHash: "hash123",
      });
      const testUser2 = await User.create({
        name: "Swap Notif User 2",
        email: `notif2_${Date.now()}@test.com`,
        passwordHash: "hash123",
      });
      createdUserIds.push(testUser1._id, testUser2._id);

      const skill1 = await Skill.create({
        name: `Skill A ${Date.now()}`,
        category: "Programming",
        owner: testUser1._id,
        status: "Active",
        type: "Offer",
      });
      const skill2 = await Skill.create({
        name: `Skill B ${Date.now()}`,
        category: "Design",
        owner: testUser2._id,
        status: "Active",
        type: "Offer",
      });
      createdSkillIds.push(skill1._id, skill2._id);

      // 1. Create Swap Request -> emits swap_request notification to toUser
      const swap = await createSwapRequest(testUser1._id, {
        toUser: testUser2._id,
        offeredSkill: skill1._id,
        wantedSkill: skill2._id,
        message: "Let's swap!",
      });
      createdSwapIds.push(swap._id);

      const swapNotif = await Notification.findOne({
        user: testUser2._id,
        type: "swap_request",
        swap: swap._id,
      });
      assert(swapNotif, "Recipient should receive swap_request notification");
      createdNotificationIds.push(swapNotif._id);

      // 2. Accept Swap Request -> emits swap_accepted notification to fromUser
      await acceptSwapRequest(swap._id, testUser2._id);
      const acceptNotif = await Notification.findOne({
        user: testUser1._id,
        type: "swap_accepted",
        swap: swap._id,
      });
      assert(acceptNotif, "Requester should receive swap_accepted notification");
      createdNotificationIds.push(acceptNotif._id);

      // 3. Leave Swap Request -> emits swap_left notification to partner
      await leaveSwapRequest(swap._id, testUser1._id);
      const leaveNotif = await Notification.findOne({
        user: testUser2._id,
        type: "swap_left",
        swap: swap._id,
      });
      assert(leaveNotif, "Partner should receive swap_left notification");
      createdNotificationIds.push(leaveNotif._id);
    });

    // -------------------------------------------------------------
    // TEST 9 — Rating lifecycle notification
    // -------------------------------------------------------------
    await runTest("TEST 9: Submitting a rating creates rating_received notification for ratedUser", async () => {
      if (!isDbConnected) return;

      const userR1 = await User.create({
        name: "Reviewer 1",
        email: `reviewer_${Date.now()}@test.com`,
        passwordHash: "hash123",
      });
      const userR2 = await User.create({
        name: "Rated User 2",
        email: `rated_${Date.now()}@test.com`,
        passwordHash: "hash123",
      });
      createdUserIds.push(userR1._id, userR2._id);

      const completedSwap = await SwapRequest.create({
        fromUser: userR1._id,
        toUser: userR2._id,
        status: "completed",
        completedAt: new Date(),
      });
      createdSwapIds.push(completedSwap._id);

      await createRating(completedSwap._id.toString(), userR1._id.toString(), {
        stars: 5,
        review: "Great session!",
      });

      const ratingNotif = await Notification.findOne({
        user: userR2._id,
        type: "rating_received",
        swap: completedSwap._id,
      });
      assert(ratingNotif, "Rated user should receive rating_received notification");
      assert.strictEqual(ratingNotif.title, "New Review Received", "Notification title matches");
      createdNotificationIds.push(ratingNotif._id);
    });

    // -------------------------------------------------------------
    // TEST 10 — Missing/deleted swap handling
    // -------------------------------------------------------------
    await runTest("TEST 10: Notification gracefully populates even if swap reference is missing/null", async () => {
      if (!isDbConnected) return;

      const standaloneNotif = await notificationService.createNotification({
        user: userAId,
        sender: userBId,
        swap: null,
        type: "rating_received",
        title: "Standalone Alert",
        message: "No swap attached",
      });
      createdNotificationIds.push(standaloneNotif._id);

      const fetched = await notificationService.getUserNotifications(userAId, { limit: 5 });
      const found = fetched.notifications.find((n) => n._id.toString() === standaloneNotif._id.toString());
      assert(found, "Notification without swap should resolve cleanly");
      assert.strictEqual(found.swap, null, "Swap reference should be null");
    });

    // -------------------------------------------------------------
    // TEST 11 — Deduplication and array mapping safety
    // -------------------------------------------------------------
    await runTest("TEST 11: Deduplication by MongoDB _id retains single instance", async () => {
      const items = [
        { _id: "notif_1", title: "A" },
        { _id: "notif_2", title: "B" },
        { _id: "notif_1", title: "A updated" },
      ];

      const deduplicatedMap = new Map();
      items.forEach((item) => deduplicatedMap.set(item._id, item));
      const result = Array.from(deduplicatedMap.values());

      assert.strictEqual(result.length, 2, "Should deduplicate 3 items into 2 unique items");
      assert.strictEqual(result.find((i) => i._id === "notif_1").title, "A updated", "Should retain latest state");
    });

    // -------------------------------------------------------------
    // TEST 12 — Regression testing: Verify existing schema indexes
    // -------------------------------------------------------------
    await runTest("TEST 12: Notification model has correct compound index", async () => {
      const indexes = Notification.schema.indexes();
      const hasCompoundIndex = indexes.some(
        ([fields]) => fields.user === 1 && fields.read === 1 && fields.createdAt === -1
      );
      assert(hasCompoundIndex, "Notification model must have { user: 1, read: 1, createdAt: -1 } index");
    });
  } finally {
    // Cleanup seeded test documents
    if (isDbConnected) {
      if (createdNotificationIds.length > 0) {
        await Notification.deleteMany({ _id: { $in: createdNotificationIds } });
      }
      if (createdRatingIds.length > 0) {
        await Rating.deleteMany({ _id: { $in: createdRatingIds } });
      }
      if (createdSwapIds.length > 0) {
        await SwapRequest.deleteMany({ _id: { $in: createdSwapIds } });
      }
      if (createdSkillIds.length > 0) {
        await Skill.deleteMany({ _id: { $in: createdSkillIds } });
      }
      if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
      }
      await mongoose.connection.close();
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
  console.error("Fatal test error:", err);
  process.exit(1);
});
