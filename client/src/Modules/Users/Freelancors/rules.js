const rules = {
  first_name: {
    required: true,
    type: "string",
    errorMessage: "First name is required.",
  },
  last_name: {
    required: true,
    type: "string",
    errorMessage: "Last name is required.",
  },
  dateOfBirth: {
    required: true,
    type: "string", // or "date" depending on your validator handling
    errorMessage: "Date of birth is required.",
  },
  gender: {
    required: true,
    type: "string",
    allowedValues: ["male", "female", "other"],
    errorMessage: "Gender is required.",
  },
  middleName: {
    required: true,
    type: "string",
    errorMessage: "Middle name is required.",
  },
  bg: {
    required: true,
    type: "string",
    allowedValues: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    errorMessage: "A valid blood group is required.",
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
    errorMessage: "A valid 10digit phone number is required.",
  },
  address: {
    required: true,
    type: "string",
    errorMessage: "Address is required.",
  },
};

export default rules;
