const path = require("path");
const mongoose = require("mongoose");
const Enquiry = require("../Modules/enquiry/model");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI;

const USERS = [
  {
    userId: "694be4f7093f59a1177eee3a",
    employeeId: "EMP003",
    name: "b singh",
  },
  {
    userId: "694d4888d1faa76e79ff4053",
    employeeId: "EMP007",
    name: "Anmol Admin",
  },
  {
    userId: "694e232c74b3e5d52b8f3388",
    employeeId: "EMP009",
    name: "John Kumar",
  },
  {
    userId: "6957b801d5c526102e5fe5db",
    employeeId: "123",
    name: "abc",
  },
];

const buildMessage = (name, employeeId) =>
  `Hello Team, I want camera access for my device. Reason: I need to capture ` +
  `worksite images for daily reporting and compliance checks. Please allow ` +
  `temporary access and let me know if any additional approvals are required. ` +
  `Requested by ${name} (${employeeId}).`;

const run = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI missing in environment");
  }

  await mongoose.connect(MONGO_URI);

  const docs = USERS.map((user) => ({
    userId: user.userId,
    employeeId: user.employeeId,
    message: buildMessage(user.name, user.employeeId),
  }));

  await Enquiry.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} enquiries`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
