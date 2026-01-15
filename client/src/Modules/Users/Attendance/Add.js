import React, { useState, useEffect } from "react";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "../Rules.js";

const AddUserForm = () => {
  const initialFormData = {
  contractorId: "",
  rfidCardId: "",
  sectionAssigned: "",
  date: "",
  entryGateIn: "",
  workfloorIn: "",
  workfloorOut: "",
  exitGateOut: "",
  remarks: ""
};

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]); // New state for businesses
  const validator = new Validator(rules);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "business") {
      const selectedBusiness = businesses.find((b) => b.name === value);
      setFormData((prev) => ({
        ...prev,
        business: value,
        business_types: selectedBusiness?.business_type || "", // Change to business type name
        tenant_id: selectedBusiness?.id || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  console.log("📨 Form Submit Clicked");

  const isValid = await validateForm();
  // if (!isValid) {
  //   console.warn("❌ Validation Failed");
  //   setLoading(false);
  //   return;
  // }
  try {
    console.log("📦 Submitting attendance data:", formData);

    // ✅ Call attendance add endpoint
    const result = await API.add("attendance/add", formData);

    console.log("✅ API Response ------>:", result);

    if (result.status === true || result.success === true) {
      toast.success("✅ Attendance record created successfully!");
      setFormData(initialFormData);
    } else {
      toast.error(result.message || "❌ Failed to create attendance record.");
    }
  } catch (error) {
    console.error("❌ Error creating attendance record:", error);
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
                Add New Attendance
              </h2>
            </div>

            {/* FORM GRID: 2 columns on medium+ screens */}
{/* FORM GRID: 2 columns on medium+ screens */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

  {/* Contractor ID */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="text"
      name="contractorId"
      value={formData.contractorId}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("contractorId")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Contractor ID</label>
  </div>

  {/* RFID Card */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="text"
      name="rfidCardId"
      value={formData.rfidCardId}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("rfidCardId")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">RFID Card</label>
  </div>

  {/* Section Assigned */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="text"
      name="sectionAssigned"
      value={formData.sectionAssigned}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("sectionAssigned")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Section Assigned</label>
  </div>

  {/* Date */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="date"
      name="date"
      value={formData.date}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("date")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Date</label>
  </div>

  {/* Entry Gate In */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="datetime-local"
      name="entryGateIn"
      value={formData.entryGateIn}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("entryGateIn")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Entry Gate In</label>
  </div>

  {/* Workfloor In */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="datetime-local"
      name="workfloorIn"
      value={formData.workfloorIn}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("workfloorIn")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Workfloor In</label>
  </div>

  {/* Workfloor Out */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="datetime-local"
      name="workfloorOut"
      value={formData.workfloorOut}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("workfloorOut")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Workfloor Out</label>
  </div>

  {/* Exit Gate Out */}
  <div className="AJ-floating-label-wrapper mb-6">
    <input
      type="datetime-local"
      name="exitGateOut"
      value={formData.exitGateOut}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("exitGateOut")} AJ-floating-input`}
      placeholder=" "
    />
    <label className="AJ-floating-label">Exit Gate Out</label>
  </div>

  {/* Remarks */}
  <div className="AJ-floating-label-wrapper mb-6 col-span-2">
    <textarea
      name="remarks"
      value={formData.remarks}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${getFieldClassName("remarks")} AJ-floating-input`}
      placeholder=" "
      rows="3"
    />
    <label className="AJ-floating-label">Remarks</label>
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
