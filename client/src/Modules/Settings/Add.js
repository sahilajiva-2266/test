import React, { useState } from "react";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "../Rules.js";

const AddUserForm = () => {
  const initialFormData = {
    name: "",
    contactPerson: "",
    contactPhone: "",
    gstNumber: "",
    status: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Field-level validation
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

  // Full form validation
  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Submit contractor form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("📨 Contractor Form Submit Clicked");

    const isValid = await validateForm();
    if (!isValid) {
      console.warn("❌ Validation Failed");
      setLoading(false);
      return;
    }

    try {
      // Ensure unique RFID if backend requires it
      const contractorData = {
        ...formData,
        rfid: formData.rfid || `RFID_${Date.now()}`,
      };

      console.log("📦 Submitting contractor data:", contractorData);

      const result = await API.add("contractors", contractorData);

      console.log("✅ API Response ------>:", result);

      if (result.status === true || result.success === true) {
        toast.success("✅ Contractor created successfully!");
        setFormData(initialFormData);
      } else {
        toast.error(result.message || "❌ Failed to create contractor.");
      }
    } catch (error) {
      console.error("❌ Error creating contractor:", error);
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
                Add New Contractor
              </h2>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Company Name */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("name")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Company Name <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Contact Person */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "contactPerson"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Contact Person <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Contact Phone */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "contactPhone"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
              </div>

              {/* GST Number */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "gstNumber"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">GST Number</label>
              </div>


                 {/* <div className="AJ-floating-label-wrapper mb-6">
                 <input
                   type="text"
                   name="rfid"
                   value={formData.rfid}
                   onChange={handleChange}
                   onBlur={handleBlur}
                   className={`${getFieldClassName("rfid")} AJ-floating-input`}
                   placeholder=" "
                 />
                 <label className="AJ-floating-label">RFID</label>
               </div> */}

              {/* Status */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "status"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <label className="AJ-floating-label">Status</label>
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
