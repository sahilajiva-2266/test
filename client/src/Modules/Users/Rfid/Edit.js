import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Validator from "../../../Helpers/validators.js";
import { getData, putData } from "../../../Helpers/api.js";
import rules from "../Rules.js";

const EditUserForm = ({ user }) => {
  const userId = user;
  const [formData, setFormData] = useState({
    uid: "",
    employeeId: "",
    issuedAt: "",
    isActive: "",
    lostOrReplaced: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validator = new Validator(rules);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userdata = await getData(`/rfid/${userId}`);
        if (userdata) {
          setFormData({
            uid: userdata.uid || "",
            employeeId: userdata.employeeId || "",
            issuedAt: userdata.issuedAt || "",
            isActive: userdata.isActive?.toString() || "",
            lostOrReplaced: userdata.lostOrReplaced?.toString() || "",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
        toast.error("Failed to fetch RFID data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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
      const payload = {
        ...formData,
        isActive: formData.isActive === "true",
        lostOrReplaced: formData.lostOrReplaced === "true",
      };

      const response = await putData(`/rfid/${userId}`, payload);
      toast.success("✅ RFID updated successfully!");
      navigate("/dashboard/rfid");
    } catch (error) {
      console.error("❌ Error updating RFID:", error);
      toast.error("Error updating RFID.");
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
                Edit RFID
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
                {loading ? "Updating..." : "Update"}
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

export default EditUserForm;
