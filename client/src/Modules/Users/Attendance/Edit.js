import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Validator from "../../../Helpers/validators.js";
import { putData } from "../../../Helpers/api.js";
import rules from "../Rules.js";

const EditAttendanceForm = ({ attendance }) => {
  const navigate = useNavigate();
  const validator = new Validator(rules);

  const initialFormData = {
    contractorId: "",
    rfidCardId: "",
    sectionAssigned: "",
    date: "",
    status: "Present",        // ✅ ADD
    entryGateIn: "",
    workfloorIn: "",
    workfloorOut: "",
    exitGateOut: "",
    remarks: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);


  // ✅ Prefill attendance data
  useEffect(() => {
    if (attendance) {
      setFormData({
        contractorId: attendance.contractorId || "",
        rfidCardId: attendance.rfidCardId || "",
        sectionAssigned: attendance.sectionAssigned || "",
        date: attendance.date ? attendance.date.split("T")[0] : "",
        status: attendance.status || "Present",   // ✅ ADD
        entryGateIn: attendance.entryGateIn || "",
        workfloorIn: attendance.workfloorIn || "",
        workfloorOut: attendance.workfloorOut || "",
        exitGateOut: attendance.exitGateOut || "",
        remarks: attendance.remarks || "",
      });
    }
  }, [attendance]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const fieldErrors = await validator.validate({ [name]: value }, { [name]: rules[name] });
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "aj-field-error AJ-floating-input" : "AJ-floating-input";


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔹 handleSubmit triggered");
    setLoading(true);

    try {
      console.log("🔹 Using userId:", selectedUserId);

      if (!selectedUserId) {
        toast.error("❌ Missing userId.");
        console.error("❌ No userId found in state.");
        return;
      }

      const endpoint = `/api/attendance/${selectedUserId}`;
      console.log("🔹 API endpoint being called:", endpoint);
      console.log("🔹 Form data being sent:", formData);

      const response = await putData(endpoint, formData);

      // If putData returns raw response.json(), "status" won’t exist
      console.log("🔹 API parsed response:", response);

      if (response?.success || response?.status === 200) {
        toast.success("✅ Attendance updated successfully!");
        // navigate("/dashboard/attendance");
      } else {
        toast.error(response?.message || "❌ Failed to update attendance.");
      }
    } catch (error) {
      console.error("❌ Error updating attendance:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      console.log("🔹 Loading set to false");
    }
  };




  return (
    <div className="edituser-outer-section">
      <div className="edituser-inner-section">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-5xl mx-auto mt-8 bg-white"
          noValidate
        >
          <h2 className="text-lg font-semibold mb-6 text-gray-800">
            Edit Attendance
          </h2>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            {/* Contractor ID */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="contractorId"
                value={formData.contractorId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("contractorId")}
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
                className={getFieldClassName("rfidCardId")}
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
                className={getFieldClassName("sectionAssigned")}
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
                className={getFieldClassName("date")}
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
                className={getFieldClassName("entryGateIn")}
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
                className={getFieldClassName("workfloorIn")}
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
                className={getFieldClassName("workfloorOut")}
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
                className={getFieldClassName("exitGateOut")}
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
                className={getFieldClassName("remarks")}
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
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default EditAttendanceForm;
