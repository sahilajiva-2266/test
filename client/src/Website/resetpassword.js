import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, postData } from "../Helpers/api.js";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // 👁 icons

const ResetPassword = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // 👁 show/hide state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!email) navigate("/forgotpassword");
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // 🔹 confirm password match 
      if (
        name === "confirmPassword" &&
        updated.newPassword === value
      ) {
        setErrors((prevErr) => ({ ...prevErr, confirmPassword: "" }));
      }

      // 🔹 new password confirm error  
      if (
        name === "newPassword" &&
        updated.confirmPassword &&
        updated.confirmPassword === value
      ) {
        setErrors((prevErr) => ({ ...prevErr, confirmPassword: "" }));
      }

      return updated;
    });
  };


  const validate = () => {
    const err = {};
    if (!formData.newPassword) {
      err.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      err.newPassword = "Minimum 6 characters required";
    }

    if (!formData.confirmPassword) {
      err.confirmPassword = "Confirm password is required";
    } else if (formData.confirmPassword !== formData.newPassword) {
      err.confirmPassword = "Passwords do not match";
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    try {
      const res = await postData(API.auth.resetPassword, {
        email,
        newPassword: formData.newPassword,
      });

      if (res?.status) {
        toast.success(res.message || "Password reset successful");
        sessionStorage.removeItem("resetEmail");
        navigate("/login", { replace: true });
      } else {
        setMessage(res?.message || "Reset failed");
      }
    } catch {
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Create a new secure password</p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="field password-field">
            <label>New Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "error" : ""}
              />
              <span
                className="toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {errors.newPassword && (
              <span className="error-text">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field password-field">
            <label>Confirm Password</label>
            <div className="password-input">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
              />
              <span
                className="confirm-toggle-icon"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="reset-btn">
            Reset Password
          </button>

          {message && <div className="info-text">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
