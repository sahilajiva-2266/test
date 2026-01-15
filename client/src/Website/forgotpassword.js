import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, postData } from "../Helpers/api.js";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [userData, setUserdata] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ email: false });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email is invalid.";
    }
    return null;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });

    if (name === "email") {
      const emailError = validateEmail(userData.email);
      setErrors({ ...errors, email: emailError });
    }
  };
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserdata({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    // Validate form before making the API request
    const validationErrors = {};
    const emailError = validateEmail(userData.email);
    if (emailError) validationErrors.email = emailError;
    setErrors(validationErrors);

    // If there are errors, stop form submission
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      // Log request data before sending the API request
      console.log("Request data:", { email: userData.email });

      // Send request to API
      const result = await postData(API.auth.forgotPassword, {
        email: userData.email,
      });

      // Log the response from the API for debugging
      console.log("API response:", result);

      // Check if the result contains the expected response format
      if (result && result.status === true) {
        const successMessage = result.message || "OTP sent successfully.";
        setMessage(successMessage);
        toast.success(successMessage);
        sessionStorage.setItem("resetEmail", userData.email);
        navigate("/getotp"); // Redirect to OTP page
      } else {
        const errorMessage =
          result.message || "Failed to send OTP. Please try again.";
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("API Error:", error); // Log the actual error for debugging
      const fallbackMessage = "An error occurred. Please try again.";
      setMessage(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Forgot your password?</h2>
        <p className="auth-subtitle">
          Enter your registered email to receive OTP
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-item">
            <input
              type="text"
              name="email"
              value={userData.email}
              autoComplete="off"
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getFieldClassName("email")}
              placeholder=" "
            />
            <label>Email address</label>

            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <button type="submit" className="primary-btn">
            Get OTP
          </button>

          {message && (
            <div className="message-section">{message}</div>
          )}
        </form>
      </div>
    </div>
  );

};

export default ForgotPassword;
