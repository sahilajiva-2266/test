import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Validator from "../../Helpers/validators.js";
import { putData } from "../../Helpers/api.js";
import rules from "./Rules.js";

const EditUserForm = ({ user }) => {
  const navigate = useNavigate();
  const validator = new Validator(rules);

  const initialFormData = {
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    currentaddress: "",
    permanentaddress: "",
    state: "",
    city: "",
    pincode: "",
    joiningDate: "",
    designation: "",
    section: "",
    shift: "",
    role: "",
    aadharcardnumber: "",
    pancard: "",
    accountNumber: "",
    ifscCode: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // ✅ Prefill user data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        gender: user.gender || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        email: user.email || "",
        phone: user.phone || "",
        currentaddress: user.currentaddress || "",
        permanentaddress: user.permanentaddress || "",
        state: user.state || "",
        city: user.city || "",
        pincode: user.pincode || "",
        joiningDate: user.joiningDate ? user.joiningDate.split("T")[0] : "",
        designation: user.designation || "",
        section: user.section || "",
        shift: user.shift || "",
        role: user.role || "",
        aadharcardnumber: user.aadharcardnumber || "",
        pancard: user.pancard || "",
        accountNumber: user.accountNumber || "",
        ifscCode: user.ifscCode || "",
      });
    }
  }, [user]);

  // ✅ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle blur (for inline validation)
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

  const getFieldClassName = (fieldName) =>
    errors[fieldName]
      ? "aj-field-error AJ-floating-input"
      : "AJ-floating-input";

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      if (selectedPhoto) {
        formDataObj.append("photo", selectedPhoto);
      }

      const response = await putData(`/employees/${user._id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === true || response.success === true) {
        toast.success("✅ Employee updated successfully!");
        navigate("/dashboard/users/employees");
      } else {
        toast.error(response.message || "❌ Failed to update employee.");
      }
    } catch (error) {
      console.error("❌ Error updating employee:", error);
      toast.error(error?.response?.data?.message || "Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edituser-outer-section">
      <div className="edituser-inner-section">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-5xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md"
          noValidate
        >
          <h2 className="text-lg font-semibold mb-6 text-gray-800">
            Edit Employee
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* ================= PHOTO ================= */}
            <div className="flex items-center space-x-4 col-span-2 mb-4">
              <div className="w-[132px] h-[170px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src={
                    selectedPhoto
                      ? URL.createObjectURL(selectedPhoto)
                      : user?.photo ||
                      "https://via.placeholder.com/132x170.png?text=Photo"
                  }
                  alt="Passport"
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Update Passport Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedPhoto(e.target.files[0])}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                             file:rounded-lg file:border-0 
                             file:text-sm file:font-semibold 
                             file:bg-blue-50 file:text-blue-700 
                             hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* ================= PERSONAL INFO ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Personal Information
              </h2>
            </div>

            {/* First Name */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("firstName")}
                placeholder=" "
              />
              <label className="AJ-floating-label">First Name *</label>
            </div>

            {/* Last Name */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("lastName")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Last Name *</label>
            </div>

            {/* Gender */}
            <div className="AJ-floating-label-wrapper mb-6">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="AJ-floating-input"
              >
                <option value="" disabled hidden></option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <label className="AJ-floating-label">Gender *</label>
            </div>

            {/* DOB */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("dob")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Date of Birth *</label>
            </div>

            {/* Email */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("email")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Email *</label>
            </div>

            {/* Phone */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("phone")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Phone *</label>
            </div>

            {/* ================= ADDRESS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Address Information
              </h2>
            </div>

            {/* Current Address */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="currentaddress"
                value={formData.currentaddress}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("currentaddress")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Current Address *</label>
            </div>

            {/* Permanent Address */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="permanentaddress"
                value={formData.permanentaddress}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("permanentaddress")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Permanent Address *</label>
            </div>

            {/* State */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("state")}
                placeholder=" "
              />
              <label className="AJ-floating-label">State *</label>
            </div>

            {/* City */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("city")}
                placeholder=" "
              />
              <label className="AJ-floating-label">City *</label>
            </div>

            {/* Pincode */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("pincode")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Pincode *</label>
            </div>

            {/* ================= PROFESSIONAL INFO ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">
                Professional Information
              </h2>
            </div>

            {/* Joining Date */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">Joining Date *</label>
            </div>

            {/* Designation */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">Designation *</label>
            </div>

            {/* Section */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">Section *</label>
            </div>

            {/* Shift */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">Shift *</label>
            </div>

            {/* Role */}
            <div className="AJ-floating-label-wrapper mb-6">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="AJ-floating-input"
              >
                <option value="" disabled hidden></option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="employee">Employee</option>
              </select>
              <label className="AJ-floating-label">Role *</label>
            </div>

            {/* ================= BANKING DETAILS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-2">Banking Details</h2>
            </div>

            {/* Aadhar */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="aadharcardnumber"
                value={formData.aadharcardnumber}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">Aadhar Number *</label>
            </div>

            {/* PAN */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="pancard"
                value={formData.pancard}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">PAN Card *</label>
            </div>

            {/* Account Number */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">Account Number *</label>
            </div>

            {/* IFSC */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className="AJ-floating-input"
              />
              <label className="AJ-floating-label">IFSC Code *</label>
            </div>
          </div>

          {/* ================= SUBMIT ================= */}
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
