import React, { useState, useEffect } from "react";
import {toast} from "react-toastify";
import { getData, putData } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "./Rules.js";
import "react-toastify/dist/ReactToastify.css";

const EditRoleForm = ({ role }) => {
  const roleId = role;

  const [formData, setFormData] = useState({
    name: "",
    hierarchy: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validator = new Validator(rules);

  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) {
        console.warn("No role ID provided.");
        return;
      }

      console.log("Fetching role for ID:", roleId);
      setLoading(true);

      try {
        const res = await getData(`/role/${roleId}`);
        console.log("API response:", res);

        if (res?.data) {
          const fetchedData = {
            name: res.data.name || "",
            hierarchy: res.data.hierarchy || "",
            status: res.data.status || "active",
          };

          setFormData(fetchedData);
          console.log("Form data populated:", fetchedData);
        } else {
          console.warn("No data received in response.");
        }
      } catch (err) {
        console.error("Error fetching role data:", err);
        toast.error("Error fetching role.");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId]);

  const validateFormField = async (name, value) => {
    const fieldRule = { [name]: rules[name] };
    const fieldData = { [name]: value };
    const validationErrors = await validator.validate(fieldData, fieldRule);
    return validationErrors;
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validateFormField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "aj-field-error" : "aj-field";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await putData(`/role/${roleId}`, formData);
      if (res.status) {
        setSuccess(true);
        toast.success("Role updated successfully!");
      } else {
        setSuccess(false);
        toast.error("Failed to update role.");
      }
    } catch (err) {
      setSuccess(false);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="AJ-adduser-form-section">
        <form className="w-full max-w-lg mx-auto mt-8" onSubmit={handleSubmit}>
          <h2 className="AJ-text-xl AJ-font-semibold mb-6 AJ-text-gray-800">
            Edit Role
          </h2>

          {/* Name */}
          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              placeholder=" "
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("name")} AJ-floating-input`}
            />
            <label className="AJ-floating-label">
              Name <span className="AJ-text-red-500">*</span>
            </label>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Hierarchy */}
          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              placeholder=" "
              name="hierarchy"
              value={formData.hierarchy}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("hierarchy")} AJ-floating-input`}
            />
            <label className="AJ-floating-label">
              Hierarchy <span className="AJ-text-red-500">*</span>
            </label>
            {errors.hierarchy && (
              <p className="text-red-500 text-sm mt-1">{errors.hierarchy}</p>
            )}
          </div>

          {/* Status */}
          <div className="AJ-floating-label-wrapper">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("status")} AJ-floating-input`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disabled">Disabled</option>
            </select>
            <label className={formData.status ? "AJ-selected" : ""}>
              Status <span className="AJ-text-red-500">*</span>
            </label>
          </div>

          {/* Submit */}
          <div className="AJ-flex AJ-justify-between">
            <button
              type="submit"
              className="AJ-upclick AJ-px-4 AJ-mt-5 AJ-py-2 AJ-text-white AJ-text-sm AJ-font-medium AJ-rounded-md AJ-hover:bg-blue-700 AJ-focus:outline-none AJ-focus:ring-2 AJ-focus:ring-blue-500 AJ-focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="AJ-loader-wrapper">
          <div className="AJ-loader"></div>
        </div>
      )}
    </div>
  );
};

export default EditRoleForm;
