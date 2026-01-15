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
    type: "string",
    errorMessage: "Date of birth is required.",
  },
  email: {
    required: true,
    type: "string",
    pattern: /^\S+@\S+\.\S+$/,
    errorMessage: "A valid email is required.",
  },
  phone: {
    required: true,
    type: "string",
    pattern: /^[0-9]{10}$/,
    errorMessage: "A valid 10-digit phone number is required.",
  },
  currentStreet: {
    required: true,
    type: "string",
    errorMessage: "Current street is required.",
  },
  currentCity: {
    required: true,
    type: "string",
    errorMessage: "Current city is required.",
  },
  currentState: {
    required: true,
    type: "string",
    errorMessage: "Current state is required.",
  },
  currentPincode: {
    required: true,
    type: "string",
    pattern: /^[0-9]{6}$/,
    errorMessage: "A valid 6-digit pincode is required.",
  },
  permanentStreet: {
    required: true,
    type: "string",
    errorMessage: "Permanent street is required.",
  },
  permanentCity: {
    required: true,
    type: "string",
    errorMessage: "Permanent city is required.",
  },
  permanentState: {
    required: true,
    type: "string",
    errorMessage: "Permanent state is required.",
  },
  permanentPincode: {
    required: true,
    type: "string",
    pattern: /^[0-9]{6}$/,
    errorMessage: "A valid 6-digit pincode is required.",
  },
  employeeId: {
    required: true,
    type: "string",
    errorMessage: "Visitor ID is required.",
  },
  rfid: {
    required: true,
    type: "string",
    errorMessage: "RFID is required.",
  },
  role: {
    required: true,
    type: "string",
    errorMessage: "Role is required.",
  },
  status: {
    required: true,
    type: "string",
    errorMessage: "Status is required.",
  },
  location: {
    required: true,
    type: "string",
    errorMessage: "Location is required.",
  },
};

export default rules;
