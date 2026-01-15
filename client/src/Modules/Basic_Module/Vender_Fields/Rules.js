const rules = {
  label: {
    required: true,
    message: "Label is required",
    minLength: 3,
    maxLength: 100,
  },
  placeholder: {
    required: false,
    message: "Placeholder is required",
    minLength: 0,
    maxLength: 150,
  },
  options: {
    required: (field) =>
      ["select", "multiselect", "radio", "checkbox"].includes(field.type),
    message:
      "Options are required for select, multiselect, radio, or checkbox fields",
    minLength: 3,
    maxLength: 500,
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
  type: {
    required: true,
    message: "Type is required",
    validTypes: [
      "text",
      "textarea",
      "select",
      "multiselect",
      "radio",
      "checkbox",
      "attachment",
    ],
  },
  maxFileSize: {
    required: (field) => field.type === "attachment",
    message: "Max file size must be specified for attachment fields",
    maxSize: 1024,
  },
  allowedFileTypes: {
    required: (field) => field.type === "attachment",
    message: "Allowed file types must be specified for attachment fields",
    validFileTypes: ["jpg", "jpeg", "png"],
  },
};

export default rules;
