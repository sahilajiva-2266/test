import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import Validator from "../../../Helpers/validators.js";
import { getData, putData } from "../../../Helpers/api.js";
import rules from "./Rules.js";

const EditUserForm = ({ user, rowIndex }) => {
  let fieldid = user?._id;

  console.log("fieldid--->", fieldid);
  console.log("field_records", user);

  const [formData, setFormData] = useState({
    label: "",
    key: "",
    groupName: "",
    type: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const validator = new Validator(rules);

  useEffect(() => {
    if (user && typeof user === "object") {
      const {
        label = "",
        key = "",
        groupName = "",
        type = "",
        status = "active",
      } = user;

      setFormData({ label, key, groupName, type, status });
      console.log("formData updated", { label, key, groupName, type, status });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      type: "global-fields",
      created_by: user?._id || "",
      metadata: {},
    };

    try {
      const response = await putData(`/vendor-fields/${fieldid}`, payload);
      console.log("Updated group response:", response);

      if (response?.status) {
        setSuccess(true);
        toast.success("Global field updated successfully!");
        navigate("/dashboard/modules/globalfields");
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating global field:", error);
      setSuccess(false);
      toast.error("Error updating global field.");
    } finally {
      setLoading(false);
    }
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

  const validateFormField = async (name, value) => {
    const fieldRule = { [name]: rules[name] };
    const fieldData = { [name]: value };
    const validationErrors = await validator.validate(fieldData, fieldRule);
    return validationErrors;
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log("Fetched User Data:", formData);
  }, [formData]);

  return (
    <div>
      {formVisible && (
        <form className="" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Edit Global Field
          </h2>

          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              placeholder=""
              name="label"
              value={formData.label || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("label")} AJ-floating-input`}
            />
            <label className="AJ-floating-label">Label</label>
          </div>

          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              placeholder=""
              name="key"
              value={formData.key}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("key")} AJ-floating-input`}
            />
            <label className="AJ-floating-label">
              Key<span className="text-red-500">*</span>
            </label>
          </div>

          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              placeholder=""
              name="group"
              value={formData.groupName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("groupName")} AJ-floating-input`}
            />
            <label className="AJ-floating-label">
              Group<span className="text-red-500">*</span>
            </label>
          </div>

          <div className="AJ-floating-label-wrapper">
            <input
              type="text"
              placeholder=""
              name="type"
              value={formData.type}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldClassName("type")} AJ-floating-input`}
            />
            <label className="AJ-floating-label">
              Type<span className="text-red-500">*</span>
            </label>
          </div>

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
              <option value="suspended">Suspended</option>
            </select>

            <label className="AJ-floating-label">
              Status <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update
            </button>
          </div>
        </form>
      )}
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default EditUserForm;
