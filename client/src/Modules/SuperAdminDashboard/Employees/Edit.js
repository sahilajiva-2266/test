import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Validator from "../../../Helpers/validators.js";
import { putData } from "../../../Helpers/api.js";
import rules from "../Rules.js";

const EditUserForm = ({ user }) => {
  const navigate = useNavigate();
  const validator = new Validator(rules);

  const initialFormData = {
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    currentaddress: "",
    permanentaddress: "",
    state: "",
    city: "",
    pincode: "",
    phone: "",
    joiningDate: "",
    designation: "",
    shift: "",
    department: "",
    section: "",
    rfid: "",
    role: "",
    aadharcardnumber: "",
    pancard: "",
    accountNumber: "",
    ifscCode: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Prefill user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        gender: user.gender || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        email: user.email || "",
        currentaddress: user.currentaddress || "",
        permanentaddress: user.permanentaddress || "",
        state: user.state || "",
        city: user.city || "",
        pincode: user.pincode || "",
        phone: user.phone || "",
        joiningDate: user.joiningDate ? user.joiningDate.split("T")[0] : "",
        designation: user.designation || "",
        shift: user.shift || "",
        department: user.department || "",
        section: user.section || "",
        rfid: user.rfid || "",
        role: user.role || "",
        aadharcardnumber: user.aadharcardnumber || "",
        pancard: user.pancard || "",
        accountNumber: user.accountNumber || "",
        ifscCode: user.ifscCode || "",
      });
    }
  }, [user]);

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
  console.log("🔹 handleSubmit triggered");

  e.preventDefault();
  console.log("🔹 Default form submission prevented");

  setLoading(true);
  console.log("🔹 Loading set to true");

  try {
    console.log("🔹 Current user object:", user);
    console.log("🔹 Checking user._id:", user?._id);
    console.log("🔹 Checking user.employeeId:", user?.employeeId);
    console.log("🔹 Checking user.id:", user?.id);

    const endpoint = `/employee/${user?._id || user?.employeeId}`;
    console.log("🔹 API endpoint being called:", endpoint);

    console.log("🔹 Form data being sent:", formData);

    const response = await putData(endpoint, formData);
    console.log("🔹 API raw response:", response);

    if (response.status === true || response.success === true) {
      console.log("✅ Employee updated successfully, navigating to users list");
      toast.success("✅ Employee updated successfully!");
      navigate("/dashboard/users");
    } else {
      console.log("❌ API returned error response:", response.message);
      toast.error(response.message || "❌ Failed to update employee.");
    }
  } catch (error) {
    console.error("❌ Error updating employee:", error);
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
            Edit Employee
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Passport Photo Upload */}
            <div className="flex items-center space-x-4 col-span-2">
              <div className="w-[132px] h-[170px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                <img
                  src={user?.photo || "https://via.placeholder.com/132x170.png?text=Photo"}
                  alt="Passport"
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Update Passport Size Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
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
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
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
              <label className="AJ-floating-label">
                First Name <span className="text-red-500">*</span>
              </label>
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
              <label className="AJ-floating-label">Last Name</label>
            </div>

            {/* Gender */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("gender")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Gender</label>
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
              <label className="AJ-floating-label">Date of Birth</label>
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
              <label className="AJ-floating-label">
                Email <span className="text-red-500">*</span>
              </label>
            </div>

            {/* ================= CONTACT INFO ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
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
              <label className="AJ-floating-label">Current Address</label>
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
              <label className="AJ-floating-label">Permanent Address</label>
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
              <label className="AJ-floating-label">State</label>
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
              <label className="AJ-floating-label">City</label>
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
              <label className="AJ-floating-label">Pincode</label>
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
              <label className="AJ-floating-label">Phone</label>
            </div>

            {/* ================= PROFESSIONAL INFO ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
            </div>

            {/* Joining Date */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("joiningDate")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Joining Date</label>
            </div>

            {/* Designation */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("designation")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Designation</label>
            </div>

            {/* Shift */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("shift")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Shift</label>
            </div>

            {/* Department */}
            <div className="AJ-floating-label-wrapper mb-6">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("department")}
              >
                <option value="" disabled hidden></option>
                <option value="Plumber">Plumber</option>
                <option value="Assembler">Assembler</option>
                <option value="Welder">Welder</option>
              </select>
              <label className="AJ-floating-label">Department</label>
            </div>

            {/* Section */}
            <div className="AJ-floating-label-wrapper mb-6">
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("section")}
              >
                <option value="" disabled hidden></option>
                <option value="Welding">Welding</option>
                <option value="Electrical">Electrical</option>
                <option value="Assembly">Assembly</option>
              </select>
              <label className="AJ-floating-label">Section</label>
            </div>

            {/* RFID */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="number"
                name="rfid"
                value={formData.rfid}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("rfid")}
                placeholder=" "
              />
              <label className="AJ-floating-label">RFID</label>
            </div>

            {/* Role */}
            <div className="AJ-floating-label-wrapper mb-6">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("role")}
              >
                <option value="" disabled hidden></option>
                <option value="SuperAdmin">SuperAdmin</option>
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
              </select>
              <label className="AJ-floating-label">Role</label>
            </div>

            {/* ================= BANKING DETAILS ================= */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4">Banking Details</h2>
            </div>

            {/* Aadhar */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="aadharcardnumber"
                value={formData.aadharcardnumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("aadharcardnumber")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Aadhar Card</label>
            </div>

            {/* PAN */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="pancard"
                value={formData.pancard}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("pancard")}
                placeholder=" "
              />
              <label className="AJ-floating-label">PAN Card</label>
            </div>

            {/* Account Number */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("accountNumber")}
                placeholder=" "
              />
              <label className="AJ-floating-label">Account Number</label>
            </div>

            {/* IFSC */}
            <div className="AJ-floating-label-wrapper mb-6">
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("ifscCode")}
                placeholder=" "
              />
              <label className="AJ-floating-label">IFSC Code</label>
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
