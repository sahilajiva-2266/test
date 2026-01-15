import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { API } from "../Helpers/api.js";
import Validator from "../Helpers/validators.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import securelogin from "../Images/secure-login.png";
import { useUser } from "../Helpers/Context/UserContext.js";

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
    const validationErrors = await validator.validate(fieldData, fieldRule);
    return validationErrors;
  };

  const validateform = async (formData) => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length > 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserdata({
      ...userData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = await validateFormField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validationErrors = await validateform(userData);
      if (validationErrors) {
        setLoading(false);
        return;
      }
      await sendData(userData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const sendData = async (formData) => {
    try {
      const result = await API.login(formData); // Axios response
      console.log("✅ Raw API result:", result);

      // Response is directly the user object
      const user = result.data;

      if (user?.accessToken && user?.refreshToken) {
        const { accessToken, refreshToken, ...userInfo } = user;

        // 🔐 Store tokens
        localStorage.setItem("accesstoken", accessToken);
        localStorage.setItem("refreshtoken", refreshToken);
        Cookies.set("accesstoken", accessToken);
        Cookies.set("refreshtoken", refreshToken);

        // 👤 Store full name (combine first + last name)
        const fullName = `${userInfo.firstName || ""} ${userInfo.lastName || ""
          }`.trim();
        if (fullName) {
          localStorage.setItem("user_fullname", fullName);
          userInfo.fullname = fullName; // add for later use
        }

        // ✅ Store encoded user details
        const encodedUserDetails = encodeData(userInfo);
        Cookies.set("userdetail", encodedUserDetails);

        // 💾 Handle "Remember Me"
        if (formData.rememberMe) {
          localStorage.setItem("email", formData.email);
          localStorage.setItem("password", formData.password);
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        // toast.success("Login successful!");
        setUser(userInfo);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Tokens missing → treat as failed login
        toast.error("Login failed: Tokens are missing in response.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "An error occurred. Please try again."
      );
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setUserdata((prevState) => ({
        ...prevState,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true,
      }));
    }

    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");

    if (accessToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <>
      <div className="main-inner login-page">
        <div className="sections">
          <div className="left-section">
            <div className="left-section-inner">
              <img width="100%" src={securelogin} alt="Secure login" />
            </div>
          </div>
          <div className="right-section">
            <div className="form-justification AJ-section">
              <form onSubmit={handleSubmit}>
                <div className="inside-form">
                  <h2>Login Here</h2>
                  <div className="login-section AJ-login-Form-block">
                    <div className="form">
                      <div className="AJ-floating-label-wrapper">
                        <input
                          type="text"
                          name="email"
                          value={userData.email}
                          autoComplete="off"
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            "email"
                          )} AJ-floating-input`}
                        />
                        <label className="AJ-floating-label">Email</label>
                      </div>

                      <div className="AJ-floating-label-wrapper">
                        <input
                          type="password"
                          name="password"
                          value={userData.password}
                          autoComplete="off"
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            "password"
                          )} AJ-floating-input`}
                        />
                        <label className="AJ-floating-label">Password</label>
                      </div>

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
                          <a href="/forgotpassword" className="forgot-password">
                            Forgot Password?
                          </a>
                        </div>
                      </div>

                      <div className="last-section">
                        <button className="button-section" type="submit">
                          Login
                        </button>
                      </div>

                      <div className="divider">
                        <span className="line"></span>
                        <span className="text">OR</span>
                        <span className="line"></span>
                      </div>

                      <div className="last-section">
                        <div className="last-line">
                          Don't have an account? &nbsp;
                        </div>
                        <div className="alphabet">
                          <a href="register" className="forgot-password">
                            Register
                          </a>
                        </div>
                      </div>
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

export default LoginComponent;
