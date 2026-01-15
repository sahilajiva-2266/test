const rules = {
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
  gender: {
    required: true,
    type: "string",
    allowedValues: ["male", "female", "other"],
    errorMessage: "Gender must be male, female, or other.",
  },
  dob: {
    required: true,
    type: "string", // or "date"
    errorMessage: "Date of birth is required.",
  },
  email: {
    required: true,
    type: "string",
    pattern: /^\S+@\S+\.\S+$/,
    errorMessage: "A valid email is required.",
  },
  currentaddress: {
    required: true,
    type: "string",
    errorMessage: "Current address is required.",
  },
  permanentaddress: {
    required: true,
    type: "string",
    errorMessage: "Permanent address is required.",
  },
  state: {
    required: true,
    type: "string",
    errorMessage: "State is required.",
  },
  city: {
    required: true,
    type: "string",
    errorMessage: "City is required.",
  },
  pincode: {
    required: true,
    type: "string",
    pattern: /^[0-9]{6}$/,
    errorMessage: "A valid 6-digit pincode is required.",
  },
  phone: {
    required: true,
    type: "string",
    pattern: /^[0-9]{10}$/,
    errorMessage: "A valid 10-digit phone number is required.",
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
  shift: {
    required: true,
    type: "string",
    allowedValues: ["morning", "evening", "night"], // adjust if needed
    errorMessage: "Shift must be morning, evening, or night.",
  },
  department: {
    required: true,
    type: "string",
    errorMessage: "Department is required.",
  },
  section: {
    required: true,
    type: "string",
    errorMessage: "Section is required.",
  },
  rfid: {
    required: true,
    type: "string",
    errorMessage: "RFID is required.",
  },
  aadharcardnumber: {
    required: true,
    type: "string",
    pattern: /^[0-9]{12}$/,
    errorMessage: "A valid 12-digit Aadhaar number is required.",
  },
  pancard: {
    required: true,
    type: "string",
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    errorMessage: "A valid PAN card number is required (e.g., ABCDE1234F).",
  },
  accountNumber: {
    required: true,
    type: "string",
    pattern: /^[0-9]{9,18}$/,
    errorMessage: "A valid bank account number is required.",
  },
  ifscCode: {
    required: true,
    type: "string",
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    errorMessage: "A valid IFSC code is required (e.g., SBIN0123456).",
  },
};