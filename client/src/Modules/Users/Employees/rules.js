const rules = {
  employeeId: {
    required: true,
    type: "string",
    errorMessage: "Employee ID is required.",
  },
  firstName: {
    required: true,
    type: "string",
    errorMessage: "First name is required.",
  },
  lastName: {
    required: true,
    type: "string",
    errorMessage: "Last name is required.",
  },
  email: {
    required: true,
    type: "string",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "A valid email address is required.",
  },
  phone: {
    required: true,
    type: "string",
    pattern: /^[0-9]{10}$/,
    errorMessage: "A valid 10-digit phone number is required.",
  },
  gender: {
    required: true,
    type: "string",
    allowedValues: ["male", "female", "other"],
    errorMessage: "Gender must be 'male', 'female', or 'other'.",
  },
  address: {
    required: true,
    type: "string",
    errorMessage: "Address is required.",
  },
  dob: {
    required: false, // Not marked as required in schema
    type: "string", // You can use "date" if your validator supports it
    errorMessage: "Date of birth must be a valid date.",
  },
  joiningDate: {
    required: true,
    type: "string", // or "date"
    errorMessage: "Joining date is required.",
  },
  designation: {
    required: true,
    type: "string",
    errorMessage: "Designation is required.",
  },
  section: {
    required: true,
    type: "string",
    errorMessage: "Section is required.",
  },
  shift: {
    required: false,
    type: "string",
    allowedValues: ["Morning", "Evening", "Night"],
    errorMessage: "Shift must be one of: Morning, Evening, Night.",
  },
  contractorId: {
    required: false,
    type: "string", // Assuming you're validating ObjectId as string
    errorMessage: "Contractor ID must be a valid ID.",
  },
  rfid: {
    required: true,
    type: "string",
    errorMessage: "RFID is required.",
  },
  status: {
    required: false,
    type: "string",
    allowedValues: ["active", "inactive"],
    errorMessage: "Status must be either 'active' or 'inactive'.",
  },
  userId: {
    required: true,
    type: "string", // Assuming ObjectId as string
    errorMessage: "User ID is required.",
  },
};

export default rules;
