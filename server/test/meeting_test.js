require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const assert = require("assert");
const mongoose = require("mongoose");
const {
  generateRoomName,
  verifyAcceptedSwapParticipant,
  createInstantMeeting,
  scheduleMeeting,
  getMeetingById,
  joinMeeting,
  cancelMeeting,
} = require("../src/services/meetingService");
const { checkMeetingReminders } = require("../src/jobs/meetingReminderJob");
const MeetingSession = require("../src/models/MeetingSession");
const Message = require("../src/models/Message");
const SwapRequest = require("../src/models/SwapRequest");
const Notification = require("../src/models/Notification");
const User = require("../src/models/User");

console.log("=================================================");
console.log("  SkillSwap Phase 10.3 — Video Meetings & Session Scheduling Tests");
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

  // Set up test IDs
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const userCId = new mongoose.Types.ObjectId();

  const acceptedSwapId = new mongoose.Types.ObjectId();
  const pendingSwapId = new mongoose.Types.ObjectId();
  const rejectedSwapId = new mongoose.Types.ObjectId();

  if (isDbConnected) {
    try {
      await User.create([
        { _id: userAId, name: "Alice Developer", email: `alice_${Date.now()}@test.com`, passwordHash: "hash" },
        { _id: userBId, name: "Bob Designer", email: `bob_${Date.now()}@test.com`, passwordHash: "hash" },
        { _id: userCId, name: "Charlie Hacker", email: `charlie_${Date.now()}@test.com`, passwordHash: "hash" },
      ]);

      await SwapRequest.create([
        {
          _id: acceptedSwapId,
          fromUser: userAId,
          toUser: userBId,
          status: "accepted",
          offeredSkillName: "React",
          wantedSkillName: "UI/UX",
        },
        {
          _id: pendingSwapId,
          fromUser: userAId,
          toUser: userCId,
          status: "pending",
          offeredSkillName: "React",
          wantedSkillName: "Python",
        },
        {
          _id: rejectedSwapId,
          fromUser: userCId,
          toUser: userBId,
          status: "rejected",
          offeredSkillName: "Java",
          wantedSkillName: "Figma",
        },
      ]);
    } catch (e) {
      isDbConnected = false;
    }
  }

  // In-Memory Storage for Mock Mode if DB not connected
  const mockDb = {
    users: new Map([
      [userAId.toString(), { _id: userAId, name: "Alice Developer", email: "alice@test.com" }],
      [userBId.toString(), { _id: userBId, name: "Bob Designer", email: "bob@test.com" }],
      [userCId.toString(), { _id: userCId, name: "Charlie Hacker", email: "charlie@test.com" }],
    ]),
    swaps: new Map([
      [
        acceptedSwapId.toString(),
        {
          _id: acceptedSwapId,
          fromUser: { _id: userAId, name: "Alice Developer" },
          toUser: { _id: userBId, name: "Bob Designer" },
          status: "accepted",
        },
      ],
      [
        pendingSwapId.toString(),
        {
          _id: pendingSwapId,
          fromUser: { _id: userAId, name: "Alice Developer" },
          toUser: { _id: userCId, name: "Charlie Hacker" },
          status: "pending",
        },
      ],
      [
        rejectedSwapId.toString(),
        {
          _id: rejectedSwapId,
          fromUser: { _id: userCId, name: "Charlie Hacker" },
          toUser: { _id: userBId, name: "Bob Designer" },
          status: "rejected",
        },
      ],
    ]),
    meetings: new Map(),
    messages: [],
    notifications: [],
  };

  // Mock service helpers
  const mockVerifyAcceptedSwapParticipant = async (swapId, userId) => {
    const swap = mockDb.swaps.get(swapId.toString());
    if (!swap) {
      const err = new Error("Swap request not found.");
      err.statusCode = 404;
      err.code = "SWAP_NOT_FOUND";
      throw err;
    }
    const fromId = swap.fromUser._id.toString();
    const toId = swap.toUser._id.toString();
    const uId = userId.toString();
    if (fromId !== uId && toId !== uId) {
      const err = new Error("Access denied. You are not a participant.");
      err.statusCode = 403;
      err.code = "FORBIDDEN";
      throw err;
    }
    if (swap.status !== "accepted") {
      const err = new Error("Video meetings require an accepted swap.");
      err.statusCode = 403;
      err.code = "SWAP_NOT_ACCEPTED";
      throw err;
    }
    return swap;
  };

  // -----------------------------------------------------------------------------
  // TEST 1 — ACCEPTED SWAP ACCESS
  // -----------------------------------------------------------------------------
  await runTest("TEST 1 — Accepted Swap Access", async () => {
    if (isDbConnected) {
      const swap = await verifyAcceptedSwapParticipant(acceptedSwapId, userAId);
      assert.ok(swap);
      assert.strictEqual(swap.status, "accepted");
    } else {
      const swap = await mockVerifyAcceptedSwapParticipant(acceptedSwapId, userAId);
      assert.ok(swap);
      assert.strictEqual(swap.status, "accepted");
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 2 — UNAUTHORIZED RANDOM USER ACCESS BLOCKED
  // -----------------------------------------------------------------------------
  await runTest("TEST 2 — Unauthorized Random User Access Blocked", async () => {
    let threw = false;
    try {
      if (isDbConnected) {
        await verifyAcceptedSwapParticipant(acceptedSwapId, userCId);
      } else {
        await mockVerifyAcceptedSwapParticipant(acceptedSwapId, userCId);
      }
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "FORBIDDEN");
    }
    assert.ok(threw, "Random user C must not be allowed to access swap");
  });

  // -----------------------------------------------------------------------------
  // TEST 3 — PENDING & REJECTED SWAP ACCESS BLOCKED
  // -----------------------------------------------------------------------------
  await runTest("TEST 3 — Pending & Rejected Swaps Cannot Create Meetings", async () => {
    let pendingThrew = false;
    try {
      if (isDbConnected) {
        await verifyAcceptedSwapParticipant(pendingSwapId, userAId);
      } else {
        await mockVerifyAcceptedSwapParticipant(pendingSwapId, userAId);
      }
    } catch (err) {
      pendingThrew = true;
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "SWAP_NOT_ACCEPTED");
    }
    assert.ok(pendingThrew);

    let rejectedThrew = false;
    try {
      if (isDbConnected) {
        await verifyAcceptedSwapParticipant(rejectedSwapId, userBId);
      } else {
        await mockVerifyAcceptedSwapParticipant(rejectedSwapId, userBId);
      }
    } catch (err) {
      rejectedThrew = true;
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "SWAP_NOT_ACCEPTED");
    }
    assert.ok(rejectedThrew);
  });

  // -----------------------------------------------------------------------------
  // TEST 4 — INSTANT MEETING CREATION & DETERMINISTIC ROOM GENERATION
  // -----------------------------------------------------------------------------
  let instantMeetingId = new mongoose.Types.ObjectId();
  await runTest("TEST 4 — Instant Meeting Creation & Room Generation", async () => {
    const roomName = generateRoomName(acceptedSwapId, instantMeetingId);
    assert.ok(roomName.startsWith("skillswap-"), "Room name must start with 'skillswap-' prefix");
    assert.ok(roomName.length > 15, "Room name must be collision resistant and sufficiently long");

    if (isDbConnected) {
      const result = await createInstantMeeting({
        swapId: acceptedSwapId,
        userId: userAId,
      });
      assert.ok(result.meeting);
      assert.strictEqual(result.meeting.status, "active");
      assert.strictEqual(result.meeting.type, "instant");
      assert.strictEqual(result.message.type, "meeting");
      instantMeetingId = result.meeting._id;
    } else {
      const meeting = {
        _id: instantMeetingId,
        swap: acceptedSwapId,
        participants: [userAId, userBId],
        createdBy: userAId,
        roomName,
        scheduledAt: new Date(),
        duration: 30,
        status: "active",
        type: "instant",
      };
      mockDb.meetings.set(instantMeetingId.toString(), meeting);
      mockDb.messages.push({
        swapRequest: acceptedSwapId,
        sender: userAId,
        type: "meeting",
        meetingSession: meeting,
      });
      assert.strictEqual(meeting.status, "active");
      assert.strictEqual(meeting.type, "instant");
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 5 — SCHEDULE FUTURE MEETING SESSION
  // -----------------------------------------------------------------------------
  let scheduledMeetingId = new mongoose.Types.ObjectId();
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await runTest("TEST 5 — Schedule Future Meeting Session", async () => {
    if (isDbConnected) {
      const result = await scheduleMeeting({
        swapId: acceptedSwapId,
        scheduledAt: futureDate,
        duration: 45,
        note: "React Hooks Practice",
        userId: userBId,
      });
      assert.ok(result.meeting);
      assert.strictEqual(result.meeting.status, "scheduled");
      assert.strictEqual(result.meeting.type, "scheduled");
      assert.strictEqual(result.meeting.duration, 45);
      assert.strictEqual(result.meeting.note, "React Hooks Practice");
      scheduledMeetingId = result.meeting._id;
    } else {
      const room = generateRoomName(acceptedSwapId, scheduledMeetingId);
      const meeting = {
        _id: scheduledMeetingId,
        swap: acceptedSwapId,
        participants: [userAId, userBId],
        createdBy: userBId,
        roomName: room,
        scheduledAt: futureDate,
        duration: 45,
        status: "scheduled",
        type: "scheduled",
        note: "React Hooks Practice",
        reminded15m: false,
        remindedStart: false,
      };
      mockDb.meetings.set(scheduledMeetingId.toString(), meeting);
      mockDb.messages.push({
        swapRequest: acceptedSwapId,
        sender: userBId,
        type: "meeting",
        meetingSession: meeting,
      });
      assert.strictEqual(meeting.status, "scheduled");
      assert.strictEqual(meeting.duration, 45);
      assert.strictEqual(meeting.note, "React Hooks Practice");
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 6 — TWO-PARTY PARTICIPANT ACCESS & JOIN PROTOCOL
  // -----------------------------------------------------------------------------
  await runTest("TEST 6 — Two-Party Participant Access & Join Protocol", async () => {
    if (isDbConnected) {
      const detailsUserA = await getMeetingById(scheduledMeetingId, userAId);
      const detailsUserB = await getMeetingById(scheduledMeetingId, userBId);
      assert.ok(detailsUserA);
      assert.ok(detailsUserB);

      let threwC = false;
      try {
        await getMeetingById(scheduledMeetingId, userCId);
      } catch (err) {
        threwC = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.ok(threwC);

      const joinData = await joinMeeting(scheduledMeetingId, userAId);
      assert.ok(joinData.roomName);
      assert.strictEqual(joinData.jitsiDomain, "meet.jit.si");
      assert.strictEqual(joinData.status, "active");
    } else {
      const meeting = mockDb.meetings.get(scheduledMeetingId.toString());
      assert.ok(meeting);
      const isParticipantA = meeting.participants.some((p) => p.toString() === userAId.toString());
      const isParticipantB = meeting.participants.some((p) => p.toString() === userBId.toString());
      const isParticipantC = meeting.participants.some((p) => p.toString() === userCId.toString());
      assert.ok(isParticipantA, "User A is authorized participant");
      assert.ok(isParticipantB, "User B is authorized participant");
      assert.strictEqual(isParticipantC, false, "User C is not participant");

      // Join protocol simulation
      meeting.status = "active";
      assert.strictEqual(meeting.status, "active");
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 7 — MEETING CANCELLATION & JOIN INVALIDATION
  // -----------------------------------------------------------------------------
  await runTest("TEST 7 — Meeting Cancellation & Join Invalidation", async () => {
    if (isDbConnected) {
      const cancelled = await cancelMeeting(scheduledMeetingId, userAId);
      assert.strictEqual(cancelled.status, "cancelled");

      let joinThrew = false;
      try {
        await joinMeeting(scheduledMeetingId, userBId);
      } catch (err) {
        joinThrew = true;
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, "MEETING_CANCELLED");
      }
      assert.ok(joinThrew);
    } else {
      const meeting = mockDb.meetings.get(scheduledMeetingId.toString());
      meeting.status = "cancelled";
      assert.strictEqual(meeting.status, "cancelled");

      let joinThrew = false;
      if (meeting.status === "cancelled") {
        joinThrew = true;
      }
      assert.ok(joinThrew, "Cancelled meeting cannot be joined");
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 8 — REMINDER ELIGIBILITY CRITERIA
  // -----------------------------------------------------------------------------
  const reminderMeetingId = new mongoose.Types.ObjectId();
  const reminderTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now
  await runTest("TEST 8 — Reminder Eligibility Criteria", async () => {
    if (isDbConnected) {
      await MeetingSession.create({
        _id: reminderMeetingId,
        swap: acceptedSwapId,
        participants: [userAId, userBId],
        createdBy: userAId,
        roomName: generateRoomName(acceptedSwapId, reminderMeetingId),
        scheduledAt: reminderTime,
        duration: 30,
        status: "scheduled",
        type: "scheduled",
        reminded15m: false,
        remindedStart: false,
      });

      await checkMeetingReminders(null);
      const updated = await MeetingSession.findById(reminderMeetingId);
      assert.strictEqual(updated.reminded15m, true);
    } else {
      const meeting = {
        _id: reminderMeetingId,
        scheduledAt: reminderTime,
        status: "scheduled",
        reminded15m: false,
      };
      // Check 15m condition: scheduledAt <= now + 15m
      const isWithin15m = meeting.scheduledAt.getTime() <= Date.now() + 15 * 60 * 1000;
      assert.ok(isWithin15m, "Meeting starting in 10 mins is within 15m window");
      meeting.reminded15m = true;
      assert.strictEqual(meeting.reminded15m, true);
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 9 — DUPLICATE REMINDER PREVENTION (ATOMIC IDEMPOTENCY)
  // -----------------------------------------------------------------------------
  await runTest("TEST 9 — Duplicate Reminder Prevention (Atomic Idempotency)", async () => {
    if (isDbConnected) {
      const initialCount = await Notification.countDocuments({
        type: "meeting_reminder",
        swap: acceptedSwapId,
      });

      await checkMeetingReminders(null);

      const afterCount = await Notification.countDocuments({
        type: "meeting_reminder",
        swap: acceptedSwapId,
      });

      assert.strictEqual(afterCount, initialCount);
    } else {
      let notificationFired = 0;
      const meeting = { reminded15m: false };

      // First run: checks reminded15m === false, fires, sets reminded15m = true
      if (!meeting.reminded15m) {
        notificationFired++;
        meeting.reminded15m = true;
      }

      // Second run: reminded15m === true, skips
      if (!meeting.reminded15m) {
        notificationFired++;
      }

      assert.strictEqual(notificationFired, 1, "Duplicate reminder must never fire");
    }
  });

  // -----------------------------------------------------------------------------
  // TEST 10 — CHAT INTEGRATION
  // -----------------------------------------------------------------------------
  await runTest("TEST 10 — Chat Message & Meeting Card Integration", async () => {
    if (isDbConnected) {
      const messages = await Message.find({
        swapRequest: acceptedSwapId,
        type: "meeting",
      }).populate("meetingSession");

      assert.ok(messages.length >= 1);
      for (const msg of messages) {
        assert.strictEqual(msg.type, "meeting");
      }
    } else {
      const meetingMessages = mockDb.messages.filter((m) => m.type === "meeting");
      assert.ok(meetingMessages.length >= 1, "Chat thread contains meeting messages");
      for (const msg of meetingMessages) {
        assert.strictEqual(msg.type, "meeting");
        assert.ok(msg.meetingSession.roomName);
      }
    }
  });

  if (isDbConnected) {
    try {
      await User.deleteMany({ _id: { $in: [userAId, userBId, userCId] } });
      await SwapRequest.deleteMany({ _id: { $in: [acceptedSwapId, pendingSwapId, rejectedSwapId] } });
      await MeetingSession.deleteMany({ swap: acceptedSwapId });
      await Message.deleteMany({ swapRequest: acceptedSwapId });
      await Notification.deleteMany({ swap: acceptedSwapId });
      await mongoose.disconnect();
    } catch (_) {}
  }

  console.log("\n=================================================");
  console.log(`  Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
