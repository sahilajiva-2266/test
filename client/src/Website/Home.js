import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="AJ-home-main-section">
      <div className="flex flex-col justify-center bg-gradient-to-br from-blue-50 to-white text-gray-800">
        {/* Navigation Bar */}
        <nav
          className="  w-full p-5 bg-white shadow gap-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 items-center !justify-between homepage-nav-bar"
          style={{ padding: "10px" }}
        >
          {/* <h1 className="text-2xl font-bold text-blue-700">Inout360</h1> */}
          <img src="https://assets.pidilite.com/is/image/pidilite/pidilite-logo-1?ts=1717678989820&dpr=off" alt="Pidilite-logo" className="h-auto w-34" />
          <div className="  flex flex-col gap-3 sm:flex-row sm:gap-4 justify-end homepage-nav-bar-login-register-button">
            <button
              onClick={() => navigate("/app-qr")}
              className="border border-blue-600 text-blue-600 rounded hover:bg-blue-100 transition !mr-0 !py-1.5 !px-5"
              style={{ padding: "6px" }}
            >
              App Download QR
            </button>
            <button
              onClick={() => navigate("/qr-login")}
              className="border border-blue-600 text-blue-600 rounded hover:bg-blue-100 transition !mr-0 !py-1.5 !px-5"
              style={{ padding: "6px" }}
            >
              QR
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("accesstoken");
                localStorage.removeItem("refreshtoken");
                Cookies.remove("accesstoken");
                Cookies.remove("refreshtoken");
                navigate("/login");
              }}
              className="bg-blue-600 text-white rounded hover:bg-blue-700 transition !py-1.5 !px-5 !m-0"
            // style={{ padding: "6px" }}
            >
              Login
            </button>

            {/* <button
              onClick={() => navigate("/register")}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition"
              style={{ padding: "6px" }}
            >
              Register
            </button> */}
          </div>
        </nav>

        {/* Hero Section */}
        <main
          className="h-screen flex container m-auto flex-col md:flex-row items-center  px-8 md:px-20 py-20 homepage-main-box"
          style={{ margin: "auto" }}
        >
          <div className="md:w-1/2 text-center md:text-left homepage-heading">
            <h2 className="text-4xl md:text-5xl sm:text-2xl font-bold text-blue-700 mb-6 py-5">
              Contractor Workforce Entry Management Process.</h2>
            <p className="text-lg text-gray-700 mb-6">
              To streamline and monitor the attendance, movement, and deployment of contractor
              students, teachers, parents, finances, and more—all from a single
              platform.
            </p>
            <div className="Designation-section flex gap-5 !px-0 !mt-5 homepage-getstart-learnmore-button">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white !px-5 py-3 rounded-lg hover:bg-blue-700 transition"
                style={{ padding: "6px" }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-100 transition"
                style={{ padding: "6px" }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Illustration or Image */}
          <div className="mt-10 md:mt-0 md:w-1/2 homepage-storyset-imag-box">
            <img
              src="https://img.freepik.com/free-vector/education-concept-illustration_114360-6310.jpg"
              alt="School Management Illustration"
              className="w-full max-w-md mx-auto homepage-storyset-image"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-500 py-6 border-t mt-auto">
          © {new Date().getFullYear()} AjvalInfotech Pvt Ltd
        </footer>
      </div>
    </div>
  );
};

export default Home;
