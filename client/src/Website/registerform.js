import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { postData } from "../Helpers/api";
import Validator from "../Helpers/validators.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "../Images/register.jpg";

const Registerpage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialUserData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmpassword: "",
    role: "",
    rememberMe: false,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const rules = {
    first_name: {
      required: true,
      type: "string",
      errorMessage: "First name is required.",
    },
    last_name: {
      required: true,
      type: "string",
      errorMessage: "Last name is required.",
    },
    email: {
      required: true,
      type: "string",
      errorMessage: "Email is required.",
    },
    phone: {
      required: true,
      type: "string",
      errorMessage: "Phone is required.",
    },
    password: {
      required: true,
      type: "string",
      errorMessage: "Password is required.",
    },
    confirmpassword: {
      required: true,
      type: "string",
      errorMessage: "Confirm password is required.",
    },
    role: { required: true, type: "string", errorMessage: "Role is required." },
  };

  const validator = new Validator(rules);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({ ...userData, [name]: type === "checkbox" ? checked : value });
  };

  // Validate a single field on blur
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    const fieldErrors = await validator.validateFormField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
  };

  // Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate(userData);
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
      console.log("Submitting data:", userData);
      const result = await postData("/user", userData);
      console.log("API Response:", result);

      if (result.status === true) {
        // Store tokens in local storage and cookies
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("user", JSON.stringify(result.user));

        Cookies.set("accessToken", result.accessToken, { expires: 7 });
        Cookies.set("refreshToken", result.refreshToken, { expires: 7 });

        toast.success("User created successfully!");
        setUserData(initialUserData); // Reset form
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        "An error occurred while creating the user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="main-inner login-page">
        <div className="sections">
          <div className="left-section">
            <img width="100%" src={Register} alt="Register" />
          </div>
          <div className="right-section">
            <div className="form-justification">
              <form onSubmit={handleSubmit}>
                <h2>Register Yourself Here</h2>
                <div className="login-section">
                  <div className="form">
                    {[
                      { name: "first_name", label: "First Name", type: "text" },
                      { name: "last_name", label: "Last Name", type: "text" },
                      { name: "phone", label: "Phone", type: "text" },
                      { name: "email", label: "Email", type: "text" },
                      { name: "password", label: "Password", type: "password" },
                      {
                        name: "confirmpassword",
                        label: "Confirm Password",
                        type: "password",
                      },
                    ].map(({ name, label, type }) => (
                      <div className="form-item" key={name}>
                        <input
                          type={type}
                          name={name}
                          value={userData[name]}
                          autoComplete="off"
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={errors[name] ? "field-error" : "field"}
                          placeholder=""
                        />
                        <label htmlFor={name}>{label}</label>
                      </div>
                    ))}

                    {/* Role Selection */}
                    <div className="form-item">
                      <select
                        name="role"
                        value={userData.role}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={errors.role ? "field-error" : "field"}
                      >
                        <option value="" disabled>
                          Select Role
                        </option>
                        <option value="super_admin">Super_Admin</option>
                        <option value="admin">Admin</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                      </select>
                      <label className={userData.role ? "selected" : ""}>
                        Role <span className="text-red-500">*</span>
                      </label>
                    </div>

                    {/* Remember Me & Sign-in */}
                    <div className="side-section">
                      <div className="remember-me-container">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={userData.rememberMe}
                          onChange={handleInputChange}
                        />
                        <div>Remember Me</div>
                      </div>
                      <div className="forgot-section">
                        <a href="/login" className="forgot-password">
                          Sign in
                        </a>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="last-section">
                      <button
                        className="button-section"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Registering..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </>
  );
};

export default Registerpage;
