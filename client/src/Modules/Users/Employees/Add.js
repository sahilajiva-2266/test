import React, { useState, useEffect } from "react";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API, getData } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import rules from "../Rules.js";

const AddUserForm = () => {
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
    location: "",
    aadharcardnumber: "",
    pancard: "",
    accountNumber: "",
    ifscCode: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]); // New state for businesses
  const [locations, setLocations] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
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
      console.log("📦 Submitting employee data:", formData);

      const payload = profileImageFile
        ? (() => {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
              data.append(key, value ?? "");
            });
            data.append("profileImage", profileImageFile);
            return data;
          })()
        : formData;

      // ✅ Use the employee add endpoint here
      const result = await API.add("employees/add", payload);

      console.log("✅ API Response------>:", result);

      if (result.status === true || result.success === true) {
        toast.success("✅ Employee created successfully!");
        setFormData(initialFormData);
        setProfileImageFile(null);
        setProfileImagePreview("");
      } else {
        toast.error(result.message || "❌ Failed to create employee.");
      }
    } catch (error) {
      console.error("❌ Error creating employee:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImageFile]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getData("/location");
        setLocations((res?.locations || []).map((loc) => loc.name).filter(Boolean));
      } catch (_err) {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileImageFile(file);
  };

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
                Add New Employee
              </h2>
            </div>

            {/* FORM GRID: 2 columns on medium+ screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Passport Size Photogaph */}
              <div className="flex items-center space-x-4">
                <div className="w-[132px] h-[170px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                  <img
                    src={
                      profileImagePreview ||
                      "https://via.placeholder.com/132x170.png?text=Photo"
                    }
                    alt="Passport"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload Passport Size Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
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
                <h2 className="text-lg font-semibold mb-4">
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
                  className={`${getFieldClassName(
                    "first_name"
                  )} AJ-floating-input`}
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
                  className={`${getFieldClassName(
                    "lastName"
                  )} AJ-floating-input`}
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
                  className={`${getFieldClassName("gender")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Gender</label>
              </div>

              {/* Date of Birth */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("dob")} AJ-floating-input`}
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
                  className={`${getFieldClassName("email")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Email <span className="text-red-500">*</span>
                </label>
              </div>

              {/* ================= CONTACT INFO ================= */}
              <div className="col-span-2">
                <h2 className="text-lg font-semibold mb-4">
                  Contact Information
                </h2>
              </div>

              {/* Address */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="currentaddress"
                  value={formData.currentaddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "currentaddress"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Curent Address</label>
              </div>

              {/* Address */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="permanentaddress"
                  value={formData.permanentaddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "address"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Permanent Address</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "address"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">State</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("city")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">City</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "pincode"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Pincode</label>
              </div>

              {/* Phone Number */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("phone")} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">
                  Phone Number <span className="text-red-500">*</span>
                </label>
              </div>

              {/* ================= PROFESSIONAL INFO ================= */}
              <div className="col-span-2">
                <h2 className="text-lg font-semibold mb-4">
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
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "joiningDate"
                  )} AJ-floating-input`}
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
                  className={`${getFieldClassName(
                    "designation"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Designation</label>
              </div>

              {/* Shift */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("shift")} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                <label className="AJ-floating-label">Shift</label>
              </div>

              {/* Department */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "department"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Art & Craft">Art & Craft</option>
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
                  className={`${getFieldClassName(
                    "section"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="A">Welding</option>
                  <option value="B">Electrical</option>
                  <option value="C">Assembly</option>
                  <option value="D"></option>
                </select>
                <label className="AJ-floating-label">Section</label>
              </div>

              {/* Employment Type */}
              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "employmentType"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Intern">Intern</option>
                  <option value="Contract Basis">Contract Basis</option>
                </select>
                <label className="AJ-floating-label">Employment Type</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="number"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "shirfidft"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Rfid</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "section"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  <option value="A">SuperAdmin</option>
                  <option value="B">admin</option>
                  <option value="C">employee</option>
                </select>
                <label className="AJ-floating-label">Role</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "location"
                  )} AJ-floating-input`}
                >
                  <option value="" disabled hidden></option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <label className="AJ-floating-label">Location</label>
              </div>

              {/* ================= BANKING DETAILS ================= */}
              <div className="col-span-2">
                <h2 className="text-lg font-semibold mb-4">Banking Details</h2>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="aadharcardnumber"
                  value={formData.aadharcardnumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "aadharcardnumber"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Aaadhar Card</label>
              </div>

              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="pancard"
                  value={formData.pancard}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "pancard"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Pancard</label>
              </div>

              {/* Example: Account Number */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "accountNumber"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">Account Number</label>
              </div>

              {/* Example: IFSC Code */}
              <div className="AJ-floating-label-wrapper mb-6">
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "ifscCode"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                <label className="AJ-floating-label">IFSC Code</label>
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
