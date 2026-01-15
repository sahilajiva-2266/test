import React, { useState } from "react";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "../Rules.js";

const AddUserForm = () => {
  const initialFormData = {
    uid: "",
    employeeId: "",
    issuedAt: "",
    isActive: "",
    lostOrReplaced: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const isValid = await validateForm();
  if (!isValid) {
    setLoading(false);
    return;
  }

  try {
    console.log("📦 Submitting RFID data:", formData);

    // ✅ Corrected API endpoint
    const result = await API.add("rfid", formData);

    console.log("✅ API Response:", result);

    if (result.status === true || result.success === true) {
      toast.success("✅ RFID created successfully!");
      setFormData(initialFormData);
      
    } else {
      toast.error(result.message || "❌ Failed to create RFID.");
    }
  } catch (error) {
    console.error("❌ Error creating RFID:", error);
    toast.error("An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  return (
    <div className="adduser-outer-section">
      <div className="adduser-inner-section">
        <div className="adduser-form-section">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-5xl mx-auto mt-8 bg-white"
            noValidate
          >
            <div>
              <h2 className="text-lg font-semibold mb-6 text-gray-800">
                Add New RFID
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* UID */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="uid"
                  value={formData.uid}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("uid")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  UID <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Employee ID */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("employeeId")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Employee ID</label>
              </div>

              {/* Issued At */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="date"
                  name="issuedAt"
                  value={formData.issuedAt}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("issuedAt")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Issued At</label>
              </div>

              {/* Active Status */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("isActive")} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <label className="AJ-floating-label">Active Status</label>
              </div>

              {/* Lost or Replaced */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="lostOrReplaced"
                  value={formData.lostOrReplaced}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("lostOrReplaced")} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <label className="AJ-floating-label">Lost / Replaced</label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="AJ-crm-save w-full md:col-span-2 mt-6">
              <button
                type="submit"
                className="button-section w-full md:w-auto rounded"
                disabled={loading}
              >
                {loading ? "Creating..." : "Submit"}
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

export default AddUserForm;
