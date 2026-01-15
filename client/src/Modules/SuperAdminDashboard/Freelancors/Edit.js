import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // To extract the user ID from the URL
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Validator from "../../helpers/validators.js";
import { getData, putData } from "../../helpers/api.js";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import rules from "./Rules.js";
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing password

const EditUserForm = ({ user }) => {
  let userId = user;
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    // password: "",
    role: "",
    status: "", // Add status here
  });

  // Fetch user data based on userId when the Component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Use your getData function to fetch user data
        const userdata = await getData(`/user/${userId}`); // API endpoint to get user by ID
        if (userdata) {
          setFormData({
            first_name: userdata.first_name || "",
            last_name: userdata.last_name || "",
            email: userdata.email || "",
            phone: userdata.phone || "",
            // password: "",
            role: userdata.role || "",
            status: userdata.status || "", // Populate status
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]); // Re-run when userId changes
  const validator = new Validator(rules);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password) {
      const hashedPassword = bcrypt.hashSync(formData.password, 10); // Hashing password with a salt rounds of 10
      setFormData({ ...formData, password: hashedPassword }); // Update formData with hashed password
    }

    try {
      const response = await putData(`/user/${userId}`, formData); // Assuming PUT request to update
      setSuccess(true);
      toast.success("User updated successfully!");
      navigate("/dashboard/getusers"); // Redirect to user list page after success
    } catch (error) {
      setSuccess(false);
      toast.error("Error updating user.");
    } finally {
      setLoading(false);
    }
  };
  const [formVisible, setFormVisible] = useState(true); // State to control form visibility
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    first_name: false,
    email: false,
    phone: false,
    // password: false,
    role: false,
    status: false,
  });
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div>
      {formVisible && (
        <div className="adduser-outer-section">
          <div className="adduser-inner-section">
            <div className="adduser-form-section">
              <form
                className="aj-crm-adding w-full max-w-lg mx-auto mt-8"
                onSubmit={handleSubmit}
              >
                <h2 className=" text-xl font-semibold mb-6 text-gray-800 ">
                  Edit User
                </h2>

                {/* First Name */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("first_name")}
                  />
                  <label className="text-sm text-#000-200">
                    First Name<span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Last Name */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("last_name")}
                  />
                  <label className="text-sm text-#000-500">Last Name</label>
                </div>

                {/* Email */}
                <div className="first-left form-item">
                  <input
                    type="text"
                    placeholder=""
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("email")}
                  />
                  <label className="block text-sm text-#000-500">
                    Email<span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Phone */}
                <div className="first-left form-item">
                  <input
                    type="number"
                    placeholder=""
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("phone")}
                  />
                  <label className="block text-sm text-#000-500">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Password */}
                {/* <div className="first-left form-item">
                <input
                  type="password"
                  placeholder=""
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                
                  className={getFieldClassName("password")}
                />
                <label className="block text-sm text-#000-500">
                  Password<span className="text-red-500">*</span>
                </label>
              </div> */}

                {/* Role */}
                <div className="select-option-dropdown first-left form-item">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("role")}
                  >
                    <option value="">select an option</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </select>
                  <span className="dropdown-icon">▼</span>
                  <label className={formData.role ? "selected" : ""}>
                    Role <span className="text-red-500">*</span>
                  </label>
                </div>
                {/* Status Dropdown */}
                <div className="select-option-dropdown first-left form-item">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <span className="dropdown-icon">▼</span>
                  <label className={formData.status ? "selected" : ""}>
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <button
                    type="rsesetpassword"
                    className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Reset Password
                  </button>
                  <button
                    type="submit"
                    className="upclick px-4 mt-5 py-2 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
