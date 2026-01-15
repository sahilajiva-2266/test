import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, postData } from "../Helpers/api.js";
import { toast } from "react-toastify";

const GetOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail") || "";

  useEffect(() => {
    if (!email) {
      navigate("/forgotpassword");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }

    try {
      const result = await postData(API.auth.verifyOtp, {
        email,
        otp: otp.trim(),
      });

      if (result && result.status === true) {
        const successMessage = result.message || "OTP verified.";
        setMessage(successMessage);
        toast.success(successMessage);
        navigate("/resetpassword");
      } else {
        const errorMessage = result.message || "Invalid OTP. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      const fallbackMessage = "An error occurred. Please try again.";
      setError(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Verify OTP</h2>
        <p className="auth-subtitle">
          Enter the OTP sent to your registered email.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-item">
            <input
              type="text"
              name="otp"
              value={otp}
              autoComplete="off"
              onChange={(e) => setOtp(e.target.value)}
              className={error ? "field-error" : "field"}
              placeholder=" "
            />
            <label>OTP</label>

            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="primary-btn">
            Verify OTP
          </button>

          {message && <div className="message-section">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default GetOtp;
