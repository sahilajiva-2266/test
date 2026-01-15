import React, { useState } from "react";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../helpers/api.js";
import Validator from "../../helpers/validators.js";
import rules from "./Rules.js";

const Permissions = () => {
  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    first_name: false,
    email: false,
    phone: false,
    password: false,
    role: false,
  });
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate input field on blur
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  // Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting data:", formData);
      const result = await API.createuser(formData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("User created successfully!");
        setFormData(initialFormData); // Reset form
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        "An error occurred while creating the user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get field class name based on error state
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            className="w-full max-w-lg mx-auto mt-8"
            onSubmit={handleSubmit}
          >
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Add New User
              </h2>
            </div>

            {/* First Name */}
            <div className="first-left form-item">
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("first_name")}
              />
              <label>
                First Name <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Last Name */}
            <div className="first-left form-item">
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("last_name")}
              />
              <label>Last Name</label>
            </div>

            {/* Email */}
            <div className="first-left form-item">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("email")}
              />
              <label>
                Email <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Phone */}
            <div className="first-left form-item">
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("phone")}
              />
              <label>
                Phone Number <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Password */}
            <div className="first-left form-item">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("password")}
              />
              <label>
                Password <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Role */}
            <div className="select-option-dropdown first-left form-item">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("role")}
              >
                <option value="" disabled></option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
              <span className="dropdown-icon">▼</span>
              <label className={formData.role ? "selected" : ""}>
                Role <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Status */}
            <div className="select-option-dropdown first-left form-item">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("status")}
              >
                <option value="" disabled></option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
                <option value="Blocked">Blocked</option>
                <option value="Trash">Trash</option>
              </select>
              <span className="dropdown-icon">▼</span>
              <label className={formData.status ? "selected" : ""}>
                Status <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex">
              <button
                type="submit"
                className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
