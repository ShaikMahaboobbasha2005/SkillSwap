const mongoose = require("mongoose");
const dns = require("node:dns");

// Force Google DNS servers for SRV lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const migrateSkillStatus = require("../utils/migrateSkillStatus");
const backfillSwapSkillSnapshots = require("../utils/backfillSwapSkillSnapshots");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Atlas Connected");
    await migrateSkillStatus();
    await backfillSwapSkillSnapshots();
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;