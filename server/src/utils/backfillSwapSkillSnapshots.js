const SwapRequest = require("../models/SwapRequest");
const Skill = require("../models/Skill");

/**
 * Utility to backfill offeredSkillName, offeredSkillLevel, wantedSkillName, wantedSkillLevel
 * on legacy SwapRequest documents where snapshots are missing.
 */
const backfillSwapSkillSnapshots = async () => {
  try {
    const swaps = await SwapRequest.find({
      $or: [
        { offeredSkillName: { $in: ["", null] } },
        { wantedSkillName: { $in: ["", null] } },
      ],
    });

    if (swaps.length === 0) return;

    console.log(`[Backfill] Found ${swaps.length} swap requests needing snapshot backfill...`);

    for (const swap of swaps) {
      const updates = {};

      if (!swap.offeredSkillName && swap.offeredSkill) {
        const offered = await Skill.findById(swap.offeredSkill);
        if (offered) {
          updates.offeredSkillName = offered.name || "";
          updates.offeredSkillLevel = offered.level || "";
        }
      }

      if (!swap.wantedSkillName && swap.wantedSkill) {
        const wanted = await Skill.findById(swap.wantedSkill);
        if (wanted) {
          updates.wantedSkillName = wanted.name || "";
          updates.wantedSkillLevel = wanted.level || "";
        }
      }

      if (Object.keys(updates).length > 0) {
        await SwapRequest.findByIdAndUpdate(swap._id, { $set: updates });
      }
    }

    console.log("[Backfill] Completed swap request skill snapshot backfill.");
  } catch (err) {
    console.error("[Backfill] Error backfilling swap skill snapshots:", err.message);
  }
};

module.exports = backfillSwapSkillSnapshots;
