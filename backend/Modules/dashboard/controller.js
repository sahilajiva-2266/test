const Contractor = require("../contractors/model");
const Employee = require("../employees/model");
const Section = require("../sections/model");
const Attendance = require("../attendance/model");
const Visitor = require("../user/visitorModel");

// Dashboard summary counts for cards
exports.getSummary = async (_req, res) => {
  try {
    const [contractors, employees, visitors, managers, departments, monthlyReports] =
      await Promise.all([
        Contractor.countDocuments({}),
        Employee.countDocuments({}),
        Visitor.countDocuments({}),
        Employee.countDocuments({ role: "manager" }),
        Section.countDocuments({}),
        Attendance.countDocuments({}), // treating attendance entries as monthly reports
      ]);

    return res.status(200).json({
      status: true,
      data: {
        contractors,
        employees,
        visitors,
        managers,
        departments,
        monthlyReports,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
