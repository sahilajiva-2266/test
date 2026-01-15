import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { API, postData } from "../../Helpers/api";
import Validator from "../../Helpers/validators.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import securelogin from "../../Images/secure-login.png";
import { useUser } from "../../Helpers/Context/UserContext.js";
import pidilitelogo from "../../Images/pidilitelogo.png";
import { Eye, EyeOff } from "lucide-react";

const LoginComponent = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [userData, setUserdata] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // 👁 Show / Hide password
  const [showPassword, setShowPassword] = useState(false);

  /* ================= VALIDATION ================= */
  const rules = {
    email: {
      required: true,
      type: "string",
      errorMessage: "Email is required.",
    },
    password: {
      required: true,
      type: "string",
      errorMessage: "Password is required.",
    },
  };

  const validator = new Validator(rules);

  const validateFormField = async (name, value) => {
    const fieldRule = { [name]: rules[name] };
    const fieldData = { [name]: value };
    return await validator.validate(fieldData, fieldRule);
  };

  const validateform = async (formData) => {
    const validationErrors = await validator.validate(formData, rules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return true;
    }
    setErrors({});
    return false;
  };

  /* ================= HANDLERS ================= */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setUserdata({
      ...userData,
      [name]: type === "checkbox" ? checked : value,
    });

    // 🔹 live error clear
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  const encodeData = (data) => btoa(JSON.stringify(data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hasErrors = await validateform(userData);
    if (hasErrors) {
      setLoading(false);
      return;
    }

    await sendData(userData);
    setLoading(false);
  };

  const sendData = async (userData) => {
    try {
      const response = await postData(API.auth.login, userData);

      if (response?.accessToken) {
        const accessToken = response.accessToken;

        localStorage.setItem("accesstoken", accessToken);
        Cookies.set("accesstoken", accessToken);

        Cookies.set("userdetail", encodeData(response));
        setUser(response);

        // Remember Me
        if (userData.rememberMe) {
          localStorage.setItem("email", userData.email);
          localStorage.setItem("password", userData.password);
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        navigate("/dashboard");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  /* ================= ON LOAD ================= */
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setUserdata({
        email: savedEmail,
        password: savedPassword,
        rememberMe: true,
      });
    }

    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");

    if (accessToken) navigate("/dashboard");
  }, [navigate]);

  /* ================= UI ================= */
  return (
    <>
      <div className="main-inner login-page">
        <div className="sections">
          <div className="left-section">
            <img width="100%" src={securelogin} alt="Secure Login" />
          </div>

          <div className="right-section">
            <div className="form-justification AJ-section">
              <form onSubmit={handleSubmit} className="login-form">
                <img
                  className="login-page-logo"
                  width={200}
                  src={pidilitelogo}
                  alt="Logo"
                />

                <h2>Login Here</h2>

                {/* Email */}
                <div className="AJ-floating-label-wrapper">
                  <input
                    type="text"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`${getFieldClassName("email")} AJ-floating-input`}
                  />
                  <label className="AJ-floating-label">Email</label>
                </div>

                {/* Password */}
                <div className="AJ-floating-label-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`${getFieldClassName(
                      "password"
                    )} AJ-floating-input`}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                  <label className="AJ-floating-label">Password</label>
                </div>

                {/* Remember / Forgot */}
                <div className="side-section">
                  <label className="remember-me-container">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={userData.rememberMe}
                      onChange={handleInputChange}
                    />
                    Remember Me
                  </label>

                  <a href="/forgotpassword" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>

                <button className="button-section" type="submit">
                  Login
                </button>
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

export default LoginComponent;
