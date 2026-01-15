import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { encryptData, decryptData } from "../../Helpers/encryptionHelper";
const domainpath = "http://localhost:5000";

const LoginForm = () => {
  const [userData, setUserdata] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [emailTouched, setEmailTouched] = useState(false); // to track if onBlur is triggered

  const Handlechange = (e) => {
    const { name, value } = e.target;
    setUserdata({ ...userData, [name]: value });
  };
  const HandleEmailBlur = () => {
    setEmailTouched(true); // Mark that email input was touched
    const emailError = validateEmail(userData.email);
    setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
  };
  // const HandleEmailFocus = () => {
  //   setEmailFocused(true); // Mark that email input is focused
  //   setErrors((prevErrors) => ({ ...prevErrors, email: null })); // Clear error on focus
  // };
  const Handlesubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateform(userData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      await sendData(userData);
      console.log("form submitted successfully", userData);
    } else {
      console.log("form submittion failed", errors);
    }
  };
  const validateEmail = (email) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email is invalid";
    }
    return null;
  };
  const validateform = (userData) => {
    const errors = {};
    const emailError = validateEmail(userData.email);
    if (emailError) errors.email = emailError;

    if (!userData.password) {
      errors.password = "Password is required";
    } else if (userData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    return errors;
  };

  const sendData = async (data) => {
    try {
      const response = await fetch(`${domainpath}/api/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json(); // parse the response

      // Log the status and message based on the response
      if (response.status === 200) {
        console.log("200 OK: Login successful", result);
        Cookies.set("accesstoken", result.accessToken);
        Cookies.set("userdetail", encryptData(result));
        localStorage.setItem("accesstoken", result.accessToken);
        localStorage.setItem("userdetail", encryptData(result));
        // Navigate or handle login success here

        navigate("/dashboard"); // redirect after successful login
      } else if (response.status === 201) {
        response.message("Login Succesfully");

        // Handle login success
      } else if (response.status === 400) {
        console.log("400 Bad Request: Login failed", result);
        alert("Login failed: " + result.message); // Show the error message
      } else {
        console.log(`${response.status} Error: Something went wrong`, result);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="main-inner">
      <div className="sections">
        <div className="left-section"></div>
        <div className="right-section">
          <div className="form-justification">
            <form onSubmit={Handlesubmit}>
              <div className="inside-form">
                <h2>Login Here</h2>
                <div className="email-section">
                  <div className="mid-section">
                    <label className="email" htmlFor="email">
                      Email/Phone
                    </label>
                    <br />
                  </div>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    required
                    onChange={Handlechange}
                    onBlur={HandleEmailBlur} // Trigger validation on blur
                    // onFocus={HandleEmailFocus} // Clear the red border on focus
                    value={userData.email}
                    className={`input-field ${emailTouched && errors.email ? "error-border" : ""
                      }`} // Conditionally apply red border
                  />
                  <div>
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>
                <div className="email-section">
                  <div className="mid-section">
                    <label className="email" htmlFor="password">
                      Password
                    </label>
                    <br />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    onChange={Handlechange}
                    value={userData.password}
                  />
                  {/* <span
                    role="img"
                    aria-label="eye-invisible"
                    tabindex="-1"
                    class="anticon anticon-eye-invisible ant-input-password-icon"
                  >
                    <svg
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="eye-invisible"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z"></path>
                      <path d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z"></path>
                    </svg>
                  </span> */}

                  <div>
                    {errors.password && (
                      <span className="error-message">{errors.password}</span>
                    )}
                  </div>
                </div>
                <div className="side-section">
                  <div className="remember-me-container">
                    <input type="checkbox" className="checkbox" />
                    <div>Remember Me</div>
                  </div>

                  <div className="empty">kgjitg</div>
                  <div className="forgot-section">
                    <a href="/forgotpassword" className="forgot-password">
                      Forgot Password?
                    </a>
                  </div>
                </div>
                <div className="last-section">
                  <div className="button-section">
                    <button type="submit">Login</button>
                  </div>
                </div>
                <div className="divider">
                  <span className="line"></span>
                  <span className="text">OR</span>
                  <span className="line"></span>
                </div>
                <div className="last-section">
                  <div className="last-line">Don't have an account?</div>
                  <div className="alphabet">
                    <a href="register" className="forgot-password">
                      Register
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
