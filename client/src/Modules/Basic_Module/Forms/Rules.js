const rules = {
  label: {
    required: true,
    message: "Label is required",
    minLength: 3,
    maxLength: 100,
  },
  name: {
    required: true,
    message: "Name is required",
    minLength: 3,
    maxLength: 100,
  },
  description: {
    required: true,
    message: "Description is required",
  },

  required: {
    required: false,
    message: "Field is required",
  },
  status: {
    required: false,
    message: "Status must be either 'active' or 'inactive'",
    validStatuses: ["active", "inactive"],
  },
};

export default rules;
