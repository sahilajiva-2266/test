import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Validator from "../../../Helpers/validators.js";
import { putData } from "../../../Helpers/api.js";
import rules from "../Rules.js";

const EditUserForm = ({ contractor }) => {
  const navigate = useNavigate();
  const validator = new Validator(rules);

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

  // ✅ Prefill contractor data
  useEffect(() => {
    if (contractor) {
      setFormData({
        name: contractor.name || "",
        contactPerson: contractor.contactPerson || "",
        contactPhone: contractor.contactPhone || "",
        gstNumber: contractor.gstNumber || "",
        status: contractor.status || "",
      });
    }
  }, [contractor]);

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
    errors[fieldName] ? "field-error AJ-floating-input" : "AJ-floating-input";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = `/contractors/${contractor?._id}`;
      const response = await putData(endpoint, formData);

      if (response.status === 200 || response.success === true) {
        toast.success("✅ Contractor updated successfully!");
        navigate("/dashboard/contractors");
      } else {
        toast.error(response.message || "❌ Failed to update contractor.");
      }
    } catch (error) {
      console.error("❌ Error updating contractor:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
            Edit Contractor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Company Name */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("name")}
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
                className={getFieldClassName("contactPerson")}
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
                className={getFieldClassName("contactPhone")}
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
                className={getFieldClassName("gstNumber")}
                placeholder=" "
              />
              <label className="AJ-floating-label">GST Number</label>
            </div>

            {/* Status */}
            <div className="AJ-floating-label-wrapper mb-6">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("status")}
              >
                <option value="" disabled hidden></option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <label className="AJ-floating-label">Status</label>
            </div>
          </div>

          {/* Submit */}
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

export default EditUserForm;
