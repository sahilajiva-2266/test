class Validator {
  constructor(rules = {}) {
    this.rules = rules; // Store the validation rules
  }

  // Validate if the value is not empty
  isNotEmpty(value) {
    return value && value.trim().length > 0;
  }

  // Validate if the value matches the expected type
  isValidType(value, type) {
    if (type === "string") return typeof value === "string";
    if (type === "number") return typeof value === "number";
    if (type === "boolean") return typeof value === "boolean";
    if (type === "array") return Array.isArray(value);
    if (type === "object") return typeof value === "object" && value !== null;
    return true;
  }

  // Validate the entire data object based on rules
  async validate(data) {
    const errors = {};

    for (const [key, rule] of Object.entries(this.rules)) {
      const value = data[key];

      // Check if the field is required and not empty
      if (rule.required && !this.isNotEmpty(value)) {
        errors[key] = rule.errorMessage || `${key} is required.`;
      }

      // Check if the value matches the required type
      if (rule.type && !this.isValidType(value, rule.type)) {
        errors[key] =
          rule.errorMessage || `${key} must be of type ${rule.type}.`;
      }
    }

    return errors; // Return errors object
  }

  // Validate a single form field asynchronously
  async validateFormField(name, value) {
    if (!this.rules[name]) {
      return {}; // No validation rule for the field
    }
    const fieldRule = { [name]: this.rules[name] };
    const fieldData = { [name]: value };
    const validationErrors = await this.validate(fieldData);
    return validationErrors;
  }
}

export default Validator;
