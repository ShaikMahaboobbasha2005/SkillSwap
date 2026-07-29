const Skill = require("../models/Skill");

/**
 * Migration helper to ensure database records strictly use the status model ("Active" / "Inactive").
 * Converts legacy visibility / status values ("Public" -> "Active", "Private" -> "Inactive")
 * and unsets the legacy `visibility` field.
 */
const migrateSkillStatus = async () => {
  try {
    const rawCollection = Skill.collection;

    // 1. Convert Public -> Active
    await rawCollection.updateMany(
      { $or: [{ visibility: "Public" }, { status: "Public" }] },
      { $set: { status: "Active" }, $unset: { visibility: "" } }
    );

    // 2. Convert Private -> Inactive
    await rawCollection.updateMany(
      { $or: [{ visibility: "Private" }, { status: "Private" }] },
      { $set: { status: "Inactive" }, $unset: { visibility: "" } }
    );

    // 3. Unset any remaining visibility field
    await rawCollection.updateMany(
      { visibility: { $exists: true } },
      { $unset: { visibility: "" } }
    );

    // 4. Ensure any document missing status receives default "Active"
    await rawCollection.updateMany(
      { status: { $exists: false } },
      { $set: { status: "Active" } }
    );

    console.log("✓ Skill status database migration completed successfully.");
  } catch (error) {
    console.error("Error migrating skill status database records:", error);
  }
};

module.exports = migrateSkillStatus;
