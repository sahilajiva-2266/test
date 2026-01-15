const nodemailer = require("nodemailer");
const EmailTemplate = require("../models/Template.js");
const fs = require("fs");
const path = require("path");

// ===== Configure email transport =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* =========================
   HELPER FUNCTIONS
========================= */

// Build OTP HTML (used in OTP emails)
const buildOtpHtml = (otp) =>
  String(otp || "")
    .split("")
    .map((digit) => `<span class="otp-digit">${digit}</span>`)
    .join("");

// Load HTML template from filesystem (optional usage)
const loadTemplateFromFile = async (templateName) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "emailTemplate",
    templateName
  );
  return fs.readFileSync(templatePath, "utf8");
};

// Attachments based on template
const getTemplateAttachments = (templateName) => {
  if (
    templateName === "pidilitetemplate.html" ||
    templateName === "resetpassword.html" ||
    templateName === "authorization.html"
  ) {
    return [
      {
        filename: "pidilitelogo.avif",
        path: path.join(
          __dirname,
          "..",
          "emailTemplate",
          "pidilitelogo.avif"
        ),
        cid: "pidilite-logo",
        contentDisposition: "inline",
      },
    ];
  }
  return [];
};

/* =========================
   SEND EMAIL FUNCTION
========================= */
async function sendEmail(templateName, to, dynamicData = {}, options = {}) {
  try {
    let subject;
    let emailContent;
    let attachments = [];

    // 1️⃣ Try DB template first
    const template = await EmailTemplate.findOne({ name: templateName });

    if (template) {
      subject = template.subject;
      emailContent = template.body;
      if (emailContent.includes("cid:pidilite-logo")) {
        attachments = getTemplateAttachments(templateName);
      }
    } else if (options.fromFile === true) {
      // 2️⃣ Fallback to file-based template
      emailContent = await loadTemplateFromFile(templateName);
      subject = options.subject || "Notification";
      attachments = getTemplateAttachments(templateName);
    } else {
      throw new Error("Email template not found");
    }

    // 3️⃣ Normalize OTP fields and inject HTML
    if (!dynamicData.otp && dynamicData.OTP) {
      dynamicData.otp = dynamicData.OTP;
    }
    if (!dynamicData.otp_html && dynamicData.OTP_HTML) {
      dynamicData.otp_html = dynamicData.OTP_HTML;
    }
    if (dynamicData.otp && !dynamicData.otp_html) {
      dynamicData.otp_html = buildOtpHtml(dynamicData.otp);
    }

    // 4️⃣ Replace dynamic placeholders {{key}}
    for (const key in dynamicData) {
      const regex = new RegExp(`{{${key}}}`, "g");
      emailContent = emailContent.replace(regex, dynamicData[key]);
    }

    // 5️⃣ Send email
    const mailOptions = {
      from: `Pdlite Email <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailContent,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to", to);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
}

module.exports = {
  sendEmail,
};
