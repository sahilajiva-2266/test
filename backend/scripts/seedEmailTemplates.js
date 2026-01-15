const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const EmailTemplate = require("../models/Template");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const TEMPLATE_DIR = path.join(__dirname, "..", "emailTemplate");

const templates = [
  {
    name: "pidilitetemplate.html",
    file: "pidilitetemplate.html",
    subject: "Pidilite Device Verification OTP",
  },
  {
    name: "resetpassword.html",
    file: "resetpassword.html",
    subject: "Pidilite Password Reset OTP",
  },
  {
    name: "authorization.html",
    file: "authorization.html",
    subject: "Pidilite Authorization Notice",
  },
];

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Missing MONGO_URI in environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  for (const tpl of templates) {
    const html = fs.readFileSync(path.join(TEMPLATE_DIR, tpl.file), "utf8");
    const body = html;
    await EmailTemplate.updateOne(
      { name: tpl.name },
      { name: tpl.name, subject: tpl.subject, body },
      { upsert: true }
    );
    console.log(`Seeded template: ${tpl.name}`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
